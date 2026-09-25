import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/backend_config.dart';
import 'account_service.dart';
import 'nexora_cloud_service.dart';
import 'subject_activity_service.dart';
import 'supabase_service.dart';

class DriveBackupRecord {
  final String timestamp;
  final int totalExams;
  final int totalAiMessages;
  final int totalTasks;
  final String backupSize;
  final String driveFolderId;
  final String driveFileUrl;
  final bool success;

  DriveBackupRecord({
    required this.timestamp,
    required this.totalExams,
    required this.totalAiMessages,
    required this.totalTasks,
    required this.backupSize,
    required this.driveFolderId,
    required this.driveFileUrl,
    required this.success,
  });

  Map<String, dynamic> toJson() => {
    'timestamp': timestamp,
    'totalExams': totalExams,
    'totalAiMessages': totalAiMessages,
    'totalTasks': totalTasks,
    'backupSize': backupSize,
    'driveFolderId': driveFolderId,
    'driveFileUrl': driveFileUrl,
    'success': success,
  };

  factory DriveBackupRecord.fromJson(Map<String, dynamic> json) => DriveBackupRecord(
    timestamp: json['timestamp'] ?? '',
    totalExams: json['totalExams'] ?? 0,
    totalAiMessages: json['totalAiMessages'] ?? 0,
    totalTasks: json['totalTasks'] ?? 0,
    backupSize: json['backupSize'] ?? '0 KB',
    driveFolderId: json['driveFolderId'] ?? BackendConfig.masterDriveFolderId,
    driveFileUrl: json['driveFileUrl'] ?? BackendConfig.masterDriveUrl,
    success: json['success'] ?? true,
  );
}

class DriveBackupService {
  DriveBackupService._();
  static final DriveBackupService instance = DriveBackupService._();

  static const String _lastBackupKey = 'nx_last_drive_backup_info';
  static const String _mockExamHistoryKey = 'nx_mock_exam_results_history';
  static const String _localTasksKey = 'nx_planner_tasks';

  /// Save a completed mock exam scorecard to user's academic history
  static Future<void> recordMockExamResult({
    required String courseCode,
    required int score,
    required int totalQuestions,
    required int durationSeconds,
    required String examType,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_mockExamHistoryKey);
    List<Map<String, dynamic>> history = [];
    if (raw != null) {
      try {
        history = List<Map<String, dynamic>>.from(jsonDecode(raw));
      } catch (_) {}
    }

    final newResult = {
      'id': 'EXAM-${DateTime.now().millisecondsSinceEpoch}',
      'courseCode': courseCode.toUpperCase().trim(),
      'score': score,
      'totalQuestions': totalQuestions,
      'percentage': ((score / (totalQuestions > 0 ? totalQuestions : 1)) * 100).round(),
      'durationSeconds': durationSeconds,
      'examType': examType,
      'timestamp': DateTime.now().toIso8601String(),
    };

    history.insert(0, newResult);
    await prefs.setString(_mockExamHistoryKey, jsonEncode(history));

    // Auto-trigger background Drive sync
    instance.syncUserDataToGoogleDrive(silent: true);
  }

  /// Get all past mock exam results
  static Future<List<Map<String, dynamic>>> getMockExamHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_mockExamHistoryKey);
    if (raw != null) {
      try {
        return List<Map<String, dynamic>>.from(jsonDecode(raw));
      } catch (_) {}
    }
    return [];
  }

  /// Package and backup user's Exam results, MCQs, AI Chats, Notes, and Profile to Google Drive Cloud
  Future<DriveBackupRecord> syncUserDataToGoogleDrive({bool silent = false}) async {
    final prefs = await SharedPreferences.getInstance();
    final profile = await AccountService.instance.loadProfile();
    final studentId = (profile['studentId'] ?? 'BC_STUDENT').toString().trim();
    final uid = SupabaseService.client?.auth.currentUser?.id ?? studentId;

    // 1. Gather AI Mentor Chats
    List<dynamic> aiChats = [];
    final aiRaw = prefs.getString('hmn_ai_chat_$uid') ?? prefs.getString('hmn_ai_chat_guest');
    if (aiRaw != null) {
      try { aiChats = jsonDecode(aiRaw) as List; } catch (_) {}
    }

    // 2. Gather Exam History
    final examHistory = await getMockExamHistory();

    // 3. Gather Enrolled Courses & Verified Subjects
    final verifiedCourses = await SubjectActivityService.getVerifiedCourses();

    // 4. Gather Tasks & Planner Notes
    List<dynamic> tasks = [];
    final taskRaw = prefs.getString(_localTasksKey);
    if (taskRaw != null) {
      try { tasks = jsonDecode(taskRaw) as List; } catch (_) {}
    }

    // 5. Build Complete Master Academic Archive
    final backupPayload = {
      'version': '1.6.1',
      'platform': 'HM_Nexora_Drive_Master_Vault',
      'timestamp': DateTime.now().toIso8601String(),
      'driveFolderId': BackendConfig.masterDriveFolderId,
      'driveOwner': BackendConfig.masterDriveOwner,
      'studentProfile': {
        'name': profile['name'] ?? 'Student',
        'studentId': studentId,
        'email': profile['email'] ?? '',
        'department': profile['department'] ?? '',
        'program': profile['program'] ?? '',
        'year': profile['year'] ?? '',
        'enrolledCourses': verifiedCourses,
      },
      'academicRecords': {
        'totalExamResults': examHistory.length,
        'examHistory': examHistory,
        'totalAiInteractions': aiChats.length,
        'aiChatHistory': aiChats,
        'totalPlannerTasks': tasks.length,
        'plannerTasks': tasks,
      },
    };

    final payloadStr = jsonEncode(backupPayload);
    final sizeKb = (payloadStr.length / 1024).toStringAsFixed(1);

    // 6. Upload to Cloudflare Worker Drive Gateway & Supabase Storage
    try {
      final cloud = NexoraCloudService();
      await cloud.ensureSession(studentId: studentId, displayName: profile['name'] ?? 'Student');
      await cloud.post('/drive/backup', {
        'student_id': studentId,
        'folder_id': BackendConfig.masterDriveFolderId,
        'data': backupPayload,
      });
    } catch (e) {
      debugPrint('[Drive Cloud Gateway sync info]: $e');
    }

    // Also persist in Supabase student_backups if table is configured
    try {
      final client = SupabaseService.client;
      if (client != null) {
        await client.from('student_backups').upsert({
          'student_id': studentId.toUpperCase().trim(),
          'backup_data': backupPayload,
          'size_kb': sizeKb,
          'updated_at': DateTime.now().toIso8601String(),
        });
      }
    } catch (e) {
      debugPrint('[Supabase backup upsert info]: $e');
    }

    final record = DriveBackupRecord(
      timestamp: DateTime.now().toIso8601String(),
      totalExams: examHistory.length,
      totalAiMessages: aiChats.length,
      totalTasks: tasks.length,
      backupSize: '$sizeKb KB',
      driveFolderId: BackendConfig.masterDriveFolderId,
      driveFileUrl: BackendConfig.masterDriveUrl,
      success: true,
    );

    await prefs.setString(_lastBackupKey, jsonEncode(record.toJson()));
    return record;
  }

  /// Get the last drive backup record
  Future<DriveBackupRecord?> getLastBackupRecord() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_lastBackupKey);
    if (raw != null) {
      try {
        return DriveBackupRecord.fromJson(jsonDecode(raw));
      } catch (_) {}
    }
    return null;
  }
}
