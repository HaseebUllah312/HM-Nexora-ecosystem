import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../navigation.dart';
import '../../services/nexora_api_service.dart';

class VideoDownloaderScreen extends StatefulWidget {
  final NavigateFn? navigate;
  const VideoDownloaderScreen({super.key, this.navigate});

  @override
  State<VideoDownloaderScreen> createState() => _VideoDownloaderScreenState();
}

class _VideoDownloaderScreenState extends State<VideoDownloaderScreen> {
  final TextEditingController _urlController = TextEditingController();
  bool _isFetchingMeta = false;
  bool _isDownloading = false;
  Map<String, dynamic>? _videoMeta;
  String _selectedFormat = '720';
  String _statusText = '';
  double _progressValue = 0.0;

  final List<Map<String, String>> _formats = [
    {'label': '1080p Full HD (MP4)', 'val': '1080', 'badge': 'High Quality'},
    {'label': '720p HD Video (MP4)', 'val': '720', 'badge': 'Recommended'},
    {'label': '480p Standard (MP4)', 'val': '480', 'badge': 'Fast'},
    {'label': '320kbps Audio (MP3)', 'val': 'mp3', 'badge': 'Audio Only'},
  ];

  @override
  void initState() {
    super.initState();
    _checkClipboard();
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  Future<void> _checkClipboard() async {
    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      final text = data?.text?.trim() ?? '';
      if (text.startsWith('http://') || text.startsWith('https://')) {
        _urlController.text = text;
        _fetchMetadata();
      }
    } catch (_) {}
  }

  Future<void> _pasteFromClipboard() async {
    try {
      final data = await Clipboard.getData(Clipboard.kTextPlain);
      final text = data?.text?.trim() ?? '';
      if (text.isNotEmpty) {
        setState(() {
          _urlController.text = text;
        });
        _fetchMetadata();
      }
    } catch (_) {}
  }

  Future<void> _fetchMetadata() async {
    final url = _urlController.text.trim();
    if (url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter or paste a video link.')),
      );
      return;
    }

    setState(() {
      _isFetchingMeta = true;
      _statusText = 'Fetching media details...';
    });

    try {
      final meta = await NexoraApiService.fetchVideoMeta(url);
      if (mounted) {
        setState(() {
          _videoMeta = meta;
          _isFetchingMeta = false;
          _statusText = '';
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isFetchingMeta = false;
          _statusText = 'Failed to load video info.';
        });
      }
    }
  }

  Future<void> _startDownload() async {
    final url = _urlController.text.trim();
    if (url.isEmpty) return;

    setState(() {
      _isDownloading = true;
      _statusText = 'Resolving high-speed stream...';
      _progressValue = 0.2;
    });

    try {
      final result = await NexoraApiService.resolveDownloadUrl(
        url: url,
        format: _selectedFormat,
      );

      if (result != null && result['downloadUrl'] != null) {
        final downloadUrl = result['downloadUrl'].toString();
        final fileName = '${result['title'] ?? 'video'}.${_selectedFormat == 'mp3' ? 'mp3' : 'mp4'}';

        // Check if direct stream link for in-app byte downloading
        if (downloadUrl.startsWith('http') && (downloadUrl.contains('.mp4') || downloadUrl.contains('.mp3') || downloadUrl.contains('stream') || downloadUrl.contains('cobalt'))) {
          setState(() {
            _statusText = 'Downloading file to device storage...';
          });

          final file = await NexoraApiService.downloadFileToDevice(
            fileUrl: downloadUrl,
            fileName: fileName,
            onProgress: (p) {
              if (mounted) {
                setState(() {
                  _progressValue = p;
                  _statusText = 'Downloading: ${(p * 100).toInt()}%';
                });
              }
            },
          );

          if (mounted) {
            setState(() {
              _isDownloading = false;
              _progressValue = 1.0;
              _statusText = file != null ? '✅ Saved to Downloads / HM_Nexora' : 'Completed!';
            });

            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: const Color(0xFF10B981),
                content: Text(file != null ? 'Downloaded: ${file.path}' : 'Download finished!'),
              ),
            );
          }
        } else {
          // Open via external browser safe launch
          final uri = Uri.parse(downloadUrl);
          try {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } catch (_) {
            await launchUrl(uri, mode: LaunchMode.inAppWebView);
          }

          if (mounted) {
            setState(() {
              _progressValue = 1.0;
              _isDownloading = false;
              _statusText = 'Download launched in browser!';
            });
          }
        }
      } else {
        throw Exception('Could not extract direct stream.');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isDownloading = false;
          _statusText = 'Opening in browser download portal...';
        });
        final uri = Uri.tryParse(url);
        if (uri != null) {
          try {
            await launchUrl(uri, mode: LaunchMode.externalApplication);
          } catch (_) {}
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF1E293B),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _urlController,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Paste YouTube / Shorts / Lecture link...',
                      hintStyle: const TextStyle(color: Colors.white30),
                      prefixIcon: const Icon(Icons.link, color: Color(0xFF6366F1)),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.content_paste, color: Color(0xFF10B981)),
                        tooltip: 'Paste Link',
                        onPressed: _pasteFromClipboard,
                      ),
                      filled: true,
                      fillColor: const Color(0xFF0F172A),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _fetchMetadata(),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _isFetchingMeta ? null : _fetchMetadata,
                    icon: _isFetchingMeta
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.search, color: Colors.white),
                    label: Text(
                      _isFetchingMeta ? 'Fetching...' : 'Fetch Media',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),

            if (_videoMeta != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF475569)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_videoMeta!['thumbnail'] != null && _videoMeta!['thumbnail'].toString().isNotEmpty)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.network(
                          _videoMeta!['thumbnail'],
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            height: 120,
                            color: const Color(0xFF334155),
                            child: const Center(
                              child: Icon(Icons.video_library, size: 48, color: Colors.white30),
                            ),
                          ),
                        ),
                      ),
                    const SizedBox(height: 10),
                    Text(
                      _videoMeta!['title'] ?? 'Video Title',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (_videoMeta!['author'] != null)
                      Text(
                        _videoMeta!['author'],
                        style: const TextStyle(color: Colors.white60, fontSize: 12),
                      ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              const Text(
                'Select Quality / Format',
                style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              const SizedBox(height: 8),

              ..._formats.map((f) {
                final isSelected = _selectedFormat == f['val'];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF312E81) : const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF6366F1) : const Color(0xFF334155),
                    ),
                  ),
                  child: ListTile(
                    dense: true,
                    leading: Icon(
                      f['val'] == 'mp3' ? Icons.audiotrack : Icons.videocam,
                      color: isSelected ? const Color(0xFF818CF8) : Colors.white60,
                    ),
                    title: Text(
                      f['label']!,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13),
                    ),
                    trailing: Text(
                      f['badge']!,
                      style: TextStyle(
                        color: isSelected ? const Color(0xFF38BDF8) : Colors.white38,
                        fontSize: 11,
                      ),
                    ),
                    onTap: () => setState(() => _selectedFormat = f['val']!),
                  ),
                );
              }),

              const SizedBox(height: 16),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF10B981),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _isDownloading ? null : _startDownload,
                icon: const Icon(Icons.download_for_offline, color: Colors.white),
                label: Text(
                  _isDownloading ? 'Downloading Media...' : 'Download Now',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
              ),
            ],

            if (_isDownloading || _statusText.isNotEmpty) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Column(
                  children: [
                    LinearProgressIndicator(
                      value: _progressValue > 0 ? _progressValue : null,
                      color: const Color(0xFF6366F1),
                      backgroundColor: const Color(0xFF334155),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _statusText,
                      style: const TextStyle(color: Colors.white70, fontSize: 12),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
