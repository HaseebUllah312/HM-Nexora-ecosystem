import 'dart:convert';
import 'package:flutter/services.dart';

class BackendConfig {
  BackendConfig._();

  static String _supabaseUrl =
      const String.fromEnvironment('SUPABASE_URL', defaultValue: '');

  static String _supabasePublishableKey =
      const String.fromEnvironment('SUPABASE_PUBLISHABLE_KEY', defaultValue: '');

  static String _cloudflareApi =
      const String.fromEnvironment(
        'NEXORA_API_URL',
        defaultValue: 'https://nexora-api.haseebsaleem312.workers.dev',
      );

  static const String masterDriveFolderId = '1cmecXWcl_Y07uIemFD3Jp_b-2Bv6d7ni';
  static const String masterDriveOwner = 'haseebsaleem312@gmail.com';
  static const String masterDriveUrl = 'https://drive.google.com/drive/folders/1cmecXWcl_Y07uIemFD3Jp_b-2Bv6d7ni?usp=sharing';

  static String get supabaseUrl => _supabaseUrl;
  static String get supabasePublishableKey => _supabasePublishableKey;
  static String get cloudflareApi => _cloudflareApi;

  static bool get hasSupabase =>
      _supabaseUrl.trim().isNotEmpty &&
      !_supabaseUrl.contains('YOUR_PROJECT') &&
      _supabasePublishableKey.trim().isNotEmpty &&
      !_supabasePublishableKey.contains('YOUR_SUPABASE');

  static Future<void> loadRuntimeConfig() async {
    try {
      final jsonStr = await rootBundle.loadString('config/backend.json');
      final Map<String, dynamic> data = jsonDecode(jsonStr);
      if (_supabaseUrl.isEmpty && (data['SUPABASE_URL'] as String?)?.isNotEmpty == true) {
        _supabaseUrl = data['SUPABASE_URL']!;
      }
      if (_supabasePublishableKey.isEmpty && (data['SUPABASE_PUBLISHABLE_KEY'] as String?)?.isNotEmpty == true) {
        _supabasePublishableKey = data['SUPABASE_PUBLISHABLE_KEY']!;
      }
      if (data['NEXORA_API_URL'] is String && (data['NEXORA_API_URL'] as String).isNotEmpty) {
        _cloudflareApi = data['NEXORA_API_URL'];
      }
    } catch (_) {}
  }
}
