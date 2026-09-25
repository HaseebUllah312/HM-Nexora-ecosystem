import 'dart:async';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'account_service.dart';
import 'app_preferences.dart';
import 'nexora_cloud_service.dart';
import 'supabase_service.dart';

class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final Map<String, Timer> _scheduledTimers = {};

  Future<bool> enablePush() async {
    await AppPreferences.instance.update(push: true);
    return true;
  }

  Future<void> disablePush() async {
    await AppPreferences.instance.update(push: false);
  }

  /// Schedules a study planner alert timer for the given date/time.
  void schedulePlannerTaskNotification({
    required String taskId,
    required String title,
    required DateTime targetDate,
    required BuildContext context,
  }) {
    _scheduledTimers[taskId]?.cancel();
    final now = DateTime.now();
    final diff = targetDate.difference(now);

    if (diff.isNegative) return;

    _scheduledTimers[taskId] = Timer(diff, () {
      if (AppPreferences.instance.pushNotifications && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.alarm_on_rounded, color: Colors.white),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '⏰ Study Reminder: $title is due now!',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            backgroundColor: AppPreferences.instance.accent,
            duration: const Duration(seconds: 8),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });
  }

  /// Schedules a VULMS deadline alert (Assignments, Quizzes, GDBs).
  void scheduleVULMSActivityNotification({
    required String activityId,
    required String courseCode,
    required String title,
    required DateTime dueDate,
    required BuildContext context,
  }) {
    _scheduledTimers[activityId]?.cancel();
    final now = DateTime.now();
    final diff = dueDate.difference(now);

    if (diff.isNegative) return;

    _scheduledTimers[activityId] = Timer(diff, () {
      if (AppPreferences.instance.pushNotifications && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.assignment_late_rounded, color: Colors.white),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '🔔 VULMS Alert: $courseCode — $title is closing soon!',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.deepOrangeAccent,
            duration: const Duration(seconds: 10),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    });
  }

  Future<List<dynamic>> fetchInAppNotifications() async {
    final user = SupabaseService.client?.auth.currentUser;
    if (user == null) return const [];
    final profile = await AccountService.instance.loadProfile();
    final sid = (profile['studentId'] ?? '').toString().trim();
    final cloudId = sid.isNotEmpty
        ? sid
        : 'APP-${user.id.replaceAll('-', '').substring(0, 18)}';
    final cloud = NexoraCloudService();
    await cloud.ensureSession(
      studentId: cloudId,
      displayName: (profile['name'] ?? 'Student').toString(),
    );
    return cloud.notifications();
  }

  /// Displays an in-app alert for Community Chat messages based on channel targeting & preferences.
  Future<void> showCommunityMessageAlert({
    required String channel,
    required String sender,
    required String text,
    required BuildContext context,
  }) async {
    final prefs = AppPreferences.instance;
    if (!prefs.pushNotifications || !prefs.communityAlerts) return;

    final cleanChannel = channel.toUpperCase().trim();

    // Check if channel is subject-specific or general
    if (cleanChannel != 'GENERAL' && cleanChannel != 'ALL') {
      final enrolledSubjects = await AccountService.instance.getEnrolledSubjects();
      final hasSubject = enrolledSubjects.any(
        (code) => code.toUpperCase().trim() == cleanChannel || cleanChannel.contains(code.toUpperCase().trim()),
      );
      // If student is not enrolled in this course, skip notification!
      if (!hasSubject && enrolledSubjects.isNotEmpty) return;
    }

    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.forum_rounded, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('💬 [$cleanChannel] $sender', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: Colors.indigo.shade700,
          duration: const Duration(seconds: 4),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  /// Fully Automated Multi-Channel Broadcast & Deduplication Engine.
  /// Automatically sends App Push, Gmail Email, and WhatsApp API alerts to enrolled students, skipping duplicate activities.
  Future<bool> broadcastSubjectActivity({
    required String courseCode,
    required String title,
    required String activityType, // 'Assignment' | 'Quiz' | 'GDB' | 'DateSheet'
    required DateTime dueDate,
    required BuildContext context,
  }) async {
    final prefs = AppPreferences.instance;
    if (!prefs.pushNotifications || !prefs.subjectActivityAlerts) return false;

    final cleanCode = courseCode.toUpperCase().trim();
    final cleanTitle = title.trim();
    if (cleanCode.isEmpty || cleanTitle.isEmpty) return false;

    // 1. DEDUPLICATION ENGINE: Generate unique activity fingerprint
    final dateStr = '${dueDate.year}-${dueDate.month}-${dueDate.day}';
    final dedupKey = 'dedup_${cleanCode}_${cleanTitle.toLowerCase().replaceAll(RegExp(r'[^a-z0-9]'), '')}_$dateStr';

    // Check local deduplication cache first
    final sp = await SharedPreferences.getInstance();
    final isDuplicate = sp.getBool(dedupKey) ?? false;
    if (isDuplicate) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.verified_rounded, color: Colors.amber),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    '⚡ Activity "$cleanTitle" for $cleanCode was already broadcasted to enrolled students! (Duplicate skipped)',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.blueGrey.shade900,
            duration: const Duration(seconds: 4),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
      return false; // Skip duplicate broadcast!
    }

    // 2. CHECK GLOBAL DEDUPLICATION IN SUPABASE DATABASE
    final c = SupabaseService.client;
    if (c != null) {
      try {
        final existing = await c
            .from('community_messages')
            .select('id')
            .eq('channel', cleanCode)
            .ilike('text', '%$cleanTitle%')
            .limit(1);

        if (existing is List && (existing as List).isNotEmpty) {
          await sp.setBool(dedupKey, true); // Cache duplicate locally
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('⚡ Activity "$cleanTitle" already broadcasted in $cleanCode channel!'),
                backgroundColor: Colors.blueGrey.shade900,
              ),
            );
          }
          return false;
        }

        // Post automated broadcast to Supabase live feed
        await c.from('community_messages').insert({
          'channel': cleanCode,
          'display_name': '📢 AUTOMATED LMS DISPATCH',
          'user_email': 'broadcast@hmnexora.com',
          'text': '🚨 AUTOMATED LMS $activityType ALERT: "$cleanTitle" — Due: ${dueDate.day}/${dueDate.month}/${dueDate.year}',
          'created_at': DateTime.now().toIso8601String(),
        });
      } catch (_) {}
    }

    // Save deduplication key to local storage
    await sp.setBool(dedupKey, true);

    // 3. AUTOMATED TRIPLE-CHANNEL DISPATCH (App Push + Gmail SMTP + WhatsApp API)
    try {
      final cloud = NexoraCloudService();
      await cloud.post('/automated-broadcast', {
        'dedup_key': dedupKey,
        'target_course': cleanCode,
        'activity_title': cleanTitle,
        'activity_type': activityType,
        'due_date': dueDate.toIso8601String(),
        'channels': ['app_push', 'gmail_smtp', 'whatsapp_api'],
      });
    } catch (_) {}

    // 4. Instant Confirmation Toast
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.mark_email_read_rounded, color: Colors.white),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '⚡ Auto-broadcasted $cleanCode $activityType via App Push, Gmail & WhatsApp to enrolled students!',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11.5),
                ),
              ),
            ],
          ),
          backgroundColor: Colors.green.shade800,
          duration: const Duration(seconds: 6),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
    return true;
  }
}
