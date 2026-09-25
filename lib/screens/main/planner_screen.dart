import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../navigation.dart';
import '../../services/notification_service.dart';
import '../../services/planner_service.dart';
import '../../services/subject_activity_service.dart';
import '../../theme.dart';
import '../../utils/i18n.dart';

class PlannerScreen extends StatefulWidget {
  final NavigateFn navigate;
  const PlannerScreen({super.key, required this.navigate});

  @override
  State<PlannerScreen> createState() => _PlannerScreenState();
}

class _PlannerScreenState extends State<PlannerScreen> {
  List<PlannerTask> tasks = [];
  bool loading = true;
  String filter = 'all';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    tasks = await PlannerService.instance.load();
    if (mounted) setState(() => loading = false);
  }

  Future<void> _save() async => PlannerService.instance.save(tasks);

  void _shareWhatsAppAlert(PlannerTask task) async {
    final text = '🚨 *HM Nexora LMS Activity Alert for ${task.subject.isNotEmpty ? task.subject : 'Course'}* 🎓\n'
        '📌 *Task:* ${task.title}\n'
        '📅 *Due Date:* ${task.due.day}/${task.due.month}/${task.due.year} at ${task.due.hour}:${task.due.minute.toString().padLeft(2, '0')}\n\n'
        'Prepare & download past papers on HM Nexora: https://hmnexora.com';

    final uri = Uri.parse('https://wa.me/?text=${Uri.encodeComponent(text)}');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _add([PlannerTask? edit]) async {
    final title = TextEditingController(text: edit?.title ?? '');
    final subject = TextEditingController(text: edit?.subject ?? '');
    DateTime due = edit?.due ?? DateTime.now().add(const Duration(days: 1));
    TimeOfDay dueTime = TimeOfDay.fromDateTime(due);
    String priority = edit?.priority ?? 'medium';

    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) => Padding(
          padding: EdgeInsets.fromLTRB(
            18,
            18,
            18,
            MediaQuery.of(ctx).viewInsets.bottom + 18,
          ),
          child: ListView(
            shrinkWrap: true,
            children: [
              Text(
                edit == null ? I18n.t('addTask') : 'Edit Task',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: title,
                decoration: InputDecoration(
                  labelText: I18n.t('taskTitle'),
                  border: const OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: subject,
                decoration: const InputDecoration(
                  labelText: 'Subject / Course Code (e.g. CS407)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(I18n.t('selectDate')),
                subtitle: Text(
                  '${due.day}/${due.month}/${due.year} at ${dueTime.format(ctx)}',
                ),
                trailing: const Icon(Icons.alarm_add_rounded),
                onTap: () async {
                  final d = await showDatePicker(
                    context: ctx,
                    firstDate: DateTime.now().subtract(const Duration(days: 365)),
                    lastDate: DateTime.now().add(const Duration(days: 730)),
                    initialDate: due,
                  );
                  if (d != null && ctx.mounted) {
                    final t = await showTimePicker(
                      context: ctx,
                      initialTime: dueTime,
                    );
                    if (t != null) {
                      setSheet(() {
                        dueTime = t;
                        due = DateTime(d.year, d.month, d.day, t.hour, t.minute);
                      });
                    }
                  }
                },
              ),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: priority,
                decoration: const InputDecoration(
                  labelText: 'Priority',
                  border: OutlineInputBorder(),
                ),
                items: const ['low', 'medium', 'high']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e.toUpperCase())))
                    .toList(),
                onChanged: (v) => setSheet(() => priority = v ?? 'medium'),
              ),
              const SizedBox(height: 14),
              FilledButton(
                onPressed: () => Navigator.pop(ctx, title.text.trim().isNotEmpty),
                child: Text(edit == null ? I18n.t('addTask') : I18n.t('save')),
              ),
            ],
          ),
        ),
      ),
    );

    if (ok == true) {
      final scheduledDate = DateTime(due.year, due.month, due.day, dueTime.hour, dueTime.minute);
      final cleanSubject = subject.text.trim().toUpperCase();
      final cleanTitle = title.text.trim();

      // Check if activity is already registered in the system
      if (edit == null && cleanSubject.isNotEmpty) {
        final existing = await SubjectActivityService.instance.findExistingActivity(
          courseCode: cleanSubject,
          title: cleanTitle,
        );

        if (existing != null && mounted) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              title: const Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.amber, size: 28),
                  SizedBox(width: 10),
                  Text('Activity Already Registered!'),
                ],
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${existing.courseCode} — ${existing.title} is ALREADY registered by ${existing.creatorName}.',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    existing.hasSolution
                        ? '✅ Solved solution is already available for this activity!'
                        : '❓ Solution is not uploaded yet. Visit subject vault to request or upload solution.',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel'),
                ),
                FilledButton.icon(
                  icon: Icon(existing.hasSolution ? Icons.description_rounded : Icons.folder_open_rounded),
                  label: Text(existing.hasSolution ? 'Open Solved Solution' : 'Visit Subject Vault'),
                  onPressed: () {
                    Navigator.pop(ctx);
                    if (existing.hasSolution) {
                      SubjectActivityService.instance.openSolution(context, existing);
                    } else {
                      widget.navigate('subjectDetail', {'subject': existing.courseCode});
                    }
                  },
                ),
              ],
            ),
          );
          return; // Stop duplicate creation
        }
      }

      final taskId = edit?.id ?? DateTime.now().microsecondsSinceEpoch.toString();

      setState(() {
        if (edit == null) {
          final newTask = PlannerTask(
            id: taskId,
            title: cleanTitle,
            subject: cleanSubject,
            due: scheduledDate,
            priority: priority,
          );
          tasks.add(newTask);
        } else {
          edit.title = cleanTitle;
          edit.subject = cleanSubject;
          edit.due = scheduledDate;
          edit.priority = priority;
        }
      });
      await _save();

      if (cleanSubject.isNotEmpty) {
        await SubjectActivityService.instance.registerActivity(
          courseCode: cleanSubject,
          title: cleanTitle,
          type: 'Assignment',
          dueDate: scheduledDate,
        );
      }

      if (mounted) {
        NotificationService.instance.schedulePlannerTaskNotification(
          taskId: taskId,
          title: cleanTitle,
          targetDate: scheduledDate,
          context: context,
        );

        if (cleanSubject.isNotEmpty) {
          NotificationService.instance.broadcastSubjectActivity(
            courseCode: cleanSubject,
            title: cleanTitle,
            activityType: 'Activity',
            dueDate: scheduledDate,
            context: context,
          );
        }
      }
    }
    title.dispose();
    subject.dispose();
  }

  Future<void> _toggle(PlannerTask t) async {
    setState(() => t.done = !t.done);
    await _save();
  }

  Future<void> _delete(PlannerTask t) async {
    setState(() => tasks.removeWhere((x) => x.id == t.id));
    await _save();
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    final cs = Theme.of(context).colorScheme;
    final visible = tasks
        .where((t) =>
            filter == 'all' ||
            (filter == 'pending' && !t.done) ||
            (filter == 'done' && t.done))
        .toList()
      ..sort((a, b) => a.due.compareTo(b.due));
    final pending = tasks.where((e) => !e.done).length;

    return Container(
      color: cs.surfaceContainerLowest,
      child: Column(
        children: [
          Container(
            color: cs.surface,
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        I18n.t('planner'),
                        style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '$pending pending • ${tasks.length} total',
                        style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
                FilledButton.icon(
                  onPressed: () => _add(),
                  icon: const Icon(Icons.add, size: 18),
                  label: Text(I18n.t('addTask')),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'all', label: Text('All')),
                ButtonSegment(value: 'pending', label: Text('Pending')),
                ButtonSegment(value: 'done', label: Text('Done')),
              ],
              selected: {filter},
              onSelectionChanged: (s) => setState(() => filter = s.first),
            ),
          ),
          Expanded(
            child: visible.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.event_note_outlined, size: 46, color: cs.outline),
                        const SizedBox(height: 8),
                        const Text('No planner tasks scheduled'),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: () => _add(),
                          icon: const Icon(Icons.add),
                          label: Text(I18n.t('addTask')),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(14),
                    itemCount: visible.length,
                    itemBuilder: (ctx, i) {
                      final t = visible[i];
                      final overdue = !t.done && t.due.isBefore(DateTime.now());
                      final color = t.priority == 'high'
                          ? AppColors.red
                          : t.priority == 'low'
                              ? AppColors.green
                              : AppColors.amber;
                      return Dismissible(
                        key: ValueKey(t.id),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          color: cs.errorContainer,
                          child: Icon(Icons.delete, color: cs.onErrorContainer),
                        ),
                        onDismissed: (_) => _delete(t),
                        child: Card(
                          child: ListTile(
                            onTap: () => _toggle(t),
                            onLongPress: () => _add(t),
                            leading: Icon(
                              t.done ? Icons.check_circle : Icons.radio_button_unchecked,
                              color: t.done ? AppColors.green : color,
                            ),
                            title: Text(
                              t.title,
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                decoration: t.done ? TextDecoration.lineThrough : null,
                              ),
                            ),
                            subtitle: Text(
                              '${t.subject.isEmpty ? 'General' : t.subject} • ${t.due.day}/${t.due.month}/${t.due.year} ${t.due.hour.toString().padLeft(2, '0')}:${t.due.minute.toString().padLeft(2, '0')}${overdue ? ' • OVERDUE' : ''}',
                              style: TextStyle(
                                fontSize: 11,
                                color: overdue ? cs.error : cs.onSurfaceVariant,
                              ),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  tooltip: 'Share WhatsApp Alert Link',
                                  icon: const Icon(Icons.share_rounded, color: AppColors.green, size: 20),
                                  onPressed: () => _shareWhatsAppAlert(t),
                                ),
                                PopupMenuButton<String>(
                                  onSelected: (v) {
                                    if (v == 'edit') _add(t);
                                    if (v == 'share') _shareWhatsAppAlert(t);
                                    if (v == 'delete') _delete(t);
                                  },
                                  itemBuilder: (_) => const [
                                    PopupMenuItem(value: 'edit', child: Text('Edit')),
                                    PopupMenuItem(value: 'share', child: Text('Share on WhatsApp')),
                                    PopupMenuItem(value: 'delete', child: Text('Delete')),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
