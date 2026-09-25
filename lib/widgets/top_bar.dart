import 'package:flutter/material.dart';
import '../navigation.dart';
import '../theme.dart';
import '../utils/user_display.dart';

class TopBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final VoidCallback onMenuPress;
  final VoidCallback onSearchPress;
  final bool showBack;
  final VoidCallback onBack;
  final NavigateFn navigate;

  const TopBar({
    super.key,
    required this.title,
    required this.onMenuPress,
    required this.onSearchPress,
    required this.showBack,
    required this.onBack,
    required this.navigate,
  });

  @override
  Size get preferredSize => const Size.fromHeight(56);

  Widget _iconBtn(BuildContext context, IconData icon, VoidCallback onTap, {Widget? badge}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHigh, borderRadius: BorderRadius.circular(12)),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Icon(icon, size: 18, color: Theme.of(context).colorScheme.onSurface),
            if (badge != null) Positioned(top: -2, right: -2, child: badge),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(bottom: BorderSide(color: Theme.of(context).colorScheme.outlineVariant)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        children: [
          if (showBack)
            _iconBtn(context, Icons.chevron_left, onBack)
          else
            _iconBtn(context, Icons.menu, onMenuPress),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Theme.of(context).colorScheme.onSurface),
            ),
          ),
          _iconBtn(context, Icons.search, onSearchPress),
          const SizedBox(width: 8),
          _iconBtn(
            context, Icons.notifications_outlined,
            () => navigate('updates'),
            badge: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(color: AppColors.red, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 1)),
            ),
          ),
          const SizedBox(width: 8),
          GestureDetector(
            onTap: () => navigate('profile'),
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primary, width: 2),
                gradient: AppColors.aiGradient,
              ),
              alignment: Alignment.center,
              child: Text(UserDisplay.initials(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
            ),
          ),
        ],
      ),
    );
  }
}
