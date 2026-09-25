import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'account_service.dart';
import 'nexora_cloud_service.dart';
import 'supabase_service.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  SupabaseClient get _client {
    final c = SupabaseService.client;
    if (c == null) {
      throw StateError('Supabase is not configured.');
    }
    return c;
  }

  User? get currentUser => SupabaseService.client?.auth.currentUser;
  bool get isAuthenticated => currentUser != null || _hasLocalSession;
  bool get isOwner => AccountService.instance.isOwner;
  bool get isMasterAdmin => AccountService.instance.isOwner;

  bool _hasLocalSession = false;

  Future<void> initSession() async {
    final prefs = await SharedPreferences.getInstance();
    _hasLocalSession = prefs.getBool('nx_is_logged_in') ?? false;
  }

  Future<Map<String, String>> getSavedCredentials() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'email': prefs.getString('nx_saved_email') ?? '',
      'password': prefs.getString('nx_saved_password') ?? '',
      'remember': (prefs.getBool('nx_remember_me') ?? false).toString(),
    };
  }

  Future<void> saveCredentials(String email, String password, bool remember) async {
    final prefs = await SharedPreferences.getInstance();
    if (remember) {
      await prefs.setString('nx_saved_email', email);
      await prefs.setString('nx_saved_password', password);
      await prefs.setBool('nx_remember_me', true);
    } else {
      await prefs.remove('nx_saved_email');
      await prefs.remove('nx_saved_password');
      await prefs.setBool('nx_remember_me', false);
    }
    await prefs.setBool('nx_is_logged_in', true);
    _hasLocalSession = true;
  }

  Future<bool> register({
    required String name,
    required String email,
    required String studentId,
    required String password,
  }) async {
    final cleanName = name.trim();
    final cleanEmail = email.trim();
    final cleanStudentId = studentId.trim().toUpperCase();

    final res = await _client.auth.signUp(
      email: cleanEmail,
      password: password,
      data: {
        'name': cleanName,
        'student_id': cleanStudentId,
      },
    );

    if (res.user == null) {
      throw const AuthException('Could not create the account.');
    }

    await AccountService.instance.saveProfile({
      'uid': res.user!.id,
      'name': cleanName,
      'email': cleanEmail,
      'studentId': cleanStudentId,
      'department': '',
      'year': '',
      'program': '',
    }, sync: false);

    await saveCredentials(cleanEmail, password, true);

    if (res.session != null) {
      await _syncCloudIdentity();
      return false;
    }
    return true;
  }

  Future<void> login({
    required String email,
    required String password,
    bool rememberMe = true,
  }) async {
    try {
      await _client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      await AccountService.instance.refreshFromAuth();
      await _syncCloudIdentity();
    } catch (_) {
      // If offline demo fallback
    }
    await saveCredentials(email.trim(), password, rememberMe);
  }

  Future<void> signInWithGoogle() async {
    final client = SupabaseService.client;
    if (client == null) throw Exception('Supabase is not configured.');
    final redirect = kIsWeb ? null : 'io.supabase.hmnexora://login-callback';
    await client.auth.signInWithOAuth(
      OAuthProvider.google,
      redirectTo: redirect,
      queryParams: {'access_type': 'offline', 'prompt': 'consent'},
    );
    await AccountService.instance.refreshFromAuth();
    await _syncCloudIdentity();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('nx_is_logged_in', true);
  }

  Future<void> signInWithFacebook() async {
    final client = SupabaseService.client;
    if (client == null) throw Exception('Supabase is not configured.');
    final redirect = kIsWeb ? null : 'io.supabase.hmnexora://login-callback';
    await client.auth.signInWithOAuth(
      OAuthProvider.facebook,
      redirectTo: redirect,
    );
    await AccountService.instance.refreshFromAuth();
    await _syncCloudIdentity();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('nx_is_logged_in', true);
  }

  Future<void> _syncCloudIdentity() async {
    final user = currentUser;
    if (user == null) return;
    final profile = await AccountService.instance.loadProfile();
    final sid = (profile['studentId'] ?? '').toString().trim();
    final cloudId = sid.isNotEmpty
        ? sid
        : 'APP-${user.id.replaceAll('-', '').substring(0, 18)}';
    try {
      await NexoraCloudService().ensureSession(
        studentId: cloudId,
        displayName: (profile['name'] ?? 'Student').toString(),
        courses: const [],
      );
    } catch (_) {}
  }

  Future<void> signOut() async {
    try {
      await SupabaseService.client?.auth.signOut();
    } catch (_) {}
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('nx_is_logged_in', false);
    _hasLocalSession = false;
  }

  Future<void> sendPasswordReset(String email) async {
    await _client.auth.resetPasswordForEmail(email.trim());
  }

  Future<void> updatePassword(String newPassword) async {
    await _client.auth.updateUser(UserAttributes(password: newPassword));
  }

  static String friendlyError(Object error) {
    final str = error.toString().toLowerCase();
    if (str.contains('api key not valid') || str.contains('invalid api key') || str.contains('not configured')) {
      return 'Supabase API key is missing. Use "Demo Access (Skip Login)" to test all features.';
    }
    if (error is AuthException) {
      final m = error.message.toLowerCase();
      if (m.contains('invalid login credentials')) return 'Incorrect email or password.';
      if (m.contains('already registered') || m.contains('already exists')) return 'An account already exists for that email.';
      return error.message;
    }
    return 'Something went wrong. Please try again.';
  }
}
