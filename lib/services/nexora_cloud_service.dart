import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/backend_config.dart';

class NexoraCloudService {
  static String get apiBase => BackendConfig.cloudflareApi;

  static const _tokenKey = 'nx_cloud_token';
  static const _studentKey = 'nx_cloud_student_id';

  Future<String?> _token() async {
    final p = await SharedPreferences.getInstance();
    return p.getString(_tokenKey);
  }

  Future<Map<String, dynamic>> ensureSession({
    required String studentId,
    String displayName = '',
    String semester = '',
    List<String> courses = const [],
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final savedStudent = prefs.getString(_studentKey);
    final savedToken = prefs.getString(_tokenKey);
    if (savedStudent == studentId && savedToken != null && savedToken.isNotEmpty) {
      return {'ok': true, 'token': savedToken};
    }

    final r = await http
        .post(
          Uri.parse('$apiBase/api/v1/session'),
          headers: {'content-type': 'application/json'},
          body: jsonEncode({
            'student_id': studentId,
            'display_name': displayName.isEmpty ? studentId : displayName,
            'semester': semester,
            'courses': courses,
          }),
        )
        .timeout(const Duration(seconds: 15));

    final data = _json(r.body);
    if (r.statusCode < 200 || r.statusCode >= 300 || data['token'] == null) {
      throw Exception(data['error'] ?? 'Nexora session ${r.statusCode}');
    }
    await prefs.setString(_tokenKey, data['token'].toString());
    await prefs.setString(_studentKey, studentId);
    return data;
  }

  Future<Map<String, dynamic>> get(String path) async {
    final token = await _token();
    if (token == null) throw Exception('Nexora Cloud session is not ready.');
    final r = await http.get(
      Uri.parse('$apiBase/api/v1$path'),
      headers: {'authorization': 'Bearer $token'},
    ).timeout(const Duration(seconds: 15));
    final data = _json(r.body);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw Exception(data['error'] ?? 'API ${r.statusCode}');
    }
    return data;
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final token = await _token();
    if (token == null) throw Exception('Nexora Cloud session is not ready.');
    final r = await http.post(
      Uri.parse('$apiBase/api/v1$path'),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 15));
    final data = _json(r.body);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw Exception(data['error'] ?? 'API ${r.statusCode}');
    }
    return data;
  }


  Future<Map<String, dynamic>> put(String path, Map<String, dynamic> body) async {
    final token = await _token();
    if (token == null) throw Exception('Nexora Cloud session is not ready.');
    final r = await http.put(
      Uri.parse('$apiBase/api/v1$path'),
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 15));
    final data = _json(r.body);
    if (r.statusCode < 200 || r.statusCode >= 300) {
      throw Exception(data['error'] ?? 'API ${r.statusCode}');
    }
    return data;
  }

  Future<void> syncSummary(Map<String, dynamic> summary) async {
    await post('/summaries', summary);
  }

  Future<List<dynamic>> files(String code, {bool premium = false}) async {
    final d = await get('/courses/${Uri.encodeComponent(code)}/files${premium ? '?premium=1' : ''}');
    return (d['files'] as List?) ?? const [];
  }

  Future<List<dynamic>> mcqs(String code) async {
    final d = await get('/courses/${Uri.encodeComponent(code)}/mcqs?limit=50');
    return (d['mcqs'] as List?) ?? const [];
  }


  Future<List<dynamic>> reviews(String code) async {
    final d = await get('/courses/${Uri.encodeComponent(code)}/reviews');
    return (d['reviews'] as List?) ?? const [];
  }

  Future<List<dynamic>> youtube(String code) async {
    final d = await get('/courses/${Uri.encodeComponent(code)}/youtube');
    return (d['links'] as List?) ?? const [];
  }

  Future<List<dynamic>> saved() async {
    final d = await get('/saved');
    return (d['items'] as List?) ?? const [];
  }

  Future<String> askAI({required String prompt, String mode = 'chat'}) async {
    final d = await post('/ai', {'mode': mode, 'prompt': prompt, 'content': prompt});
    final result = d['result'];
    if (result is Map) {
      final answer = result['answer'] ?? result['text'] ?? result['message'];
      if (answer != null && answer.toString().trim().isNotEmpty) return answer.toString();
    }
    final answer = d['answer'] ?? d['text'] ?? d['message'];
    if (answer != null && answer.toString().trim().isNotEmpty) return answer.toString();
    throw Exception('AI returned an empty response.');
  }


  Future<Map<String, dynamic>> community(String code) async {
    return get('/courses/${Uri.encodeComponent(code)}/community?limit=50');
  }

  Future<Map<String, dynamic>> postCommunity(String code, String text) async {
    return post('/courses/${Uri.encodeComponent(code)}/community', {'text': text});
  }

  Future<Map<String, dynamic>> cloudSettings() async => get('/settings');

  Future<void> saveCloudSettings(Map<String, dynamic> settings) async {
    await put('/settings', {'settings': settings});
  }

  Future<List<dynamic>> notifications() async {
    final d = await get('/notifications');
    return (d['notifications'] as List?) ?? const [];
  }

  Future<Map<String, dynamic>> createDriveUploadSession({
    required String courseCode,
    required String title,
    required String description,
    required String fileName,
    required String mimeType,
    required int size,
  }) async {
    return post('/contributions/upload-session', {
      'course_code': courseCode,
      'title': title,
      'description': description,
      'file_name': fileName,
      'mime_type': mimeType,
      'size': size,
    });
  }

  Future<Map<String, dynamic>> completeDriveContribution({
    required String contributionId,
    required String driveFileId,
    String webViewLink = '',
  }) async {
    return post('/contributions/complete', {
      'contribution_id': contributionId,
      'drive_file_id': driveFileId,
      'web_view_link': webViewLink,
    });
  }

  Future<bool> health() async {
    try {
      final r = await http.get(Uri.parse('$apiBase/health'))
          .timeout(const Duration(seconds: 8));
      final d = _json(r.body);
      return r.statusCode == 200 && d['ok'] == true;
    } catch (_) {
      return false;
    }
  }

  Map<String, dynamic> _json(String text) {
    try {
      final x = jsonDecode(text);
      return x is Map ? Map<String, dynamic>.from(x) : <String, dynamic>{};
    } catch (_) {
      return <String, dynamic>{};
    }
  }
}
