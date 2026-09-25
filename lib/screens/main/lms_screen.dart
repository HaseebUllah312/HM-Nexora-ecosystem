import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import '../../navigation.dart';
import '../../services/nexora_extension_loader.dart';
import '../../services/subject_activity_service.dart';

class LmsScreen extends StatefulWidget {
  final NavigateFn navigate;
  final Function(CookieManager)? onLoginSuccess;

  const LmsScreen({
    super.key,
    required this.navigate,
    this.onLoginSuccess,
  });

  @override
  State<LmsScreen> createState() => _LmsScreenState();
}

class _LmsScreenState extends State<LmsScreen> {
  InAppWebViewController? _controller;
  double _progress = 0;
  bool _loggedIn = false;
  bool _canGoBack = false;
  bool _canGoForward = false;
  bool _isDesktopMode = false;
  int _zoomLevel = 100; // 40% to 200%

  final String vulmsUrl = 'https://vulms.vu.edu.pk/';

  final String desktopUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
  final String mobileUserAgent =
      'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36';

  @override
  void initState() {
    super.initState();
  }

  void _applyZoomAndViewport() {
    if (_controller == null) return;
    try {
      final isDesk = _isDesktopMode;
      final js = """
(function() {
  try {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    if ($isDesk) {
      meta.content = 'width=1280, initial-scale=${_zoomLevel / 100.0}, maximum-scale=3.0, user-scalable=yes';
      document.body.style.minWidth = '1280px';
    } else {
      meta.content = 'width=device-width, initial-scale=${_zoomLevel / 100.0}, maximum-scale=3.0, user-scalable=yes';
      document.body.style.minWidth = '100%';
    }
    
    // Inject CSS for smooth scrolling and touch events on mobile
    var scrollStyle = document.getElementById('__nx_scroll_fix__');
    if (!scrollStyle) {
      scrollStyle = document.createElement('style');
      scrollStyle.id = '__nx_scroll_fix__';
      (document.head || document.documentElement).appendChild(scrollStyle);
    }
    scrollStyle.textContent = 'html, body { overflow-y: auto !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; touch-action: pan-x pan-y pinch-zoom !important; height: auto !important; min-height: 100% !important; } form, .wrapper, #aspnetForm, .container, .page-wrapper { overflow: visible !important; height: auto !important; }';
  } catch(e) {}
})();
""";
      _controller?.evaluateJavascript(source: js);
    } catch (_) {}
  }

  void _toggleDesktopMode() {
    setState(() {
      _isDesktopMode = !_isDesktopMode;
    });
    if (_controller != null) {
      try {
        _controller!.setSettings(
          settings: InAppWebViewSettings(
            userAgent: _isDesktopMode ? desktopUserAgent : mobileUserAgent,
            preferredContentMode: _isDesktopMode
                ? UserPreferredContentMode.DESKTOP
                : UserPreferredContentMode.MOBILE,
            loadWithOverviewMode: _isDesktopMode,
            useWideViewPort: true,
            disableVerticalScroll: false,
            disableHorizontalScroll: false,
            overScrollMode: OverScrollMode.ALWAYS,
            useHybridComposition: true,
          ),
        );
        _applyZoomAndViewport();
        _controller!.reload();
      } catch (_) {}
    }
  }

  void _adjustZoom(int delta) {
    final next = (_zoomLevel + delta).clamp(40, 200);
    if (next != _zoomLevel) {
      setState(() => _zoomLevel = next);
      _applyZoomAndViewport();
    }
  }

  void _resetZoom() {
    setState(() => _zoomLevel = 100);
    _applyZoomAndViewport();
  }

  void _scrollToTop() {
    _controller?.evaluateJavascript(source: """
(function() {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch(e) {}
})();
""");
  }

  void _scrollToBottom() {
    _controller?.evaluateJavascript(source: """
(function() {
  try {
    var maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 5000);
    window.scrollTo({ top: maxScroll, behavior: 'smooth' });
  } catch(e) {}
})();
""");
  }

  Future<void> _injectCompanionScripts(InAppWebViewController controller) async {
    try {
      final bypassJs = await NexoraExtensionLoader.getBypassScript();
      await controller.evaluateJavascript(source: bypassJs);
    } catch (_) {}

    try {
      final contentJs = await NexoraExtensionLoader.getFullContentScript();
      await controller.evaluateJavascript(source: contentJs);
    } catch (_) {}

    _applyZoomAndViewport();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: SafeArea(
        child: Column(
          children: [
            // Top Utility Navigation & Control Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    IconButton(
                      icon: Icon(
                        Icons.arrow_back_ios_new_rounded,
                        color: _canGoBack ? Colors.white : Colors.white30,
                        size: 18,
                      ),
                      onPressed: _canGoBack ? () => _controller?.goBack() : null,
                    ),
                    IconButton(
                      icon: Icon(
                        Icons.arrow_forward_ios_rounded,
                        color: _canGoForward ? Colors.white : Colors.white30,
                        size: 18,
                      ),
                      onPressed:
                          _canGoForward ? () => _controller?.goForward() : null,
                    ),
                    IconButton(
                      icon: const Icon(Icons.refresh_rounded, color: Colors.white, size: 20),
                      onPressed: () => _controller?.reload(),
                    ),
                    const SizedBox(width: 4),

                    // Quick Scroll to Top / Bottom Action Buttons
                    IconButton(
                      icon: const Icon(Icons.vertical_align_top_rounded, color: Color(0xFF38BDF8), size: 19),
                      tooltip: 'Scroll to Top',
                      onPressed: _scrollToTop,
                    ),
                    IconButton(
                      icon: const Icon(Icons.vertical_align_bottom_rounded, color: Color(0xFF38BDF8), size: 19),
                      tooltip: 'Scroll to Bottom',
                      onPressed: _scrollToBottom,
                    ),

                    const SizedBox(width: 4),

                    // Desktop / Mobile Mode Toggle
                    InkWell(
                      onTap: _toggleDesktopMode,
                      borderRadius: BorderRadius.circular(8),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: _isDesktopMode
                              ? const Color(0xFF6366F1).withValues(alpha: 0.25)
                              : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: _isDesktopMode
                                ? const Color(0xFF6366F1)
                                : Colors.white12,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              _isDesktopMode
                                 ? Icons.desktop_windows_rounded
                                  : Icons.smartphone_rounded,
                              color: _isDesktopMode
                                  ? const Color(0xFF818CF8)
                                  : Colors.white70,
                              size: 15,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _isDesktopMode ? 'Desktop' : 'Mobile',
                              style: TextStyle(
                                color: _isDesktopMode
                                    ? const Color(0xFF818CF8)
                                    : Colors.white70,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),

                    // Zoom Controls
                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => _adjustZoom(-10),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                              child: Icon(Icons.remove, color: Colors.white70, size: 14),
                            ),
                          ),
                          InkWell(
                            onTap: _resetZoom,
                            child: Text(
                              '$_zoomLevel%',
                              style: const TextStyle(
                                color: Color(0xFF38BDF8),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          InkWell(
                            onTap: () => _adjustZoom(10),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                              child: Icon(Icons.add, color: Colors.white70, size: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),

                    // 1-Tap Skip All Button
                    ElevatedButton.icon(
                      onPressed: () {
                        _controller?.evaluateJavascript(source: """
(function() {
  try {
    if (typeof window.nexoraSkipVideo === 'function') {
      window.nexoraSkipVideo();
    } else {
      var vids = document.querySelectorAll('video');
      vids.forEach(function(v) {
        v.playbackRate = 16.0;
        if (v.duration) v.currentTime = v.duration - 0.5;
        v.play();
      });
    }
  } catch(e) {}
})();
""");
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            backgroundColor: Color(0xFF10B981),
                            behavior: SnackBarBehavior.floating,
                            content: Text('⚡ 1-Tap Video Fast Forward Triggered!'),
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        minimumSize: Size.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      icon: const Icon(Icons.fast_forward_rounded, color: Colors.white, size: 14),
                      label: const Text(
                        'Skip',
                        style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            if (_progress < 1.0)
              LinearProgressIndicator(
                value: _progress,
                backgroundColor: const Color(0xFF1E293B),
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF6366F1)),
                minHeight: 2,
              ),

            // In-App WebView with Full Scroll Gesture priority
            Expanded(
              child: InAppWebView(
                initialUrlRequest: URLRequest(url: WebUri(vulmsUrl)),
                gestureRecognizers: <Factory<OneSequenceGestureRecognizer>>{
                  Factory<OneSequenceGestureRecognizer>(
                    () => EagerGestureRecognizer(),
                  ),
                },
                initialSettings: InAppWebViewSettings(
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  databaseEnabled: true,
                  thirdPartyCookiesEnabled: true,
                  useShouldOverrideUrlLoading: true,
                  cacheEnabled: true,
                  supportZoom: true,
                  builtInZoomControls: true,
                  displayZoomControls: false,
                  verticalScrollBarEnabled: true,
                  horizontalScrollBarEnabled: true,
                  disableVerticalScroll: false,
                  disableHorizontalScroll: false,
                  overScrollMode: OverScrollMode.ALWAYS,
                  useHybridComposition: true,
                  useWideViewPort: true,
                  loadWithOverviewMode: _isDesktopMode,
                  textZoom: 100,
                  allowsInlineMediaPlayback: true,
                  mediaPlaybackRequiresUserGesture: false,
                  mixedContentMode: MixedContentMode.MIXED_CONTENT_ALWAYS_ALLOW,
                  allowFileAccessFromFileURLs: true,
                  allowUniversalAccessFromFileURLs: true,
                  preferredContentMode: _isDesktopMode
                      ? UserPreferredContentMode.DESKTOP
                      : UserPreferredContentMode.MOBILE,
                  userAgent: _isDesktopMode ? desktopUserAgent : mobileUserAgent,
                ),
                onWebViewCreated: (controller) {
                  _controller = controller;

                  controller.addJavaScriptHandler(
                    handlerName: 'nexoraBridge',
                    callback: (args) {
                      try {
                        if (args.isNotEmpty && args[0] is Map) {
                          _handleBridgeAction(Map<String, dynamic>.from(args[0] as Map));
                        }
                      } catch (_) {}
                      return {'ack': true};
                    },
                  );
                },
                onProgressChanged: (controller, progress) {
                  if (mounted) setState(() => _progress = progress / 100);
                },
                onReceivedServerTrustAuthRequest: (controller, challenge) async {
                  return ServerTrustAuthResponse(
                    action: ServerTrustAuthResponseAction.PROCEED,
                  );
                },
                onReceivedError: (controller, request, error) {
                  debugPrint('[LMS WebView Error]: ${error.description}');
                },
                onReceivedHttpError: (controller, request, errorResponse) {
                  debugPrint('[LMS WebView HTTP Error]: ${errorResponse.statusCode}');
                },
                onRenderProcessGone: (controller, detail) {
                  debugPrint('[LMS WebView] Render process recovered, didCrash: ${detail.didCrash}');
                },
                shouldOverrideUrlLoading: (controller, action) async {
                  final uri = action.request.url;
                  if (uri == null) return NavigationActionPolicy.ALLOW;
                  final urlStr = uri.toString().toLowerCase();
                  if (urlStr.startsWith('http://') ||
                      urlStr.startsWith('https://') ||
                      urlStr == 'about:blank') {
                    return NavigationActionPolicy.ALLOW;
                  }
                  return NavigationActionPolicy.CANCEL;
                },
                onLoadStop: (controller, url) async {
                  if (url == null || !mounted) return;
                  final urlStr = url.toString();

                  try {
                    final canBack = await controller.canGoBack();
                    final canForward = await controller.canGoForward();
                    if (mounted) {
                      setState(() {
                        _canGoBack = canBack;
                        _canGoForward = canForward;
                      });
                    }

                    _applyZoomAndViewport();
                    await _injectCompanionScripts(controller);

                    final isDashboard = urlStr.contains('/Framework/') ||
                        urlStr.toLowerCase().contains('dashboard') ||
                        urlStr.toLowerCase().contains('home.aspx');

                    if (isDashboard && !_loggedIn) {
                      if (!mounted) return;
                      setState(() => _loggedIn = true);

                      final cookieManager = CookieManager.instance();
                      widget.onLoginSuccess?.call(cookieManager);

                      // Extract course codes
                      await controller.evaluateJavascript(source: """
(function() {
  try {
    var codes = [];
    document.querySelectorAll('.course-code, [id*="lblCourseCode"], a[href*="CourseDetails.aspx?Course="], strong, .card-title, table tr td').forEach(function(el) {
      var text = (el.textContent || '').trim();
      var matches = text.match(/\\b([A-Z]{2,4}\\d{3}[A-Z]?)\\b/g);
      if (matches) {
        matches.forEach(function(m) {
          var clean = m.toUpperCase();
          if (!codes.includes(clean) && clean.length >= 5) codes.push(clean);
        });
      }
    });
    if (codes.length > 0 && window.flutter_inappwebview) {
      window.flutter_inappwebview.callHandler('nexoraBridge', {
        action: 'sync_verified_subjects',
        courses: codes
      });
    }
  } catch(e) {}
})();
""");
                    }
                  } catch (e) {
                    debugPrint('[LMS onLoadStop error]: $e');
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _handleBridgeAction(Map<String, dynamic> data) {
    if (!mounted) return;
    try {
      final action = data['action'] ?? data['type'];
      if (action == null) return;
      final actStr = action.toString();
      if (actStr == 'sync_verified_subjects') {
        final courses = (data['courses'] as List?)?.map((e) => e.toString()).toList() ?? [];
        if (courses.isNotEmpty) {
          SubjectActivityService.saveVerifiedCourses(courses);
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFF10B981),
                behavior: SnackBarBehavior.floating,
                content: Text('Verified ${courses.length} enrolled VULMS subjects!'),
              ),
            );
          }
        }
      } else if (actStr == 'open_tasks') {
        widget.navigate('planner');
      } else if (actStr == 'open_course_files' ||
          actStr == 'open_study_vault' ||
          actStr == 'open_drive') {
        widget.navigate('studyVault');
      } else if (actStr == 'open_community') {
        widget.navigate('community');
      } else if (actStr == 'open_mock_exam') {
        widget.navigate('mockExam');
      } else if (actStr == 'open_settings') {
        widget.navigate('settings');
      }
    } catch (_) {}
  }
}
