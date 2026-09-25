import 'package:flutter/material.dart';
import 'account_service.dart';

class AppPreferences extends ChangeNotifier {
  AppPreferences._();
  static final AppPreferences instance = AppPreferences._();

  ThemeMode themeMode = ThemeMode.system;
  double textScale = 1.0;
  Color accent = const Color(0xFF4F46E5);
  String accentName = 'Indigo';
  String language = 'English';

  String aiProvider = 'Gemini'; // 'Gemini' | 'OpenAI' | 'Nexora Cloud'
  String customApiKey = '';

  bool pushNotifications = true;
  bool mailNotifications = false;
  bool announcementAlerts = true;
  bool gradeAlerts = true;
  bool communityAlerts = true;
  bool subjectActivityAlerts = true;

  bool loaded = false;

  static const accents = <String, Color>{
    'Indigo': Color(0xFF4F46E5),
    'Emerald': Color(0xFF059669),
    'Amber': Color(0xFFD97706),
    'Crimson': Color(0xFFDC2626),
    'Cyan': Color(0xFF0891B2),
    'Purple': Color(0xFF7C3AED),
  };

  Future<void> load() async {
    final s = await AccountService.instance.loadSettings();
    final mode = (s['themeMode'] ?? 'system').toString();
    themeMode = mode == 'dark' ? ThemeMode.dark : mode == 'light' ? ThemeMode.light : ThemeMode.system;
    textScale = (s['textScale'] is num) ? (s['textScale'] as num).toDouble().clamp(.85, 1.35) : 1.0;
    language = (s['language'] ?? 'English').toString();
    accentName = (s['accent'] ?? 'Indigo').toString();
    accent = accents[accentName] ?? accents['Indigo']!;

    aiProvider = (s['aiProvider'] ?? 'Gemini').toString();
    customApiKey = (s['customApiKey'] ?? '').toString();

    pushNotifications = s['pushNotifications'] ?? true;
    mailNotifications = s['mailNotifications'] ?? false;
    announcementAlerts = s['announcementAlerts'] ?? true;
    gradeAlerts = s['gradeAlerts'] ?? true;
    communityAlerts = s['communityAlerts'] ?? true;
    subjectActivityAlerts = s['subjectActivityAlerts'] ?? true;

    loaded = true;
    notifyListeners();
  }

  Future<void> update({
    ThemeMode? mode,
    double? scale,
    String? lang,
    String? newAccentName,
    String? provider,
    String? apiKey,
    bool? push,
    bool? mail,
    bool? announcements,
    bool? grades,
    bool? community,
    bool? subjectActivities,
  }) async {
    final s = await AccountService.instance.loadSettings();
    if (mode != null) {
      themeMode = mode;
      s['themeMode'] = mode == ThemeMode.dark ? 'dark' : mode == ThemeMode.light ? 'light' : 'system';
    }
    if (scale != null) {
      textScale = scale.clamp(.85, 1.35);
      s['textScale'] = textScale;
    }
    if (lang != null) {
      language = lang;
      s['language'] = lang;
    }
    if (newAccentName != null) {
      accentName = newAccentName;
      accent = accents[newAccentName] ?? accents['Indigo']!;
      s['accent'] = newAccentName;
    }
    if (provider != null) {
      aiProvider = provider;
      s['aiProvider'] = provider;
    }
    if (apiKey != null) {
      customApiKey = apiKey;
      s['customApiKey'] = apiKey;
    }
    if (push != null) {
      pushNotifications = push;
      s['pushNotifications'] = push;
    }
    if (mail != null) {
      mailNotifications = mail;
      s['mailNotifications'] = mail;
    }
    if (announcements != null) {
      announcementAlerts = announcements;
      s['announcementAlerts'] = announcements;
    }
    if (grades != null) {
      gradeAlerts = grades;
      s['gradeAlerts'] = grades;
    }
    if (community != null) {
      communityAlerts = community;
      s['communityAlerts'] = community;
    }
    if (subjectActivities != null) {
      subjectActivityAlerts = subjectActivities;
      s['subjectActivityAlerts'] = subjectActivities;
    }

    await AccountService.instance.saveSettings(s);
    notifyListeners();
  }
}
