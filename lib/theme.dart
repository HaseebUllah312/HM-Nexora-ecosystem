import 'package:flutter/material.dart';

class AppColors {
  AppColors._();
  static const Color background = Color(0xFFF8FAFC);
  static const Color foreground = Color(0xFF0F172A);
  static const Color card = Color(0xFFFFFFFF);
  static const Color primary = Color(0xFF4F46E5);
  static const Color primaryDark = Color(0xFF312E81);
  static const Color secondary = Color(0xFFE0F2FE);
  static const Color secondaryForeground = Color(0xFF0369A1);
  static const Color muted = Color(0xFFF1F5F9);
  static const Color mutedForeground = Color(0xFF64748B);
  static const Color accent = Color(0xFFEEF2FF);
  static const Color accentForeground = Color(0xFF4338CA);
  static const Color destructive = Color(0xFFEF4444);
  static const Color border = Color(0xFFE2E8F0);
  static const Color faintBorder = Color(0xFFF1F5F9);
  static const Color subtitle = Color(0xFF94A3B8);
  static const Color subtitle2 = Color(0xFF334155);
  static const Color subtitle3 = Color(0xFF475569);
  static const Color cyan = Color(0xFF06B6D4);
  static const Color cyanLight = Color(0xFF67E8F9);
  static const Color green = Color(0xFF10B981);
  static const Color greenLight = Color(0xFF6EE7B7);
  static const Color amber = Color(0xFFF59E0B);
  static const Color amberDark = Color(0xFFD97706);
  static const Color purple = Color(0xFF8B5CF6);
  static const Color red = Color(0xFFEF4444);
  static const Color indigoLight = Color(0xFF818CF8);

  static const LinearGradient heroGradient = LinearGradient(begin: Alignment.topLeft,end: Alignment.bottomRight,colors: [primary, primaryDark]);
  static const LinearGradient splashGradient = LinearGradient(begin: Alignment.topCenter,end: Alignment.bottomCenter,colors: [primary, primaryDark, Color(0xFF1E1B4B)]);
  static const LinearGradient aiGradient = LinearGradient(begin: Alignment.topLeft,end: Alignment.bottomRight,colors: [primary, cyan]);
  static const LinearGradient cyanGradient = LinearGradient(begin: Alignment.topLeft,end: Alignment.bottomRight,colors: [Color(0xFF0891B2), cyan]);
}

ThemeData buildAppTheme({Color seed = AppColors.primary}) {
  final scheme = ColorScheme.fromSeed(seedColor: seed, brightness: Brightness.light);
  return ThemeData(useMaterial3:true,fontFamily:'Roboto',colorScheme:scheme,scaffoldBackgroundColor:AppColors.background,
    cardTheme: const CardThemeData(color: Colors.white, elevation: 0), splashFactory: InkRipple.splashFactory);
}

ThemeData buildDarkAppTheme({Color seed = AppColors.primary}) {
  final scheme = ColorScheme.fromSeed(seedColor: seed, brightness: Brightness.dark, surface: const Color(0xFF171C27));
  return ThemeData(useMaterial3:true,fontFamily:'Roboto',brightness:Brightness.dark,colorScheme:scheme,
    scaffoldBackgroundColor:const Color(0xFF0F1420),canvasColor:const Color(0xFF0F1420),
    cardTheme:const CardThemeData(color:Color(0xFF171C27),elevation:0),dialogTheme:const DialogThemeData(backgroundColor:Color(0xFF171C27)),
    bottomSheetTheme:const BottomSheetThemeData(backgroundColor:Color(0xFF171C27)),splashFactory:InkRipple.splashFactory);
}

extension ColorAlpha on Color { Color withAlphaFrac(double frac) => withOpacity(frac.clamp(0.0,1.0)); }
