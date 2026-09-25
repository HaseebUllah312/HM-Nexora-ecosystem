import 'cpp_engine.dart';
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class NexoraApiService {

  static Future<Map<String, dynamic>> compileCpp({
    required String code,
    String stdin = '',
    bool forceOffline = false,
  }) async {
    final result = await CppEngine.executeCode(sourceCode: code, stdin: stdin);
    return {
      'success': result.success,
      'output': result.output,
      'stdout': result.stdout,
      'stderr': result.stderr,
      'time': result.time,
      'memory': result.memory,
      'exitCode': result.exitCode,
      'diagnostics': result.compilerDiagnostics,
    };
  }

  static Future<Map<String, dynamic>> aiCodeAssist({
    required String code,
    required String error,
  }) async {
    final result = await CppEngine.executeCode(sourceCode: code);
    return {
      'explanation': result.stderr.isNotEmpty
          ? 'Diagnostics identified issue:\n' + result.stderr
          : 'Code analysis complete. Check logic and bounds.',
      'fix_suggestion': 'Review compiler output above.',
      'confidence': 95,
    };
  }

  static const List<String> _cobaltInstances = [
    'https://cobalt-api.kwiatekm.tokyo',
    'https://api.cobalt.tools',
    'https://co.wuk.sh',
    'https://cobalt.hyonsu.com',
  ];

  static Future<Map<String, dynamic>?> fetchVideoMeta(String url) async {
    final cleanUrl = url.trim();
    if (cleanUrl.isEmpty) return null;

    final ytId = _extractYouTubeId(cleanUrl);

    // 1. YouTube oEmbed
    if (ytId != null) {
      try {
        final ytOembed = Uri.parse(
            'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=$ytId&format=json');
        final resp = await http.get(ytOembed).timeout(const Duration(seconds: 6));
        if (resp.statusCode == 200) {
          final data = jsonDecode(resp.body);
          return {
            'title': data['title'] ?? 'YouTube Lecture Video',
            'author': data['author_name'] ?? 'Virtual University / YouTube',
            'thumbnail': 'https://img.youtube.com/vi/$ytId/hqdefault.jpg',
            'url': cleanUrl,
            'ytId': ytId,
          };
        }
      } catch (_) {}

      return {
        'title': 'YouTube Lecture Video ($ytId)',
        'author': 'YouTube Creator',
        'thumbnail': 'https://img.youtube.com/vi/$ytId/hqdefault.jpg',
        'url': cleanUrl,
        'ytId': ytId,
      };
    }

    // 2. Universal NoEmbed
    try {
      final oEmbedUri = Uri.parse(
          'https://noembed.com/embed?url=${Uri.encodeComponent(cleanUrl)}');
      final resp = await http.get(oEmbedUri).timeout(const Duration(seconds: 6));
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body);
        if (data['title'] != null) {
          return {
            'title': data['title'] ?? 'Lecture Video',
            'author': data['author_name'] ?? 'Online Lecture Stream',
            'thumbnail': data['thumbnail_url'] ??
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
            'url': cleanUrl,
          };
        }
      }
    } catch (_) {}

    final uri = Uri.tryParse(cleanUrl);
    final fileName = uri != null && uri.pathSegments.isNotEmpty
        ? uri.pathSegments.last
        : 'Lecture_Media_Stream';
    return {
      'title': fileName,
      'author': 'Direct VULMS Lecture Stream',
      'thumbnail': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
      'url': cleanUrl,
    };
  }

  static Future<Map<String, dynamic>?> resolveDownloadUrl({
    required String url,
    required String format,
  }) async {
    final cleanUrl = url.trim();
    final isAudio = format == 'mp3';
    final qualityParam = format == 'mp3' ? '320' : format;

    // 1. Direct High-Speed Real Stream from Dedicated Oracle / Cloudflare Backend
    final backendApiUrl =
        'https://hm-nexora-ecosystem.haseebsaleem312.workers.dev/api/download?url=${Uri.encodeComponent(cleanUrl)}&format=${isAudio ? "mp3" : "mp4"}&quality=$qualityParam';

    return {
      'success': true,
      'downloadUrl': backendApiUrl,
      'title': 'HM_Nexora_${isAudio ? "Audio" : "Video"}',
      'format': format,
    };
  }

  /// Safe Direct File Downloader into App / Device Storage with Progress
  static Future<File?> downloadFileToDevice({
    required String fileUrl,
    required String fileName,
    void Function(double progress)? onProgress,
  }) async {
    try {
      final client = http.Client();
      final request = http.Request('GET', Uri.parse(fileUrl));
      final response = await client.send(request);

      if (response.statusCode != 200) return null;

      final totalBytes = response.contentLength ?? 0;
      int receivedBytes = 0;

      // Determine save folder safely
      Directory targetDir;
      if (Platform.isAndroid) {
        final publicDownload = Directory('/storage/emulated/0/Download/HM_Nexora');
        if (!await publicDownload.exists()) {
          try {
            await publicDownload.create(recursive: true);
          } catch (_) {}
        }
        targetDir = publicDownload;
      } else {
        targetDir = Directory.systemTemp;
      }

      final sanitizedName = fileName.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
      final saveFile = File('${targetDir.path}/$sanitizedName');

      final sink = saveFile.openWrite();
      await for (var chunk in response.stream) {
        receivedBytes += chunk.length;
        sink.add(chunk);
        if (totalBytes > 0 && onProgress != null) {
          onProgress(receivedBytes / totalBytes);
        }
      }

      await sink.flush();
      await sink.close();
      return saveFile;
    } catch (e) {
      debugPrint('Safe File Download Error: $e');
      return null;
    }
  }

  static String? _extractYouTubeId(String url) {
    try {
      final uri = Uri.parse(url);
      if (uri.host.contains('youtu.be')) {
        return uri.pathSegments.isNotEmpty ? uri.pathSegments.first : null;
      }
      if (uri.queryParameters.containsKey('v')) {
        return uri.queryParameters['v'];
      }
      if (uri.pathSegments.contains('shorts')) {
        final idx = uri.pathSegments.indexOf('shorts');
        if (idx + 1 < uri.pathSegments.length) return uri.pathSegments[idx + 1];
      }
    } catch (_) {}
    return null;
  }
}
