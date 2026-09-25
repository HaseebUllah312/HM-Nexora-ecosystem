import 'dart:convert';
import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../theme.dart';
import '../../services/supabase_service.dart';

class _Update {
  final String id;
  final IconData icon;
  final Color iconBg, iconColor, badgeColor;
  final String title, desc, time, badge;
  final String? link;
  bool unread;
  _Update({
    required this.id,
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.title,
    required this.desc,
    required this.time,
    required this.badge,
    required this.badgeColor,
    required this.unread,
    this.link,
  });
}

class UpdatesScreen extends StatefulWidget {
  final NavigateFn navigate;
  const UpdatesScreen({super.key, required this.navigate});

  @override
  State<UpdatesScreen> createState() => _UpdatesScreenState();
}

class _UpdatesScreenState extends State<UpdatesScreen> {
  int activeCat = 0;
  final categories = const ['All', 'Academic', 'Events', 'Alerts'];
  List<_Update> _items = [];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
  }

  Future<void> _loadAnnouncements() async {
    setState(() => _loading = true);
    final fallbackList = [
      _Update(
        id: 'default-1',
        icon: Icons.campaign_rounded,
        iconBg: const Color(0xFFFEF2F2),
        iconColor: AppColors.red,
        title: 'Midterm Exam Schedule Released',
        desc: 'Spring 2025 midterm exams run soon. Check your timetable in the Planner.',
        time: 'Today',
        badge: 'IMPORTANT',
        badgeColor: AppColors.red,
        unread: true,
      ),
      _Update(
        id: 'default-2',
        icon: Icons.menu_book_rounded,
        iconBg: AppColors.accent,
        iconColor: AppColors.primary,
        title: 'New Lecture Added — Algorithms',
        desc: 'Lecture 11: Advanced Graph Traversal is now available on Cloud Vault.',
        time: 'Recent',
        badge: 'NEW',
        badgeColor: AppColors.primary,
        unread: true,
      ),
      _Update(
        id: 'default-3',
        icon: Icons.calendar_month_rounded,
        iconBg: const Color(0xFFF3EEFF),
        iconColor: AppColors.purple,
        title: 'Career & Internship Drive',
        desc: 'Top software houses partnering with HM Nexora. Apply in Services tab.',
        time: '1d ago',
        badge: 'EVENT',
        badgeColor: AppColors.purple,
        unread: false,
      ),
    ];

    try {
      final c = SupabaseService.client;
      if (c != null) {
        final res = await c
            .from('notifications')
            .select('*')
            .eq('type', 'announcement')
            .order('created_at', ascending: false)
            .limit(20);

        if (res is List && res.isNotEmpty) {
          final liveItems = <_Update>[];
          for (final raw in res) {
            final row = raw as Map<String, dynamic>;
            dynamic payload = row['payload'];
            if (payload is String) {
              try { payload = jsonDecode(payload); } catch (_) { payload = {}; }
            }
            final map = (payload is Map) ? payload : <String, dynamic>{};
            final target = (map['target'] ?? row['channel'] ?? 'all').toString().toLowerCase();

            // Filter for mobile or all
            if (target != 'all' && target != 'mobile') continue;

            final title = (map['title'] ?? 'Universal Announcement').toString();
            final msg = (map['message'] ?? '').toString();
            final link = map['link']?.toString();
            final createdAt = row['created_at'] != null ? DateTime.tryParse(row['created_at'].toString()) : null;
            final timeStr = createdAt != null ? '${createdAt.day}/${createdAt.month}/${createdAt.year}' : 'Recent';

            liveItems.add(_Update(
              id: row['id']?.toString() ?? UniqueKey().toString(),
              icon: Icons.campaign_rounded,
              iconBg: const Color(0xFFFEF2F2),
              iconColor: AppColors.red,
              title: title,
              desc: msg,
              time: timeStr,
              badge: 'BROADCAST',
              badgeColor: AppColors.red,
              link: link,
              unread: true,
            ));
          }

          if (liveItems.isNotEmpty) {
            liveItems.addAll(fallbackList);
            if (mounted) {
              setState(() {
                _items = liveItems;
                _loading = false;
              });
              return;
            }
          }
        }
      }
    } catch (_) {}

    if (mounted) {
      setState(() {
        _items = fallbackList;
        _loading = false;
      });
    }
  }

  void _markAllRead() => setState(() {
        for (final u in _items) {
          u.unread = false;
        }
      });

  @override
  Widget build(BuildContext context) {
    final unreadCount = _items.where((u) => u.unread).length;
    return Container(
      color: AppColors.background,
      child: RefreshIndicator(
        onRefresh: _loadAnnouncements,
        child: ListView(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: const BoxDecoration(color: Colors.white, border: Border(bottom: BorderSide(color: AppColors.border))),
              child: Row(
                children: categories.asMap().entries.map((e) {
                  final active = activeCat == e.key;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: GestureDetector(
                      onTap: () => setState(() => activeCat = e.key),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        decoration: BoxDecoration(color: active ? AppColors.primary : AppColors.muted, borderRadius: BorderRadius.circular(16)),
                        child: Text(e.value, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: active ? Colors.white : AppColors.mutedForeground)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Text('Announcements & Updates', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.foreground)),
                      if (unreadCount > 0) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(999)),
                          child: Text('$unreadCount new', style: const TextStyle(fontSize: 11, color: AppColors.primary)),
                        ),
                      ],
                    ],
                  ),
                  GestureDetector(
                    onTap: _markAllRead,
                    child: const Text('Mark all read', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                  ),
                ],
              ),
            ),
            if (_loading)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
              )
            else
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: Column(
                  children: _items.map((u) => _updateCard(u)).toList(),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _updateCard(_Update u) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: u.unread ? const Color(0xFFC7D2FE) : AppColors.faintBorder),
      ),
      child: Stack(
        children: [
          if (u.unread) Positioned(left: 0, top: 0, bottom: 0, child: Container(width: 3, color: AppColors.primary)),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(width: 40, height: 40, alignment: Alignment.center, decoration: BoxDecoration(color: u.iconBg, borderRadius: BorderRadius.circular(14)), child: Icon(u.icon, size: 16, color: u.iconColor)),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(child: Text(u.title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.foreground))),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: u.badgeColor.withAlphaFrac(0.1), borderRadius: BorderRadius.circular(999)),
                            child: Text(u.badge, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: u.badgeColor)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(u.desc, style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground, height: 1.4)),
                      const SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(u.time, style: const TextStyle(fontSize: 11, color: AppColors.subtitle)),
                          GestureDetector(
                            onTap: () {
                              setState(() => u.unread = false);
                            },
                            child: const Row(
                              children: [
                                Text('View', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary)),
                                Icon(Icons.chevron_right, size: 12, color: AppColors.primary),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
