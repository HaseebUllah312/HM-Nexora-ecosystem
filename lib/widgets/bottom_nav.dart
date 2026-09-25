import 'package:flutter/material.dart';
import '../navigation.dart';
import '../services/app_preferences.dart';
import '../utils/i18n.dart';

class BottomNav extends StatelessWidget {
  final String active;
  final NavigateFn navigate;
  const BottomNav({super.key, required this.active, required this.navigate});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accentColor = AppPreferences.instance.accent;

    return SizedBox(
      height: 76,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Navigation Bar Background
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              height: 62,
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                border: Border(
                  top: BorderSide(
                    color: theme.colorScheme.outlineVariant.withOpacity(0.5),
                  ),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  _navItem(context, 'home', Icons.home_rounded, I18n.t('home')),
                  _navItem(context, 'subjects', Icons.menu_book_rounded, I18n.t('subjects')),
                  const Expanded(child: SizedBox.shrink()), // Center space for FAB
                  _navItem(context, 'community', Icons.people_alt_rounded, I18n.t('community')),
                  _navItem(context, 'settings', Icons.settings_rounded, I18n.t('settings')),
                ],
              ),
            ),
          ),

          // Prominent Center Elevated VULMS FAB Button
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Center(
              child: GestureDetector(
                onTap: () => navigate('lms'),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      curve: Curves.easeOutCubic,
                      width: active == 'lms' ? 62 : 56,
                      height: active == 'lms' ? 62 : 56,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            accentColor,
                            accentColor.withRed((accentColor.red - 30).clamp(0, 255)),
                          ],
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: accentColor.withOpacity(0.42),
                            blurRadius: active == 'lms' ? 18 : 12,
                            offset: const Offset(0, 6),
                          ),
                        ],
                        border: Border.all(
                          color: Colors.white,
                          width: 3,
                        ),
                      ),
                      child: const Icon(
                        Icons.school_rounded,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      I18n.t('vulms'),
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        color: active == 'lms' ? accentColor : theme.colorScheme.onSurfaceVariant,
                        letterSpacing: 0.2,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _navItem(BuildContext context, String id, IconData icon, String label) {
    final theme = Theme.of(context);
    final isActive = active == id;
    final accentColor = AppPreferences.instance.accent;

    return Expanded(
      child: InkWell(
        onTap: () => navigate(id),
        borderRadius: BorderRadius.circular(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isActive ? 44 : 32,
              height: isActive ? 28 : 28,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isActive ? accentColor.withOpacity(0.12) : Colors.transparent,
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                icon,
                size: 20,
                color: isActive ? accentColor : theme.colorScheme.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                color: isActive ? accentColor : theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
