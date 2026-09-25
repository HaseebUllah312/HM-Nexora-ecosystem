import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'navigation.dart';
import 'theme.dart';
import 'services/app_preferences.dart';
import 'services/supabase_service.dart';
import 'screens/auth/splash_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/main_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  } catch (_) {}
  try {
    await SupabaseService.initialize();
  } catch (e) {
    debugPrint('Supabase init error: $e');
  }
  try {
    await AppPreferences.instance.load();
  } catch (e) {
    debugPrint('AppPreferences load error: $e');
  }
  runApp(const HMNexoraApp());
}

class HMNexoraApp extends StatelessWidget {
  const HMNexoraApp({super.key});

  @override
  Widget build(BuildContext context) {
    final prefs = AppPreferences.instance;
    return AnimatedBuilder(
      animation: prefs,
      builder: (context, _) => MaterialApp(
        title: 'HM Nexora',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(seed: prefs.accent),
        darkTheme: buildDarkAppTheme(seed: prefs.accent),
        themeMode: prefs.themeMode,
        builder: (context, child) {
          final mq = MediaQuery.of(context);
          return MediaQuery(data: mq.copyWith(textScaler: TextScaler.linear(prefs.textScale)), child: child ?? const SizedBox.shrink());
        },
        home: const RootController(),
      ),
    );
  }
}

/// Owns the top-level HM Nexora navigation state.
/// Supabase Auth persists the user session between launches.
class RootController extends StatefulWidget {
  const RootController({super.key});

  @override
  State<RootController> createState() => _RootControllerState();
}

class _RootControllerState extends State<RootController> {
  String flow = 'auth'; // 'auth' | 'main'
  String authScreen = 'splash';
  String mainScreen = 'home';
  String selectedSubject = 'Mathematics';

  @override
  void initState() {
    super.initState();
    final client = SupabaseService.client;
    if (client != null) {
      client.auth.onAuthStateChange.listen((event) {
        if (!mounted) return;
        final signedIn = event.session != null;
        if (signedIn && flow == 'auth' && authScreen != 'splash') {
          navigate('main');
        }
      });
    }
  }

  void navigate(String target, [Map<String, String>? data]) {
    setState(() {
      if (Screens.auth.contains(target)) {
        flow = 'auth';
        authScreen = target;
      } else if (Screens.main.contains(target)) {
        flow = 'main';
        mainScreen = target;
        if (data != null && data.containsKey('subject')) {
          selectedSubject = data['subject']!;
        }
      } else if (target == 'main') {
        flow = 'main';
        mainScreen = 'home';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    if (flow == 'auth') {
      switch (authScreen) {
        case 'onboard':
          body = OnboardingScreen(navigate: navigate);
          break;
        case 'login':
          body = LoginScreen(navigate: navigate);
          break;
        case 'register':
          body = RegisterScreen(navigate: navigate);
          break;
        case 'splash':
        default:
          body = SplashScreen(navigate: navigate);
      }
    } else {
      body = MainShell(
        screen: mainScreen,
        selectedSubject: selectedSubject,
        navigate: navigate,
      );
    }

    return Scaffold(
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 250),
        child: SizedBox.expand(key: ValueKey('$flow-$authScreen-$mainScreen'), child: body),
      ),
    );
  }
}
