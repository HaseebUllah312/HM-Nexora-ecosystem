import 'package:flutter/material.dart';
import '../navigation.dart';
import '../widgets/top_bar.dart';
import '../widgets/bottom_nav.dart';
import '../widgets/app_sidebar.dart';
import '../widgets/search_overlay.dart';
import '../widgets/web_right_drawer.dart';

import 'main/home_screen.dart';
import 'main/subjects_screen.dart';
import 'main/subject_detail_screen.dart';
import 'main/lms_screen.dart';
import 'main/ai_mentor_screen.dart';
import 'main/community_screen.dart';
import 'main/updates_screen.dart';
import 'main/planner_screen.dart';
import 'main/study_vault_screen.dart';
import 'main/profile_screen.dart';
import 'main/settings_screen.dart';
import 'main/contribute_file_screen.dart';
import 'main/mock_exam_screen.dart';
import 'main/admin_panel_screen.dart';
import 'main/cpp_compiler_screen.dart';
import 'main/video_downloader_screen.dart';
import 'main/donation_bank_screen.dart';

const List<String> _bottomNavScreens = ['home', 'subjects', 'lms', 'community', 'settings'];
const List<String> _sidebarScreens = [
  'cppCompiler',
  'videoDownloader',
  'planner',
  'updates',
  'studyVault',
  'profile',
  'aiMentor',
  'contributeFile',
  'mockExam',
  'adminPanel',
  'donationBank',
];

class MainShell extends StatefulWidget {
  final String screen;
  final String selectedSubject;
  final NavigateFn navigate;

  const MainShell({
    super.key,
    required this.screen,
    required this.selectedSubject,
    required this.navigate,
  });

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  bool sidebarOpen = false;
  bool searchOpen = false;

  late final Widget _homeScreen;
  late final Widget _subjectsScreen;
  late final Widget _lmsScreen;
  late final Widget _communityScreen;
  late final Widget _settingsScreen;

  @override
  void initState() {
    super.initState();
    _homeScreen = HomeScreen(navigate: widget.navigate);
    _subjectsScreen = SubjectsScreen(navigate: widget.navigate);
    _lmsScreen = LmsScreen(navigate: widget.navigate);
    _communityScreen = CommunityScreen(navigate: widget.navigate);
    _settingsScreen = SettingsScreen(navigate: widget.navigate);
  }

  @override
  Widget build(BuildContext context) {
    final activeNav = _bottomNavScreens.contains(widget.screen) ? widget.screen : 'home';
    final isDesktop = MediaQuery.of(context).size.width >= 800;

    final titles = <String, String>{
      'home': 'HM Nexora',
      'subjects': 'My Subjects',
      'subjectDetail': widget.selectedSubject,
      'lms': 'VULMS Portal',
      'aiMentor': 'AI Mentor',
      'community': 'Community',
      'updates': 'Updates',
      'planner': 'Planner',
      'studyVault': 'Study Vault',
      'profile': 'My Profile',
      'settings': 'Settings',
      'contributeFile': 'Contribute a File',
      'cppCompiler': 'C++ Cloud IDE Studio',
      'videoDownloader': 'Universal Video Downloader',
      'donationBank': 'Fee Aid & Welfare Bank',
    };

    if (isDesktop) {
      // 3-Column Desktop Widescreen Web Dashboard Layout
      return Scaffold(
        body: Row(
          children: [
            // Column 1: Left Desktop Navigation Sidebar
            SizedBox(
              width: 250,
              child: AppSidebar(
                onClose: () {},
                navigate: widget.navigate,
              ),
            ),
            const VerticalDivider(width: 1, thickness: 1),
            // Column 2: Center Main Content Area
            Expanded(
              child: Column(
                children: [
                  TopBar(
                    title: titles[widget.screen] ?? 'HM Nexora',
                    onMenuPress: () {},
                    onSearchPress: () => setState(() => searchOpen = true),
                    showBack: _sidebarScreens.contains(widget.screen) || widget.screen == 'subjectDetail',
                    onBack: () => widget.navigate(widget.screen == 'subjectDetail' ? 'subjects' : 'home'),
                    navigate: widget.navigate,
                  ),
                  Expanded(
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 1200),
                        child: _buildScreenBody(),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            // Column 3: Right Academic Widget Drawer
            WebRightDrawer(navigate: widget.navigate),
          ],
        ),
      );
    }

    // Mobile Phone Screen Layout
    return GestureDetector(
      onHorizontalDragUpdate: (details) {
        if (widget.screen == 'home' && !sidebarOpen && !searchOpen) {
          if (details.delta.dx > 10 && details.globalPosition.dx < 80) {
            setState(() => sidebarOpen = true);
          }
        }
      },
      child: Container(
        color: Theme.of(context).colorScheme.surfaceContainerLowest,
        child: SafeArea(
          top: false,
          child: Stack(
            children: [
              Column(
                children: [
                  SafeArea(
                    bottom: false,
                    child: TopBar(
                      title: titles[widget.screen] ?? 'HM Nexora',
                      onMenuPress: () => setState(() => sidebarOpen = true),
                      onSearchPress: () => setState(() => searchOpen = true),
                      showBack: _sidebarScreens.contains(widget.screen) || widget.screen == 'subjectDetail',
                      onBack: () => widget.navigate(widget.screen == 'subjectDetail' ? 'subjects' : 'home'),
                      navigate: widget.navigate,
                    ),
                  ),
                  Expanded(child: _buildScreenBody()),
                  BottomNav(active: activeNav, navigate: widget.navigate),
                ],
              ),
              if (sidebarOpen)
                Positioned.fill(
                  child: AppSidebar(onClose: () => setState(() => sidebarOpen = false), navigate: widget.navigate),
                ),
              if (searchOpen)
                Positioned.fill(
                  child: SearchOverlay(onClose: () => setState(() => searchOpen = false), navigate: widget.navigate),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildScreenBody() {
    if (_bottomNavScreens.contains(widget.screen)) {
      final index = _bottomNavScreens.indexOf(widget.screen);
      return IndexedStack(
        index: index >= 0 ? index : 0,
        children: [
          _homeScreen,
          _subjectsScreen,
          _lmsScreen,
          _communityScreen,
          _settingsScreen,
        ],
      );
    }

    switch (widget.screen) {
      case 'subjectDetail':
        return SubjectDetailScreen(subject: widget.selectedSubject, navigate: widget.navigate);
      case 'aiMentor':
        return AIMentorScreen(navigate: widget.navigate);
      case 'planner':
        return PlannerScreen(navigate: widget.navigate);
      case 'updates':
        return UpdatesScreen(navigate: widget.navigate);
      case 'studyVault':
        return StudyVaultScreen(navigate: widget.navigate);
      case 'profile':
        return ProfileScreen(navigate: widget.navigate);
      case 'contributeFile':
        return ContributeFileScreen(navigate: widget.navigate);
      case 'mockExam':
        return MockExamScreen(navigate: widget.navigate);
      case 'adminPanel':
        return AdminPanelScreen(navigate: widget.navigate);
      case 'cppCompiler':
        return CppCompilerScreen(navigate: widget.navigate);
      case 'videoDownloader':
        return VideoDownloaderScreen(navigate: widget.navigate);
      case 'donationBank':
        return DonationBankScreen(navigate: widget.navigate);
      default:
        return _homeScreen;
    }
  }
}
