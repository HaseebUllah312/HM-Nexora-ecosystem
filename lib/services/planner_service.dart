import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class PlannerTask {
  final String id;
  String title;
  String subject;
  DateTime due;
  String priority;
  bool done;

  PlannerTask({required this.id, required this.title, required this.subject, required this.due, required this.priority, this.done = false});

  Map<String, dynamic> toJson() => {'id': id, 'title': title, 'subject': subject, 'due': due.toIso8601String(), 'priority': priority, 'done': done};
  factory PlannerTask.fromJson(Map<String, dynamic> j) => PlannerTask(
    id: j['id'].toString(), title: (j['title'] ?? '').toString(), subject: (j['subject'] ?? '').toString(),
    due: DateTime.tryParse((j['due'] ?? '').toString()) ?? DateTime.now(), priority: (j['priority'] ?? 'medium').toString(), done: j['done'] == true,
  );
}

class PlannerService {
  PlannerService._();
  static final PlannerService instance = PlannerService._();
  static const key = 'hmn_planner_tasks_v2';

  Future<List<PlannerTask>> load() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(key);
    if (raw == null || raw.isEmpty) return [];
    try { return (jsonDecode(raw) as List).map((e) => PlannerTask.fromJson(Map<String, dynamic>.from(e))).toList(); } catch (_) { return []; }
  }

  Future<void> save(List<PlannerTask> tasks) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(key, jsonEncode(tasks.map((e) => e.toJson()).toList()));
  }
}
