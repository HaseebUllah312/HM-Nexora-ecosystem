import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../navigation.dart';
import '../../services/account_service.dart';
import '../../services/app_preferences.dart';
import '../../services/auth_service.dart';
import '../../services/drive_backup_service.dart';
import '../../services/supabase_service.dart';
import '../../utils/i18n.dart';
import '../../utils/text_utils.dart';

class SettingsScreen extends StatefulWidget {
  final NavigateFn navigate;
  const SettingsScreen({super.key, required this.navigate});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool loading = true;
  bool signingOut = false;
  bool testingApiKey = false;
  bool backingUpToDrive = false;
  String? apiKeyTestResult;
  bool isApiKeyValid = false;
  DriveBackupRecord? lastDriveRecord;

  Map<String, dynamic> profile = {};
  final TextEditingController _apiKeyCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _apiKeyCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final p = await AccountService.instance.loadProfile();
    final prefs = AppPreferences.instance;
    _apiKeyCtrl.text = prefs.customApiKey;
    final driveRec = await DriveBackupService.instance.getLastBackupRecord();

    if (mounted) {
      setState(() {
        profile = p;
        lastDriveRecord = driveRec;
        loading = false;
      });
    }
  }

  String get name => (profile['name'] ??
          SupabaseService.client?.auth.currentUser?.userMetadata?['name'] ??
          'Student')
      .toString();
  String get email => (profile['email'] ??
          SupabaseService.client?.auth.currentUser?.email ??
          '')
      .toString();
  String get studentId => (profile['studentId'] ?? '').toString();
  bool get isAdmin => (profile['role'] ?? '').toString().toLowerCase() == 'admin' || name.toLowerCase().contains('admin');

  Future<void> _testApiKey() async {
    final key = _apiKeyCtrl.text.trim();
    if (key.isEmpty) {
      setState(() {
        apiKeyTestResult = 'Please enter an API key first.';
        isApiKeyValid = false;
      });
      return;
    }

    setState(() {
      testingApiKey = true;
      apiKeyTestResult = null;
    });

    try {
      final url = Uri.parse('https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=$key');
      final resp = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'contents': [
            {'parts': [{'text': 'ping'}]}
          ]
        }),
      ).timeout(const Duration(seconds: 8));

      if (resp.statusCode == 200) {
        await AppPreferences.instance.update(apiKey: key);
        setState(() {
          testingApiKey = false;
          apiKeyTestResult = '✅ Verified! Gemini API Key is working perfectly.';
          isApiKeyValid = true;
        });
      } else {
        setState(() {
          testingApiKey = false;
          apiKeyTestResult = '❌ Key validation failed (${resp.statusCode}). Check key permissions.';
          isApiKeyValid = false;
        });
      }
    } catch (e) {
      setState(() {
        testingApiKey = false;
        apiKeyTestResult = '⚠️ Network timeout or invalid key format.';
        isApiKeyValid = false;
      });
    }
  }

  Future<void> _clearAppCache() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Row(
          children: [
            Icon(Icons.cleaning_services_rounded, color: Color(0xFF38BDF8)),
            SizedBox(width: 8),
            Text('Clear Cached Data?', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'This will clear temporary downloaded past papers, AI cache, and offline notes. Your account session will remain safe.',
          style: TextStyle(color: Colors.white70, fontSize: 13),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFEF4444)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Clear Cache'),
          ),
        ],
      ),
    );

    if (ok == true) {
      final prefs = await SharedPreferences.getInstance();
      final keys = prefs.getKeys().where((k) => k.startsWith('nx_cache_') || k.startsWith('hmn_ai_chat_'));
      for (final k in keys) {
        await prefs.remove(k);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            content: Text('⚡ Temporary cache cleared successfully!'),
          ),
        );
      }
    }
  }

  Future<void> _performDriveBackup() async {
    setState(() => backingUpToDrive = true);
    try {
      final rec = await DriveBackupService.instance.syncUserDataToGoogleDrive();
      if (mounted) {
        setState(() {
          backingUpToDrive = false;
          lastDriveRecord = rec;
        });
        if (rec.success) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF10B981),
              behavior: SnackBarBehavior.floating,
              content: Row(
                children: [
                  const Icon(Icons.cloud_done_rounded, color: Colors.white),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Google Drive Sync Complete!\n${rec.totalExams} exams, ${rec.totalAiMessages} AI chats backed up (${rec.backupSize})',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: Color(0xFFF59E0B),
              behavior: SnackBarBehavior.floating,
              content: Text('Academic records cached locally and queued for Cloud Drive sync.'),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => backingUpToDrive = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFFEF4444),
            content: Text('Backup notice: $e'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
    final prefs = AppPreferences.instance;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;
    final accent = prefs.accent;

    return Container(
      color: isDark ? const Color(0xFF070B14) : cs.surfaceContainerLowest,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 36),
        children: [
          // 1. Executive Profile Card
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF1E293B) : Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: isDark ? 0.25 : 0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [accent, accent.withValues(alpha: 0.7)],
                    ),
                    borderRadius: BorderRadius.circular(18),
                    boxShadow: [
                      BoxShadow(
                        color: accent.withValues(alpha: 0.35),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Text(
                    initialsFromName(name),
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 19,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              name,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: cs.onSurface),
                            ),
                          ),
                          if (isAdmin) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF59E0B).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Text('ADMIN', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 9, fontWeight: FontWeight.bold)),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      if (email.isNotEmpty)
                        Text(email, style: TextStyle(fontSize: 12, color: cs.onSurfaceVariant)),
                      if (studentId.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(studentId, style: TextStyle(fontSize: 11.5, color: accent, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: () => widget.navigate('profile'),
                  icon: const Icon(Icons.edit_rounded, size: 18),
                ),
              ],
            ),
          ),

          // 2. Appearance & Visual Design System
          _sectionTitle('Appearance & Styling Studio', Icons.palette_rounded),
          _cardContainer(isDark, [
            // Theme Mode Selector Segmented Row
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Theme Mode', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      _themeButton(ThemeMode.system, 'System', Icons.settings_brightness_rounded, prefs),
                      const SizedBox(width: 8),
                      _themeButton(ThemeMode.dark, 'Dark OLED', Icons.dark_mode_rounded, prefs),
                      const SizedBox(width: 8),
                      _themeButton(ThemeMode.light, 'Light', Icons.light_mode_rounded, prefs),
                    ],
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Accent Seed Color Palette Swatches
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Accent Seed Color', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                      Text(prefs.accentName, style: TextStyle(fontSize: 12, color: accent, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 42,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: AppPreferences.accents.entries.map((e) {
                        final isSelected = prefs.accentName == e.key;
                        return GestureDetector(
                          onTap: () async {
                            await prefs.update(newAccentName: e.key);
                            setState(() {});
                          },
                          child: Container(
                            margin: const EdgeInsets.only(right: 10),
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: e.value,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: isSelected ? Colors.white : Colors.transparent,
                                width: 2.5,
                              ),
                              boxShadow: isSelected
                                  ? [
                                      BoxShadow(
                                        color: e.value.withValues(alpha: 0.6),
                                        blurRadius: 10,
                                        spreadRadius: 1,
                                      ),
                                    ]
                                  : null,
                            ),
                            child: isSelected ? const Icon(Icons.check, color: Colors.white, size: 20) : null,
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Text Scaling
            ListTile(
              leading: const Icon(Icons.text_fields_rounded),
              title: const Text('Text Scaling & Accessibility', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: Text('${(prefs.textScale * 100).round()}% scale'),
              trailing: DropdownButton<double>(
                value: [0.85, 1.0, 1.15, 1.30].contains(prefs.textScale) ? prefs.textScale : 1.0,
                underline: const SizedBox.shrink(),
                items: const [
                  DropdownMenuItem(value: 0.85, child: Text('85% (Compact)')),
                  DropdownMenuItem(value: 1.0, child: Text('100% (Default)')),
                  DropdownMenuItem(value: 1.15, child: Text('115% (Large)')),
                  DropdownMenuItem(value: 1.30, child: Text('130% (XL)')),
                ],
                onChanged: (val) async {
                  if (val != null) {
                    await prefs.update(scale: val);
                    setState(() {});
                  }
                },
              ),
            ),
            const Divider(height: 1),

            // Language
            ListTile(
              leading: const Icon(Icons.language_rounded),
              title: const Text('App Language', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: Text(prefs.language),
              trailing: DropdownButton<String>(
                value: prefs.language,
                underline: const SizedBox.shrink(),
                items: ['English', 'Urdu', 'Arabic', 'Spanish', 'French']
                    .map((l) => DropdownMenuItem(value: l, child: Text(l)))
                    .toList(),
                onChanged: (val) async {
                  if (val != null) {
                    await prefs.update(lang: val);
                    setState(() {});
                  }
                },
              ),
            ),
          ]),

          // 3. AI Mentor Engine & API Studio
          _sectionTitle('AI Mentor Engine & Custom Key', Icons.auto_awesome_rounded),
          _cardContainer(isDark, [
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF6366F1).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.key_rounded, size: 18, color: Color(0xFF818CF8)),
                      ),
                      const SizedBox(width: 8),
                      const Text('Google Gemini API Key', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: (prefs.customApiKey.isNotEmpty ? const Color(0xFF10B981) : const Color(0xFF6366F1)).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          prefs.customApiKey.isNotEmpty ? 'Custom VIP Key' : 'Built-in Key Pool Active',
                          style: TextStyle(
                            color: prefs.customApiKey.isNotEmpty ? const Color(0xFF10B981) : const Color(0xFF818CF8),
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'HM Nexora provides a built-in free pool of keys. You can also paste your own Google Gemini API key for high-speed custom rate limits.',
                    style: TextStyle(fontSize: 11.5, color: Colors.grey, height: 1.4),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _apiKeyCtrl,
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Paste Gemini API Key (AIzaSy...)',
                      hintStyle: const TextStyle(color: Colors.white30, fontSize: 12),
                      filled: true,
                      fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.save_rounded, color: Color(0xFF6366F1)),
                        tooltip: 'Save Key',
                        onPressed: () async {
                          await prefs.update(apiKey: _apiKeyCtrl.text.trim());
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('API Key saved!')),
                            );
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      ElevatedButton.icon(
                        onPressed: testingApiKey ? null : _testApiKey,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6366F1),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        icon: testingApiKey
                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Icon(Icons.flash_on_rounded, color: Colors.white, size: 16),
                        label: const Text('Test Connection', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                      if (_apiKeyCtrl.text.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        TextButton(
                          onPressed: () async {
                            _apiKeyCtrl.clear();
                            await prefs.update(apiKey: '');
                            setState(() => apiKeyTestResult = 'Reverted to built-in API key pool.');
                          },
                          child: const Text('Reset to Default', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
                        ),
                      ],
                    ],
                  ),
                  if (apiKeyTestResult != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      apiKeyTestResult!,
                      style: TextStyle(
                        color: isApiKeyValid ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                        fontSize: 11.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ]),

          // 4. Google Drive Cloud Backup & Academic Sync
          _sectionTitle('Google Drive Cloud Backup & Sync', Icons.cloud_sync_rounded),
          _cardContainer(isDark, [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [Color(0xFF4285F4), Color(0xFF34A853)],
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF4285F4).withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.add_to_drive_rounded, color: Colors.white, size: 22),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Google Drive Cloud Vault',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              'Auto-syncs Exams, MCQs & AI Chats',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF10B981)),
                            SizedBox(width: 4),
                            Text(
                              'Active',
                              style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.history_rounded, size: 14, color: Colors.grey),
                            const SizedBox(width: 6),
                            const Text('Last Synced: ', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
                            Expanded(
                              child: Text(
                                lastDriveRecord != null
                                    ? '${lastDriveRecord!.timestamp.split('T')[0]} • ${lastDriveRecord!.totalExams} Exams, ${lastDriveRecord!.totalAiMessages} AI Chats (${lastDriveRecord!.backupSize})'
                                    : 'Ready for first sync',
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.folder_shared_rounded, size: 14, color: Colors.grey),
                            const SizedBox(width: 6),
                            const Text('Master Drive ID: ', style: TextStyle(fontSize: 11.5, color: Colors.grey)),
                            const Expanded(
                              child: Text(
                                '1cmecXWcl...7ni (Unlimited)',
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFF4285F4)),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: backingUpToDrive ? null : _performDriveBackup,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF4285F4),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          icon: backingUpToDrive
                              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Icon(Icons.cloud_upload_rounded, color: Colors.white, size: 18),
                          label: Text(
                            backingUpToDrive ? 'Backing Up to Drive...' : 'Backup All Data Now',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12.5),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ]),

          // 5. Data & Storage Optimization
          _sectionTitle('Storage & Maintenance', Icons.storage_rounded),
          _cardContainer(isDark, [
            ListTile(
              leading: const Icon(Icons.cleaning_services_rounded),
              title: const Text('Clear Temporary Cache & Files', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Frees up local device storage safely', style: TextStyle(fontSize: 11)),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: _clearAppCache,
            ),
            const Divider(height: 1),
            ListTile(
              leading: const Icon(Icons.refresh_rounded),
              title: const Text('Sync Enrolled VULMS Subjects', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              subtitle: const Text('Triggers live LMS sync with Study Vault', style: TextStyle(fontSize: 11)),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {
                widget.navigate('lms');
              },
            ),
          ]),

          // 5. Notifications & Alerts
          _sectionTitle(I18n.t('notifications'), Icons.notifications_outlined),
          _cardContainer(isDark, [
            SwitchListTile(
              secondary: const Icon(Icons.notifications_active_outlined),
              title: Text(I18n.t('pushNotifications'), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              value: prefs.pushNotifications,
              onChanged: (val) async {
                await prefs.update(push: val);
                setState(() {});
              },
            ),
            const Divider(height: 1),
            SwitchListTile(
              secondary: const Icon(Icons.forum_outlined),
              title: const Text('Community Chat Notifications', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              value: prefs.communityAlerts,
              onChanged: (val) async {
                await prefs.update(community: val);
                setState(() {});
              },
            ),
            const Divider(height: 1),
            SwitchListTile(
              secondary: const Icon(Icons.assignment_late_outlined),
              title: const Text('LMS Deadlines & Broadcasts', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
              value: prefs.subjectActivityAlerts,
              onChanged: (val) async {
                await prefs.update(subjectActivities: val);
                setState(() {});
              },
            ),
          ]),

          // 6. Professional Support & About
          _sectionTitle('Professional Support & Info', Icons.support_agent_rounded),
          _cardContainer(isDark, [
            _actionTile('Help & FAQ Center', Icons.help_outline_rounded, _showProfessionalHelp),
            const Divider(height: 1),
            _actionTile('About HM Nexora Pro', Icons.info_outline_rounded, _showProfessionalAbout),
            const Divider(height: 1),
            _actionTile('Official WhatsApp Community', Icons.chat_bubble_outline_rounded, _openWhatsAppChannel, subtitle: '10,000+ Active VU Students'),
            const Divider(height: 1),
            _actionTile('Contribute Study Files to Vault', Icons.upload_file_rounded, () => widget.navigate('contributeFile')),
          ]),

          const SizedBox(height: 24),

          // Sign Out Button
          OutlinedButton.icon(
            onPressed: signingOut ? null : _signOut,
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              side: const BorderSide(color: Color(0xFFEF4444)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            icon: signingOut
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFEF4444)))
                : const Icon(Icons.logout_rounded, color: Color(0xFFEF4444)),
            label: const Text('Sign Out from Account', style: TextStyle(color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _themeButton(ThemeMode mode, String label, IconData icon, AppPreferences prefs) {
    final isSelected = prefs.themeMode == mode;
    return Expanded(
      child: InkWell(
        onTap: () async {
          await prefs.update(mode: mode);
          setState(() {});
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF334155),
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: isSelected ? Colors.white : Colors.white70, size: 20),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.white : Colors.white70,
                  fontSize: 11,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionTitle(String title, IconData icon) => Padding(
        padding: const EdgeInsets.fromLTRB(4, 18, 4, 8),
        child: Row(
          children: [
            Icon(icon, size: 16, color: AppPreferences.instance.accent),
            const SizedBox(width: 8),
            Text(
              title.toUpperCase(),
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onSurfaceVariant,
                letterSpacing: 0.6,
              ),
            ),
          ],
        ),
      );

  Widget _cardContainer(bool isDark, List<Widget> children) => Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(children: children),
      );

  Widget _actionTile(String title, IconData icon, VoidCallback onTap, {String? subtitle}) => ListTile(
        leading: Icon(icon, size: 20),
        title: Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        subtitle: subtitle == null ? null : Text(subtitle, style: const TextStyle(fontSize: 11)),
        trailing: const Icon(Icons.chevron_right_rounded, size: 18),
        onTap: onTap,
      );

  void _showProfessionalAbout() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 64,
              height: 64,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF6366F1), Color(0xFF38BDF8)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.35),
                    blurRadius: 16,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: const Icon(Icons.school_rounded, color: Colors.white, size: 36),
            ),
            const SizedBox(height: 12),
            const Text('HM NEXORA PRO', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 0.8)),
            const SizedBox(height: 4),
            Text('Version 1.6.1 • Flagship Virtual University Companion', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurfaceVariant)),
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 10),
            _aboutRow('🎓 VULMS In-App Portal', 'Bypass restrictions, fast-forward lectures, and auto-sync courses.'),
            _aboutRow('🤖 Nexora AI Mentor', 'Gemini AI tutoring, concept explanations, and quiz generator.'),
            _aboutRow('💬 Realtime Community & DMs', 'Public subject rooms and encrypted 1-on-1 student direct chat.'),
            _aboutRow('📂 Master Study Vault', 'Thousands of indexed handouts, past papers, and solutions.'),
            const SizedBox(height: 18),
            ElevatedButton.icon(
              onPressed: _openWhatsAppChannel,
              icon: const Icon(Icons.chat_rounded, color: Colors.white),
              label: const Text('Join Official WhatsApp Channel', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _aboutRow(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                Text(desc, style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showProfessionalHelp() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        height: MediaQuery.of(context).size.height * 0.75,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.support_agent_rounded, color: Color(0xFF6366F1), size: 28),
                SizedBox(width: 10),
                Text('Help & Support Center', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            Expanded(
              child: ListView(
                children: [
                  const Text('Frequently Asked Questions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                  const SizedBox(height: 8),
                  _faqItem('How does Nexora AI Assistant work?', 'Nexora AI Assistant helps you answer course questions, practice MCQs, create study plans, and navigate VULMS.'),
                  _faqItem('How do I enable AI Mentor with custom API key?', 'Go to Settings > AI Mentor API Configuration, paste your Google Gemini API Key, and save. AI Mentor will respond directly.'),
                  _faqItem('Where are my downloaded study files stored?', 'Files downloaded from Study Vault are stored in your device downloads folder and cached locally in HM Nexora.'),
                  const SizedBox(height: 16),
                  Card(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.1),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Need direct assistance?', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
                          const SizedBox(height: 4),
                          const Text('Join our official student support community or email our team.', style: TextStyle(fontSize: 11.5)),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: _openWhatsAppChannel,
                                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
                                  child: const Text('WhatsApp Help', style: TextStyle(color: Colors.white, fontSize: 12)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _faqItem(String q, String a) {
    return ExpansionTile(
      title: Text(q, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
          child: Text(a, style: const TextStyle(fontSize: 11.5, color: Colors.grey)),
        ),
      ],
    );
  }

  Future<void> _openWhatsAppChannel() async {
    final uri = Uri.parse('https://whatsapp.com/channel/0029Vb5PcRb11ulIA5AYpj2K');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Opening WhatsApp Channel...')),
        );
      }
    }
  }

  Future<void> _signOut() async {
    setState(() => signingOut = true);
    try {
      await AuthService.instance.signOut();
    } catch (_) {}
    if (mounted) widget.navigate('login');
  }
}
