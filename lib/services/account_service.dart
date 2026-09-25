import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'nexora_cloud_service.dart';
import 'supabase_service.dart';

class AccountService {
  bool get isOwner =>
      (SupabaseService.client?.auth.currentUser?.email?.toLowerCase().contains('haseeb') ?? false) ||
      (SupabaseService.client?.auth.currentUser?.email?.toLowerCase().contains('owner') ?? false) ||
      (SupabaseService.client?.auth.currentUser?.email?.toLowerCase().contains('admin') ?? false);

  String get userName {
    final meta = SupabaseService.client?.auth.currentUser?.userMetadata ?? {};
    final n = (meta['name'] ?? '').toString().trim();
    return n.isNotEmpty ? n : 'Nexora Scholar';
  }

  AccountService._();
  static final AccountService instance = AccountService._();

  static const _profileKey = 'hmn_profile';
  static const _settingsKey = 'hmn_settings_v3';

  Future<Map<String, dynamic>> loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    Map<String, dynamic> local = {};
    final raw = prefs.getString(_profileKey);
    if (raw != null && raw.isNotEmpty) {
      try { local = Map<String, dynamic>.from(jsonDecode(raw) as Map); } catch (_) {}
    }

    final user = SupabaseService.client?.auth.currentUser;
    if (user != null) {
      local['uid'] = user.id;
      local['email'] = user.email ?? local['email'] ?? '';
      final meta = user.userMetadata ?? const <String, dynamic>{};
      final n = (meta['name'] ?? '').toString().trim();
      final sid = (meta['student_id'] ?? '').toString().trim();
      if (n.isNotEmpty) local['name'] = n;
      if (sid.isNotEmpty) local['studentId'] = sid;
      await prefs.setString(_profileKey, jsonEncode(local));
    }
    return local;
  }

  Future<void> refreshFromAuth() async {
    final user = SupabaseService.client?.auth.currentUser;
    if (user == null) return;
    final meta = user.userMetadata ?? const <String, dynamic>{};
    final current = await loadProfile();
    await saveProfile({
      ...current,
      'uid': user.id,
      'email': user.email ?? current['email'] ?? '',
      'name': (meta['name'] ?? current['name'] ?? 'Student').toString(),
      'studentId': (meta['student_id'] ?? current['studentId'] ?? '').toString(),
    }, sync: false);
  }

  Future<void> saveProfile(Map<String, dynamic> profile, {bool sync = true}) async {
    final clean = <String, dynamic>{};
    for (final e in profile.entries) {
      if (e.value != null) clean[e.key] = e.value;
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_profileKey, jsonEncode(clean));

    final client = SupabaseService.client;
    final user = client?.auth.currentUser;
    if (sync && client != null && user != null) {
      try {
        await client.auth.updateUser(UserAttributes(data: {
          'name': (clean['name'] ?? '').toString(),
          'student_id': (clean['studentId'] ?? '').toString(),
          'program': (clean['program'] ?? '').toString(),
          'department': (clean['department'] ?? '').toString(),
          'year': (clean['year'] ?? '').toString(),
          'whatsapp_number': (clean['whatsappNumber'] ?? '').toString(),
          'enrolled_subjects': clean['enrolledSubjects'] ?? ['CS407', 'CS506', 'MGT502'],
        }));
      } catch (_) {}

      final sid = (clean['studentId'] ?? '').toString().trim();
      final cloudId = sid.isNotEmpty
          ? sid
          : 'APP-${user.id.replaceAll('-', '').substring(0, 18)}';
      try {
        await NexoraCloudService().ensureSession(
          studentId: cloudId,
          displayName: (clean['name'] ?? 'Student').toString(),
        );
      } catch (_) {}
    }
  }

  Future<List<String>> getEnrolledSubjects() async {
    final profile = await loadProfile();
    final meta = SupabaseService.client?.auth.currentUser?.userMetadata ?? {};
    final list = profile['enrolledSubjects'] ?? meta['enrolled_subjects'];
    if (list is List && list.isNotEmpty) {
      return List<String>.from(list.map((x) => x.toString().toUpperCase().trim()));
    }
    return ['CS407', 'CS506', 'MGT502', 'ENG101'];
  }

  Future<String> getWhatsAppNumber() async {
    final profile = await loadProfile();
    final meta = SupabaseService.client?.auth.currentUser?.userMetadata ?? {};
    final num = (profile['whatsappNumber'] ?? meta['whatsapp_number'] ?? '').toString().trim();
    return num;
  }

  Future<Map<String, dynamic>> loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    Map<String, dynamic> out = {
      'themeMode': 'system',
      'language': 'English',
      'textScale': 1.0,
      'accent': 'Indigo',
      'pushNotifications': true,
      'emailAlerts': false,
      'announcementAlerts': true,
      'gradeNotifications': true,
      'analytics': false,
      'cloudSync': true,
    };
    final raw = prefs.getString(_settingsKey);
    if (raw != null) {
      try { out = {...out, ...Map<String, dynamic>.from(jsonDecode(raw) as Map)}; } catch (_) {}
    }
    try {
      final profile = await loadProfile();
      final user = SupabaseService.client?.auth.currentUser;
      if (user != null) {
        final sid = (profile['studentId'] ?? '').toString().trim();
        final cloudId = sid.isNotEmpty
            ? sid
            : 'APP-${user.id.replaceAll('-', '').substring(0, 18)}';
        final cloud = NexoraCloudService();
        await cloud.ensureSession(studentId: cloudId, displayName: (profile['name'] ?? 'Student').toString());
        final remote = await cloud.cloudSettings();
        if (remote['settings'] is Map) {
          out = {...out, ...Map<String, dynamic>.from(remote['settings'] as Map)};
          await prefs.setString(_settingsKey, jsonEncode(out));
        }
      }
    } catch (_) {}
    return out;
  }

  Future<void> saveSettings(Map<String, dynamic> settings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_settingsKey, jsonEncode(settings));
    try {
      final profile = await loadProfile();
      final user = SupabaseService.client?.auth.currentUser;
      if (user == null) return;
      final sid = (profile['studentId'] ?? '').toString().trim();
      final cloudId = sid.isNotEmpty
          ? sid
          : 'APP-${user.id.replaceAll('-', '').substring(0, 18)}';
      final cloud = NexoraCloudService();
      await cloud.ensureSession(studentId: cloudId, displayName: (profile['name'] ?? 'Student').toString());
      await cloud.saveCloudSettings(settings);
    } catch (_) {}
  }

  Future<void> clearLocalData({bool keepProfile = true}) async {
    final prefs = await SharedPreferences.getInstance();
    final profile = keepProfile ? prefs.getString(_profileKey) : null;
    await prefs.clear();
    if (profile != null) await prefs.setString(_profileKey, profile);
  }
}
