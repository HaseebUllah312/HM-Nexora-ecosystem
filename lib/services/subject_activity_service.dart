import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'account_service.dart';
import 'supabase_service.dart';

class SubjectActivityItem {
  final String id;
  final String courseCode;
  final String title;
  final String type;
  final DateTime dueDate;
  final String creatorName;
  final bool hasSolution;
  final String? solutionUrl;
  final String? solutionTitle;

  SubjectActivityItem({
    required this.id,
    required this.courseCode,
    required this.title,
    required this.type,
    required this.dueDate,
    this.creatorName = 'Nexora Scholar',
    this.hasSolution = false,
    this.solutionUrl,
    this.solutionTitle,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'courseCode': courseCode,
    'title': title,
    'type': type,
    'dueDate': dueDate.toIso8601String(),
    'creatorName': creatorName,
    'hasSolution': hasSolution,
    'solutionUrl': solutionUrl,
    'solutionTitle': solutionTitle,
  };

  factory SubjectActivityItem.fromJson(Map<String, dynamic> json) => SubjectActivityItem(
    id: json['id'] as String? ?? '',
    courseCode: json['courseCode'] as String? ?? '',
    title: json['title'] as String? ?? '',
    type: json['type'] as String? ?? 'Assignment',
    dueDate: DateTime.tryParse(json['dueDate'] as String? ?? '') ?? DateTime.now(),
    creatorName: json['creatorName'] as String? ?? 'Nexora Scholar',
    hasSolution: json['hasSolution'] as bool? ?? false,
    solutionUrl: json['solutionUrl'] as String?,
    solutionTitle: json['solutionTitle'] as String?,
  );
}

class SubjectActivityService {
  SubjectActivityService._();
  static final SubjectActivityService instance = SubjectActivityService._();

  static const String _verifiedCoursesKey = 'nx_verified_lms_courses';
  static const String _isLmsVerifiedKey = 'nx_is_lms_verified';
  static const String _localActivitiesKey = 'nx_local_subject_activities';

  // --- VULMS Subject Verification Methods ---

  static Future<List<String>> getVerifiedCourses() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList(_verifiedCoursesKey) ?? [];
  }

  static Future<bool> isLmsVerified() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_isLmsVerifiedKey) ?? false;
  }

  static Future<void> saveVerifiedCourses(List<String> courses) async {
    if (courses.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    final current = prefs.getStringList(_verifiedCoursesKey) ?? [];
    final set = Set<String>.from(current);
    for (var c in courses) {
      final clean = c.trim().toUpperCase();
      if (clean.isNotEmpty) set.add(clean);
    }
    final verifiedList = set.toList();
    await prefs.setStringList(_verifiedCoursesKey, verifiedList);
    await prefs.setBool(_isLmsVerifiedKey, true);

    // Sync to Account profile & Cloud Supabase record
    try {
      final currentProfile = await AccountService.instance.loadProfile();
      await AccountService.instance.saveProfile({
        ...currentProfile,
        'enrolledSubjects': verifiedList,
        'isLmsVerified': true,
        'verifiedAt': DateTime.now().toIso8601String(),
      }, sync: true);
    } catch (_) {}
  }

  static Future<bool> canAccessSubjectRoom(String courseCode) async {
    final verified = await getVerifiedCourses();
    final clean = courseCode.trim().toUpperCase();
    if (verified.isEmpty) return true; // If not verified yet, allow general access
    return verified.contains(clean) || clean == 'GENERAL';
  }

  // --- Activity Registration & Solutions ---

  Future<List<SubjectActivityItem>> getActivitiesForSubject(String courseCode) async {
    final cleanCode = courseCode.trim().toUpperCase();
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_localActivitiesKey) ?? [];
    final list = <SubjectActivityItem>[];
    for (var str in raw) {
      try {
        final map = jsonDecode(str) as Map<String, dynamic>;
        final item = SubjectActivityItem.fromJson(map);
        if (item.courseCode.toUpperCase() == cleanCode) {
          list.add(item);
        }
      } catch (_) {}
    }
    return list;
  }

  Future<SubjectActivityItem?> findExistingActivity({
    required String courseCode,
    required String title,
  }) async {
    final list = await getActivitiesForSubject(courseCode);
    final cleanTitle = title.trim().toLowerCase();
    for (var act in list) {
      if (act.title.trim().toLowerCase() == cleanTitle) {
        return act;
      }
    }
    return null;
  }

  Future<void> registerActivity({
    required String courseCode,
    required String title,
    required String type,
    required DateTime dueDate,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_localActivitiesKey) ?? [];
    final newItem = SubjectActivityItem(
      id: DateTime.now().microsecondsSinceEpoch.toString(),
      courseCode: courseCode.trim().toUpperCase(),
      title: title.trim(),
      type: type,
      dueDate: dueDate,
      creatorName: AccountService.instance.userName.isNotEmpty ? AccountService.instance.userName : 'Nexora Scholar',
    );
    raw.add(jsonEncode(newItem.toJson()));
    await prefs.setStringList(_localActivitiesKey, raw);

    // Sync to Supabase if available
    try {
      final client = SupabaseService.client;
      if (client != null) {
        await client.from('subject_activities').insert({
          'course_code': newItem.courseCode,
          'title': newItem.title,
          'type': newItem.type,
          'due_date': newItem.dueDate.toIso8601String(),
          'creator_name': newItem.creatorName,
        });
      }
    } catch (_) {}
  }

  void openSolution(BuildContext context, SubjectActivityItem activity) async {
    if (activity.solutionUrl != null && activity.solutionUrl!.isNotEmpty) {
      final uri = Uri.tryParse(activity.solutionUrl!);
      if (uri != null && await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Solution file is not linked yet.')),
      );
    }
  }

  Future<void> requestSolution({
    required BuildContext context,
    required SubjectActivityItem activity,
  }) async {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('📢 Solution requested for ' + activity.title + '. Scholars notified!'),
        backgroundColor: Colors.indigo,
      ),
    );
  }

  Future<void> submitMemberSolution({
    required String activityId,
    required String courseCode,
    required String activityTitle,
    required String solutionUrl,
    required String solutionTitle,
    String? notes,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_localActivitiesKey) ?? [];
    final updated = <String>[];
    for (var str in raw) {
      try {
        final map = jsonDecode(str) as Map<String, dynamic>;
        if (map['id'] == activityId || (map['courseCode'] == courseCode && map['title'] == activityTitle)) {
          map['hasSolution'] = true;
          map['solutionUrl'] = solutionUrl;
          map['solutionTitle'] = solutionTitle;
        }
        updated.add(jsonEncode(map));
      } catch (_) {
        updated.add(str);
      }
    }
    await prefs.setStringList(_localActivitiesKey, updated);
  }
}
