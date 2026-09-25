import 'package:supabase_flutter/supabase_flutter.dart';
import '../config/backend_config.dart';

class SupabaseService {
  SupabaseService._();

  static SupabaseClient? _client;

  static bool get configured => _client != null;
  static SupabaseClient? get client => _client;

  static Future<void> initialize() async {
    await BackendConfig.loadRuntimeConfig();
    if (!BackendConfig.hasSupabase) return;
    await Supabase.initialize(
      url: BackendConfig.supabaseUrl,
      publishableKey: BackendConfig.supabasePublishableKey,
    );
    _client = Supabase.instance.client;
  }

  static SupabaseClient requireClient() {
    final c = _client;
    if (c == null) {
      throw StateError(
        'Supabase is not configured. Build with SUPABASE_URL and '
        'SUPABASE_PUBLISHABLE_KEY.',
      );
    }
    return c;
  }
}
