import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../services/account_service.dart';
import '../../services/subject_activity_service.dart';

class _ContinueItem {
  final String subject, topic, emoji;
  final int progress;
  final Color color;
  const _ContinueItem(this.subject, this.topic, this.progress, this.color, this.emoji);
}

const _defaultContinueLearning = [
  _ContinueItem('CS201', 'Object Oriented Programming — Classes & Objects', 75, Color(0xFF6366F1), '💻'),
  _ContinueItem('MTH101', 'Calculus & Analytical Geometry — Integration', 60, Color(0xFF06B6D4), '📐'),
  _ContinueItem('CS101', 'Introduction to Computing — Algorithms & Logic', 90, Color(0xFF10B981), '⚡'),
  _ContinueItem('ENG101', 'English Comprehension — Business Writing', 45, Color(0xFFF59E0B), '📖'),
];

class _QuickItem {
  final String label, icon, screen;
  final Color bg, accent;
  const _QuickItem(this.label, this.icon, this.bg, this.accent, this.screen);
}

const _quickAccess = [
  _QuickItem('My Subjects', '📚', Color(0xFFEEF2FF), Color(0xFF6366F1), 'subjects'),
  _QuickItem('VULMS Portal', '🎓', Color(0xFFECFEFF), Color(0xFF0891B2), 'lms'),
  _QuickItem('Study Vault', '🗂️', Color(0xFFECFDF5), Color(0xFF059669), 'studyVault'),
  _QuickItem('C++ IDE', '💻', Color(0xFFF5F3FF), Color(0xFF7C3AED), 'cppCompiler'),
  _QuickItem('AI Mentor', '🤖', Color(0xFFFFF1F2), Color(0xFFE11D48), 'aiMentor'),
  _QuickItem('Mock Exam', '📝', Color(0xFFFEF3C7), Color(0xFFD97706), 'mockExam'),
  _QuickItem('Downloader', '📥', Color(0xFFF0FDF4), Color(0xFF10B981), 'videoDownloader'),
  _QuickItem('Planner', '📅', Color(0xFFEFF6FF), Color(0xFF2563EB), 'planner'),
];

const _recentActivity = [
  ('📝', 'CS201 Assignment 1 Solved & Verified', '2h ago', Color(0xFF6366F1)),
  ('🎬', 'MTH101 Video Lecture 14 Fast-Forwarded', '5h ago', Color(0xFF06B6D4)),
  ('✅', 'CS101 Practice Quiz (Score: 10/10)', '1d ago', Color(0xFF10B981)),
];

const _announcements = [
  ('VULMS Midterm Date Sheet Selection Opened', '2h ago', Color(0xFFEF4444), 'Urgent'),
  ('CS201 & CS304 Handouts Updated for Spring 2026', '6h ago', Color(0xFF6366F1), 'Notice'),
  ('Nexora AI Mentor 2.0 Live in In-App LMS', '1d ago', Color(0xFF10B981), 'Update'),
];

class HomeScreen extends StatefulWidget {
  final NavigateFn navigate;
  const HomeScreen({super.key, required this.navigate});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String userName = 'Student';
  String studentId = '';
  List<String> verifiedCourses = [];
  int pendingActivitiesCount = 3;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    final p = await AccountService.instance.loadProfile();
    final courses = await SubjectActivityService.getVerifiedCourses();

    if (mounted) {
      setState(() {
        userName = (p['name'] ?? 'Student').toString();
        studentId = (p['studentId'] ?? '').toString();
        if (courses.isNotEmpty) {
          verifiedCourses = courses;
        }
      });
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 17) return 'Good afternoon 🌤️';
    if (hour < 21) return 'Good evening 🌇';
    return 'Good night 🌙';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final isDark = theme.brightness == Brightness.dark;

    return RefreshIndicator(
      onRefresh: _loadProfileData,
      color: const Color(0xFF6366F1),
      child: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          // 1. Premium Hero Workspace Banner
          Container(
            margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
            clipBehavior: Clip.antiAlias,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6366F1).withValues(alpha: isDark ? 0.35 : 0.2),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 22),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    Color(0xFF4F46E5),
                    Color(0xFF6366F1),
                    Color(0xFF0284C7),
                  ],
                ),
              ),
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned(
                    top: -40,
                    right: -40,
                    child: Container(
                      width: 140,
                      height: 140,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.1),
                      ),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            _getGreeting(),
                            style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                          ),
                          const Spacer(),
                          if (studentId.isNotEmpty)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.25),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.white24),
                              ),
                              child: Text(
                                studentId,
                                style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 10.5, fontWeight: FontWeight.bold),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        userName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w900, letterSpacing: 0.3),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Your Smart Academic Universe',
                        style: TextStyle(color: Colors.white70, fontSize: 12),
                      ),
                      const SizedBox(height: 18),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _heroStatCol('${verifiedCourses.isNotEmpty ? verifiedCourses.length : 6}', 'Courses', Icons.menu_book_rounded),
                            _heroDivider(),
                            _heroStatCol('$pendingActivitiesCount', 'Pending', Icons.pending_actions_rounded),
                            _heroDivider(),
                            _heroStatCol('100%', 'Verified', Icons.verified_rounded),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // 2. Continue Learning Cards
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 22, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _sectionHeader(
                  title: 'Continue Learning',
                  actionLabel: 'All Subjects',
                  onAction: () => widget.navigate('subjects'),
                ),
                const SizedBox(height: 12),
                SizedBox(
                  height: 136,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _defaultContinueLearning.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, i) {
                      final item = _defaultContinueLearning[i];
                      return InkWell(
                        onTap: () => widget.navigate('subjectDetail', {'subject': item.subject}),
                        borderRadius: BorderRadius.circular(18),
                        child: Container(
                          width: 186,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isDark ? const Color(0xFF1E293B) : Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(item.emoji, style: const TextStyle(fontSize: 22)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: item.color.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(999),
                                    ),
                                    child: Text(
                                      '${item.progress}%',
                                      style: TextStyle(color: item.color, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ],
                              ),
                              const Spacer(),
                              Text(
                                item.subject,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: cs.onSurface,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                item.topic,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant),
                              ),
                              const SizedBox(height: 8),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: item.progress / 100,
                                  minHeight: 5,
                                  backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF1F5F9),
                                  valueColor: AlwaysStoppedAnimation(item.color),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // 3. Quick Access Power Grid
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Quick Access & Studios',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.2),
                ),
                const SizedBox(height: 12),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 4,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 10,
                    childAspectRatio: 0.85,
                  ),
                  itemCount: _quickAccess.length,
                  itemBuilder: (_, i) {
                    final item = _quickAccess[i];
                    return InkWell(
                      onTap: () => widget.navigate(item.screen),
                      borderRadius: BorderRadius.circular(16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: isDark ? const Color(0xFF1E293B) : item.bg,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isDark ? const Color(0xFF334155) : item.accent.withValues(alpha: 0.2),
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: item.accent.withValues(alpha: isDark ? 0.12 : 0.08),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Text(item.icon, style: const TextStyle(fontSize: 22)),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            item.label,
                            textAlign: TextAlign.center,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: cs.onSurface,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),

          // 4. Official Announcements Banner
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _sectionHeader(
                  title: 'Announcements & Updates',
                  actionLabel: 'View All',
                  onAction: () => widget.navigate('updates'),
                ),
                const SizedBox(height: 12),
                ..._announcements.map((ann) {
                  final (title, time, color, badge) = ann;
                  return Card(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    margin: const EdgeInsets.only(bottom: 8),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                      side: BorderSide(
                        color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                      ),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              badge,
                              style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(time, style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant)),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),

          // 5. Recent Activity
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Recent Activity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    Icon(Icons.trending_up_rounded, size: 18, color: Color(0xFF6366F1)),
                  ],
                ),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    color: isDark ? const Color(0xFF1E293B) : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0),
                    ),
                  ),
                  child: Column(
                    children: _recentActivity.asMap().entries.map((e) {
                      final (icon, text, time, color) = e.value;
                      final isLast = e.key == _recentActivity.length - 1;
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          border: isLast
                              ? null
                              : Border(
                                  bottom: BorderSide(
                                    color: isDark ? const Color(0xFF334155) : const Color(0xFFF1F5F9),
                                  ),
                                ),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 36,
                              height: 36,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: color.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(icon, style: const TextStyle(fontSize: 16)),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    text,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    time,
                                    style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _heroStatCol(String value, String label, IconData icon) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: const Color(0xFF38BDF8), size: 14),
            const SizedBox(width: 4),
            Text(
              value,
              style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(color: Colors.white70, fontSize: 11),
        ),
      ],
    );
  }

  Widget _heroDivider() => Container(
        height: 24,
        width: 1,
        color: Colors.white24,
      );

  Widget _sectionHeader({
    required String title,
    required String actionLabel,
    required VoidCallback onAction,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.2),
        ),
        InkWell(
          onTap: onAction,
          borderRadius: BorderRadius.circular(6),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            child: Row(
              children: [
                Text(
                  actionLabel,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF6366F1),
                  ),
                ),
                const SizedBox(width: 2),
                const Icon(Icons.arrow_forward_ios_rounded, size: 11, color: Color(0xFF6366F1)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
