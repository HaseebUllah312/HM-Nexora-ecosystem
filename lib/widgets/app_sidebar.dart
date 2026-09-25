import 'package:flutter/material.dart';
import '../navigation.dart';
import '../theme.dart';
import '../services/auth_service.dart';
import '../utils/user_display.dart';

class _MenuItem {
  final IconData icon;
  final String label;
  final String id;
  final Color color;
  const _MenuItem(this.icon, this.label, this.id, this.color);
}

const List<_MenuItem> _menuItems = [
  _MenuItem(Icons.school_rounded, 'VULMS Portal', 'lms', AppColors.primary),
  _MenuItem(Icons.smart_toy_rounded, 'AI Mentor', 'aiMentor', AppColors.cyan),
  _MenuItem(Icons.assignment_turned_in_rounded, 'AI Mock Exam Platform', 'mockExam', AppColors.primary),
  _MenuItem(Icons.calendar_month_rounded, 'Planner', 'planner', AppColors.purple),
  _MenuItem(Icons.archive_rounded, 'Study Vault', 'studyVault', AppColors.green),
  _MenuItem(Icons.upload_file_rounded, 'Contribute File', 'contributeFile', AppColors.purple),
  _MenuItem(Icons.code_rounded, 'C++ Cloud IDE', 'cppCompiler', AppColors.primary),
  _MenuItem(Icons.download_rounded, 'Video Downloader', 'videoDownloader', AppColors.cyan),
  _MenuItem(Icons.volunteer_activism_rounded, 'Welfare & Fee Aid Bank', 'donationBank', AppColors.green),
  _MenuItem(Icons.person_rounded, 'My Profile', 'profile', AppColors.amber),
  _MenuItem(Icons.settings_rounded, 'Settings', 'settings', AppColors.mutedForeground),
];

class AppSidebar extends StatelessWidget {
  final VoidCallback onClose;
  final NavigateFn navigate;
  const AppSidebar({super.key, required this.onClose, required this.navigate});

  void _handleNav(String id) {
    onClose();
    if (['lms', 'aiMentor', 'cppCompiler', 'videoDownloader', 'mockExam', 'adminPanel', 'planner', 'studyVault', 'contributeFile', 'profile', 'settings', 'donationBank'].contains(id)) {
      navigate(id);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        GestureDetector(
          onTap: onClose,
          child: Container(color: AppColors.foreground.withAlphaFrac(0.5)),
        ),
        Align(
          alignment: Alignment.centerLeft,
          child: Material(
            color: Colors.white,
            borderRadius: const BorderRadius.only(topRight: Radius.circular(24), bottomRight: Radius.circular(24)),
            child: Container(
              width: 280,
              height: double.infinity,
              clipBehavior: Clip.antiAlias,
              decoration: const BoxDecoration(
                borderRadius: BorderRadius.only(topRight: Radius.circular(24), bottomRight: Radius.circular(24)),
              ),
              child: Column(
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(24, 48, 24, 20),
                    decoration: const BoxDecoration(gradient: AppColors.heroGradient),
                    child: Stack(
                      clipBehavior: Clip.none,
                      children: [
                        Positioned(
                          top: -24,
                          right: -24,
                          child: Container(width: 128, height: 128, decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.cyan.withAlphaFrac(0.2))),
                        ),
                        Positioned(
                          top: -4,
                          right: 0,
                          child: IconButton(
                            onPressed: onClose,
                            icon: Icon(Icons.close, color: Colors.white.withAlphaFrac(0.7), size: 22),
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            GestureDetector(
                              onLongPress: () {
                                if (AuthService.instance.isOwner) {
                                  _handleNav('adminPanel');
                                }
                              },
                              child: Container(
                                width: 64,
                                height: 64,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  color: Colors.white.withAlphaFrac(0.2),
                                  border: Border.all(color: Colors.white.withAlphaFrac(0.3), width: 2),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: Text(UserDisplay.initials(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(UserDisplay.name(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                            const SizedBox(height: 2),
                            Text(AuthService.instance.isOwner ? '👑 System Owner & Super Admin' : 'HM Nexora Student', style: TextStyle(color: AuthService.instance.isOwner ? AppColors.amber : Colors.white.withAlphaFrac(0.6), fontSize: 12, fontWeight: AuthService.instance.isOwner ? FontWeight.bold : FontWeight.normal)),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                _pill(AuthService.instance.isOwner ? '👑 Owner' : 'Student', AuthService.instance.isOwner ? AppColors.amber.withAlphaFrac(0.3) : Colors.white.withAlphaFrac(0.15), Colors.white),
                                const SizedBox(width: 8),
                                _pill('Active', AppColors.green.withAlphaFrac(0.3), AppColors.greenLight),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      children: [
                        if (AuthService.instance.isOwner)
                          Container(
                            margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF6366F1).withAlphaFrac(0.35),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: InkWell(
                              onTap: () => _handleNav('adminPanel'),
                              borderRadius: BorderRadius.circular(16),
                              child: const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                child: Row(
                                  children: [
                                    Icon(Icons.admin_panel_settings_rounded, color: Colors.amber, size: 22),
                                    SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text('Admin Control Studio', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Colors.white)),
                                          Text('Super Admin & Cloud Controls', style: TextStyle(fontSize: 10.5, color: Colors.white70)),
                                        ],
                                      ),
                                    ),
                                    Icon(Icons.chevron_right_rounded, size: 18, color: Colors.white70),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        ..._menuItems.map((m) {
                          return InkWell(
                            onTap: () => _handleNav(m.id),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                              child: Row(
                                children: [
                                  Container(
                                    width: 40,
                                    height: 40,
                                    alignment: Alignment.center,
                                    decoration: BoxDecoration(color: m.color.withAlphaFrac(0.1), borderRadius: BorderRadius.circular(14)),
                                    child: Icon(m.icon, size: 18, color: m.color),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Text(m.label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14, color: AppColors.foreground)),
                                  ),
                                  const Icon(Icons.chevron_right, size: 16, color: AppColors.border),
                                ],
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                    child: SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () async {
                          onClose();
                          await AuthService.instance.signOut();
                          navigate('login');
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFFEF4444)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        ),
                        child: const Text('Sign Out', style: TextStyle(color: AppColors.red, fontWeight: FontWeight.w600, fontSize: 14)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _pill(String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(text, style: TextStyle(color: fg, fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}
