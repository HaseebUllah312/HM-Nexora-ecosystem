import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/vault_service.dart';
import '../theme.dart';

class InAppDocumentViewer extends StatefulWidget {
  final String title;
  final String url;
  final String courseCode;
  final String category;

  const InAppDocumentViewer({
    super.key,
    required this.title,
    required this.url,
    this.courseCode = '',
    this.category = '',
  });

  static void open(
    BuildContext context, {
    required String title,
    required String url,
    String courseCode = '',
    String category = '',
  }) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (ctx) => InAppDocumentViewer(
          title: title,
          url: url,
          courseCode: courseCode,
          category: category,
        ),
      ),
    );
  }

  @override
  State<InAppDocumentViewer> createState() => _InAppDocumentViewerState();
}

class _InAppDocumentViewerState extends State<InAppDocumentViewer> {
  InAppWebViewController? _webViewController;
  double _progress = 0;
  bool _isSaved = false;

  String _formatEmbedUrl(String rawUrl) {
    if (rawUrl.isEmpty) return rawUrl;

    // 1. Try extracting Google Drive file ID
    final match = RegExp(r'/file/d/([a-zA-Z0-9_-]+)').firstMatch(rawUrl) ??
        RegExp(r'[?&]id=([a-zA-Z0-9_-]+)').firstMatch(rawUrl);

    if (match != null && match.group(1) != null) {
      final fileId = match.group(1)!;
      // Google Drive embedded preview URL (bypasses Gmail login prompt!)
      return 'https://drive.google.com/file/d/$fileId/preview';
    }

    // 2. Google Docs / PDF Embedded Viewer fallback
    if (rawUrl.toLowerCase().contains('.pdf') || rawUrl.toLowerCase().contains('.doc')) {
      return 'https://docs.google.com/gview?embedded=true&url=${Uri.encodeComponent(rawUrl)}';
    }

    return rawUrl;
  }

  Future<void> _saveToVault() async {
    await VaultService.instance.save(
      VaultItem(
        id: 'vault_${DateTime.now().millisecondsSinceEpoch}',
        title: widget.title,
        type: widget.category.isNotEmpty ? widget.category : 'Document',
        course: widget.courseCode,
        url: widget.url,
        source: 'in_app_viewer',
        createdAt: DateTime.now(),
      ),
    );

    if (mounted) {
      setState(() => _isSaved = true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Saved "${widget.title}" to Study Vault! 💾'),
          backgroundColor: AppColors.green,
        ),
      );
    }
  }

  Future<void> _openExternal() async {
    final uri = Uri.tryParse(widget.url);
    if (uri != null) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final embedUrl = _formatEmbedUrl(widget.url);

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: cs.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              widget.title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            if (widget.courseCode.isNotEmpty || widget.category.isNotEmpty)
              Text(
                '${widget.courseCode} ${widget.category.isNotEmpty ? '• ${widget.category}' : ''}'
                    .trim(),
                style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant),
              ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: _isSaved ? 'Saved to Vault' : 'Save to Study Vault',
            icon: Icon(
              _isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
              color: _isSaved ? AppColors.primary : cs.onSurface,
            ),
            onPressed: _saveToVault,
          ),
          IconButton(
            tooltip: 'Open in External Drive App',
            icon: const Icon(Icons.open_in_new_rounded, size: 20),
            onPressed: _openExternal,
          ),
        ],
      ),
      body: Column(
        children: [
          if (_progress < 1.0)
            LinearProgressIndicator(
              value: _progress == 0 ? null : _progress,
              backgroundColor: AppColors.accent,
              valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
              minHeight: 3,
            ),
          Expanded(
            child: InAppWebView(
              initialUrlRequest: URLRequest(url: WebUri(embedUrl)),
              initialSettings: InAppWebViewSettings(
                javaScriptEnabled: true,
                domStorageEnabled: true,
                allowFileAccessFromFileURLs: true,
                allowUniversalAccessFromFileURLs: true,
                useShouldOverrideUrlLoading: true,
                mediaPlaybackRequiresUserGesture: false,
                cacheEnabled: true,
                userAgent:
                    'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 NexoraAppViewer',
              ),
              onWebViewCreated: (controller) {
                _webViewController = controller;
              },
              onProgressChanged: (controller, progress) {
                if (mounted) setState(() => _progress = progress / 100);
              },
            ),
          ),
        ],
      ),
    );
  }
}
