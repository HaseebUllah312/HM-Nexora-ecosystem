import 'dart:convert';
import 'package:flutter/services.dart';

class SubjectItem {
  final String code;
  final String name;
  final String type;

  const SubjectItem({
    required this.code,
    required this.name,
    required this.type,
  });

  factory SubjectItem.fromJson(Map<String, dynamic> j) {
    return SubjectItem(
      code: (j['code'] ?? '').toString().toUpperCase().trim(),
      name: (j['name'] ?? '').toString().trim(),
      type: (j['course_type'] ?? 'Theory').toString().trim(),
    );
  }
}

class SubjectCatalogService {
  SubjectCatalogService._();
  static final SubjectCatalogService instance = SubjectCatalogService._();

  List<SubjectItem>? _catalog;
  Map<String, SubjectItem> _codeMap = {};

  bool get isLoaded => _catalog != null;
  int get totalSubjects => _catalog?.length ?? 0;

  Future<List<SubjectItem>> loadCatalog() async {
    if (_catalog != null) return _catalog!;
    try {
      final str = await rootBundle.loadString('lib/assets/vu_all_course_codes_hm_nexora.json');
      final Map<String, dynamic> data = jsonDecode(str);
      final List rawList = data['courses'] as List;

      final items = <SubjectItem>[];
      final map = <String, SubjectItem>{};

      for (final item in rawList) {
        if (item is Map<String, dynamic>) {
          final s = SubjectItem.fromJson(item);
          if (s.code.isNotEmpty) {
            items.add(s);
            map[s.code] = s;
          }
        }
      }

      _catalog = items;
      _codeMap = map;
      return items;
    } catch (e) {
      _catalog = [];
      return [];
    }
  }

  SubjectItem? getSubjectByCode(String code) {
    return _codeMap[code.toUpperCase().trim()];
  }

  String getSubjectTitle(String code) {
    final sub = getSubjectByCode(code);
    if (sub != null && sub.name.isNotEmpty) {
      return '${sub.code} - ${sub.name}';
    }
    return code.toUpperCase().trim();
  }

  List<SubjectItem> searchSubjects(String query) {
    if (_catalog == null) return [];
    final q = query.toLowerCase().trim();
    if (q.isEmpty) return _catalog!;
    return _catalog!.where((s) {
      return s.code.toLowerCase().contains(q) || s.name.toLowerCase().contains(q);
    }).toList();
  }
}
