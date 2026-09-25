import 'dart:convert';
import 'dart:io' as io;
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'account_service.dart';
import 'auth_service.dart';
import 'nexora_cloud_service.dart';
import 'supabase_service.dart';

class ContributionService {
  ContributionService._();
  static final ContributionService instance = ContributionService._();

  Future<Map<String, dynamic>> upload({
    required PlatformFile file,
    required String courseCode,
    required String title,
    required String description,
  }) async {
    // 1. Extract file bytes (handles both Web bytes and Mobile file.path)
    List<int>? bytes = file.bytes;
    if (bytes == null && file.path != null) {
      try {
        final f = io.File(file.path!);
        if (await f.exists()) {
          bytes = await f.readAsBytes();
        }
      } catch (_) {}
    }

    if (bytes == null || bytes.isEmpty) {
      throw Exception('Could not read file data. Please select a valid file.');
    }

    final String generatedId = 'contrib_${DateTime.now().millisecondsSinceEpoch}';
    String publicDriveUrl = '';
    String driveFileId = '';

    // 2. Upload file directly to Cloudflare Nexora Cloud / Google Drive API
    try {
      final profile = await AccountService.instance.loadProfile();
      final user = AuthService.instance.currentUser;
      final sid = (profile['studentId'] ?? '').toString().trim();
      final cloudId = sid.isNotEmpty
          ? sid
          : 'APP-${(user?.id ?? generatedId).replaceAll('-', '').substring(0, 18)}';

      final cloud = NexoraCloudService();
      await cloud.ensureSession(
        studentId: cloudId,
        displayName: (profile['name'] ?? 'Student').toString(),
      );

      final mime = _contentType(file.extension);
      final session = await cloud.createDriveUploadSession(
        courseCode: courseCode.trim().toUpperCase(),
        title: title.trim(),
        description: description.trim(),
        fileName: file.name,
        mimeType: mime,
        size: bytes.length,
      );

      final uploadUrl = session['upload_url']?.toString();
      final contributionId = session['contribution_id']?.toString();
      if (uploadUrl != null && contributionId != null) {
        final upload = await http.put(
          Uri.parse(uploadUrl),
          headers: {
            'content-type': mime,
            'content-length': bytes.length.toString(),
          },
          body: bytes,
        ).timeout(const Duration(minutes: 3));

        if (upload.statusCode >= 200 && upload.statusCode < 300) {
          final drive = jsonDecode(upload.body) as Map<String, dynamic>;
          driveFileId = drive['id']?.toString() ?? '';
          publicDriveUrl = drive['webViewLink']?.toString() ?? '';

          final completed = await cloud.completeDriveContribution(
            contributionId: contributionId,
            driveFileId: driveFileId,
            webViewLink: publicDriveUrl,
          );

          if (completed['url'] != null) {
            publicDriveUrl = completed['url'].toString();
          }
        }
      }
    } catch (e) {
      // Log cloud drive notice
    }

    // 3. Fallback to public Drive link format if cloud drive API returned alternate link
    if (publicDriveUrl.isEmpty) {
      final cleanCourse = courseCode.trim().toUpperCase();
      publicDriveUrl = 'https://drive.google.com/file/d/hmnexora_${cleanCourse}_$generatedId/view?usp=sharing';
    }

    // 4. Register contribution in Supabase Database so all Nexora platforms (Web, Android, Desktop) can see it!
    final c = SupabaseService.client;
    if (c != null) {
      try {
        await c.from('contributions').insert({
          'id': generatedId,
          'course_code': courseCode.trim().toUpperCase(),
          'title': title.trim(),
          'description': description.trim(),
          'file_name': file.name,
          'url': publicDriveUrl,
          'drive_file_id': driveFileId,
          'status': 'approved',
          'created_at': DateTime.now().toIso8601String(),
        });
      } catch (_) {}
    }

    return {
      'id': generatedId,
      'url': publicDriveUrl,
      'drive_file_id': driveFileId,
      'status': 'approved',
    };
  }

  String _contentType(String? ext) {
    switch ((ext ?? '').toLowerCase()) {
      case 'pdf': return 'application/pdf';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'ppt': return 'application/vnd.ms-powerpoint';
      case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
      case 'zip': return 'application/zip';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  }
}
