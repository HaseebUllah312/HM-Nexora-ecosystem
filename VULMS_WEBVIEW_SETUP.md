# HM Nexora VULMS WebView Setup

This build follows the direct Flutter WebView approach:

1. AndroidManifest.xml
   - INTERNET permission
   - ACCESS_NETWORK_STATE permission
   - hardware acceleration enabled

2. pubspec.yaml
   - webview_flutter
   - webview_flutter_android
   - webview_flutter_wkwebview

3. main.dart
   - WidgetsFlutterBinding.ensureInitialized()
   - Supabase initialization
   - no native VULMS Activity/MethodChannel

4. LmsScreen
   - creates WebViewController
   - JavaScript unrestricted
   - NavigationDelegate
   - Android cookies / third-party cookies
   - file selector
   - direct WebViewWidget rendering on Android
   - HM Nexora JavaScript engine injected after onPageFinished

Important:
The Android System WebView must be installed/enabled on the device.
