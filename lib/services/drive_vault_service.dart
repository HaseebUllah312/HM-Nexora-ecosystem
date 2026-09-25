import 'dart:convert';
import 'package:flutter/services.dart';

class DriveVaultFile {
  final String id;
  final String courseCode;
  final String title;
  final String fileName;
  final String category;
  final String url;
  final String driveFileId;
  final String status;
  final DateTime? createdAt;

  DriveVaultFile({
    required this.id,
    required this.courseCode,
    required this.title,
    required this.fileName,
    required this.category,
    required this.url,
    required this.driveFileId,
    required this.status,
    this.createdAt,
  });

  factory DriveVaultFile.fromJson(Map<String, dynamic> j) {
    return DriveVaultFile(
      id: (j['id'] ?? '').toString(),
      courseCode: (j['course_code'] ?? '').toString().trim().toUpperCase(),
      title: (j['title'] ?? '').toString(),
      fileName: (j['file_name'] ?? '').toString(),
      category: (j['category'] ?? 'Study Material').toString(),
      url: (j['url'] ?? '').toString(),
      driveFileId: (j['drive_file_id'] ?? '').toString(),
      status: (j['status'] ?? 'approved').toString(),
      createdAt: DateTime.tryParse((j['created_at'] ?? '').toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'course_code': courseCode,
        'title': title,
        'file_name': fileName,
        'category': category,
        'url': url,
        'drive_file_id': driveFileId,
        'status': status,
        'created_at': createdAt?.toIso8601String(),
      };
}

class DriveVaultService {
  DriveVaultService._();
  static final DriveVaultService instance = DriveVaultService._();

  List<DriveVaultFile>? _cachedVault;
  bool _isLoading = false;
  Map<String, List<DriveVaultFile>> _courseIndex = {};
  Set<String> _uniqueCourses = {};

  bool get isLoaded => _cachedVault != null;
  int get totalCount => _cachedVault?.length ?? 0;
  int get courseCount => _uniqueCourses.length;

  Future<List<DriveVaultFile>> loadVault() async {
    if (_cachedVault != null) return _cachedVault!;
    if (_isLoading) {
      while (_isLoading) {
        await Future.delayed(const Duration(milliseconds: 50));
      }
      return _cachedVault ?? [];
    }

    _isLoading = true;
    try {
      String jsonString;
      try {
        jsonString = await rootBundle.loadString('lib/assets/structured_master_drive_vault.json');
      } catch (_) {
        jsonString = await rootBundle.loadString('lib/assets/indexed_drive_vault.json');
      }
      final List rawList = jsonDecode(jsonString) as List;
      
      final items = <DriveVaultFile>[];
      final Map<String, List<DriveVaultFile>> idx = {};
      final Set<String> courses = {};

      for (final item in rawList) {
        if (item is Map<String, dynamic>) {
          final file = DriveVaultFile.fromJson(item);
          items.add(file);

          if (file.courseCode.isNotEmpty) {
            courses.add(file.courseCode);
            idx.putIfAbsent(file.courseCode, () => []).add(file);
          }
        }
      }

      _cachedVault = items;
      _courseIndex = idx;
      _uniqueCourses = courses;
    } catch (e) {
      // Fallback empty if load fails
      _cachedVault = [];
    } finally {
      _isLoading = false;
    }

    return _cachedVault!;
  }

  List<DriveVaultFile> getFilesForCourse(String courseCode) {
    final clean = courseCode.trim().toUpperCase();
    return _courseIndex[clean] ?? [];
  }

  List<DriveVaultFile> search({
    String? query,
    String? courseCode,
    String? category,
    int limit = 100,
  }) {
    if (_cachedVault == null) return [];

    Iterable<DriveVaultFile> results = _cachedVault!;

    if (courseCode != null && courseCode.trim().isNotEmpty) {
      final cleanCourse = courseCode.trim().toUpperCase();
      results = results.where((f) => f.courseCode == cleanCourse);
    }

    if (category != null && category.trim().isNotEmpty && category != 'All') {
      results = results.where((f) => f.category.toLowerCase() == category.trim().toLowerCase());
    }

    if (query != null && query.trim().isNotEmpty) {
      final q = query.trim().toLowerCase();
      final qNoSpaces = q.replaceAll(' ', '');

      results = results.where((f) {
        final title = f.title.toLowerCase();
        final course = f.courseCode.toLowerCase();
        final fileName = f.fileName.toLowerCase();
        final cat = f.category.toLowerCase();

        return title.contains(q) ||
            course.contains(q) ||
            course.replaceAll(' ', '').contains(qNoSpaces) ||
            fileName.contains(q) ||
            cat.contains(q);
      });
    }

    return results.take(limit).toList();
  }

  Map<String, int> getCategoryCounts([String? courseCode]) {
    final files = (courseCode != null && courseCode.trim().isNotEmpty)
        ? getFilesForCourse(courseCode)
        : (_cachedVault ?? []);

    final counts = <String, int>{
      'All': files.length,
      'Past Paper': 0,
      'Grand Quiz': 0,
      'Handout / Notes': 0,
      'Study Material': 0,
      'Assignment Solution': 0,
    };

    for (final f in files) {
      counts[f.category] = (counts[f.category] ?? 0) + 1;
    }

    return counts;
  }

  List<String> getAvailableCourses() {
    final list = _uniqueCourses.toList()..sort();
    return list;
  }
}
