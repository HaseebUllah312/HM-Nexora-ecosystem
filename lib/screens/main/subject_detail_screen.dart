import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../services/drive_vault_service.dart';
import '../../services/subject_activity_service.dart';
import '../../services/vault_service.dart';
import '../../widgets/in_app_document_viewer.dart';
import '../../theme.dart';

class _TabDef {
  final String id, label;
  final IconData icon;
  const _TabDef(this.id, this.label, this.icon);
}

const _tabs = [
  _TabDef('all', 'All Files', Icons.folder_copy_outlined),
  _TabDef('activities', 'LMS Activities', Icons.assignment_outlined),
  _TabDef('notes', 'Handouts', Icons.description_outlined),
  _TabDef('quizzes', 'Quizzes', Icons.check_box_outlined),
  _TabDef('pastpapers', 'Past Papers', Icons.history_edu_outlined),
  _TabDef('downloads', 'Study Vault', Icons.download_outlined),
];

class SubjectDetailScreen extends StatefulWidget {
  final String subject;
  final NavigateFn navigate;
  const SubjectDetailScreen({super.key, required this.navigate, required this.subject});

  @override
  State<SubjectDetailScreen> createState() => _SubjectDetailScreenState();
}

class _SubjectDetailScreenState extends State<SubjectDetailScreen> {
  String activeTab = 'all';
  List<DriveVaultFile> courseFiles = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _loadCourseFiles();
  }

  static const Map<String, String> _knownSubjectCodes = {
    'cloud computing': 'CS407',
    'web systems development': 'CS506',
    'organizational behavior': 'MGT502',
    'basic english': 'ENG101',
    'data structures & algorithms': 'CS301',
    'data structures and algorithms': 'CS301',
    'data structures': 'CS301',
    'object oriented programming': 'CS201',
    'compiler construction': 'CS606',
    'linear algebra': 'MTH501',
    'database management systems': 'CS403',
    'software engineering 1': 'CS504',
    'software engineering': 'CS504',
    'introduction to sociology': 'SOC101',
  };

  String _extractCourseCode(String text) {
    // 1. Check for explicit 2-4 letter + 3 digit code (e.g. CS407, MGT502, ENG101)
    final match = RegExp(r'\b[A-Za-z]{2,4}\s?\d{3}\b', caseSensitive: false).firstMatch(text);
    if (match != null) {
      return match.group(0)!.replaceAll(' ', '').toUpperCase();
    }

    // 2. Check known subject titles dictionary
    final cleanText = text.trim().toLowerCase();
    if (_knownSubjectCodes.containsKey(cleanText)) {
      return _knownSubjectCodes[cleanText]!;
    }

    for (final entry in _knownSubjectCodes.entries) {
      if (cleanText.contains(entry.key) || entry.key.contains(cleanText)) {
        return entry.value;
      }
    }

    return text.replaceAll(' ', '').toUpperCase();
  }

  Future<void> _loadCourseFiles() async {
    await DriveVaultService.instance.loadVault();
    final code = _extractCourseCode(widget.subject);
    var files = DriveVaultService.instance.getFilesForCourse(code);

    if (files.isEmpty) {
      files = DriveVaultService.instance.search(courseCode: code, limit: 100);
    }

    // Only fallback to title query if code is NOT a valid 2-4 letter + 3 digit code
    if (files.isEmpty && !RegExp(r'^[A-Z]{2,4}\d{3}$').hasMatch(code)) {
      files = DriveVaultService.instance.search(query: widget.subject, limit: 100);
    }

    if (mounted) {
      setState(() {
        courseFiles = files;
        loading = false;
      });
    }
  }

  void _openDriveFile(DriveVaultFile f) {
    if (f.url.isNotEmpty) {
      InAppDocumentViewer.open(
        context,
        title: f.title,
        url: f.url,
        courseCode: f.courseCode,
        category: f.category,
      );
    }
  }

  Future<void> _saveToPersonalVault(DriveVaultFile f) async {
    await VaultService.instance.save(
      VaultItem(
        id: f.id.isNotEmpty ? f.id : 'gd_${f.driveFileId}',
        title: f.title,
        type: f.category,
        course: f.courseCode,
        url: f.url,
        source: 'indexed_vault',
        createdAt: f.createdAt ?? DateTime.now(),
      ),
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Saved "${f.title}" to your Study Vault! 💾'),
          backgroundColor: AppColors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final code = _extractCourseCode(widget.subject);
    final notes = courseFiles.where((f) => f.category == 'Handout / Notes').toList();
    final quizzes = courseFiles.where((f) => f.category == 'Grand Quiz').toList();
    final pastPapers = courseFiles.where((f) => f.category == 'Past Paper').toList();

    return Column(
      children: [
        // Header
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
          decoration: const BoxDecoration(gradient: AppColors.heroGradient),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Positioned(
                top: -32,
                right: -32,
                child: Container(
                  width: 128,
                  height: 128,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.cyan.withAlphaFrac(0.15),
                  ),
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: Colors.white.withAlphaFrac(0.15),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: const Text('📚', style: TextStyle(fontSize: 22)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.subject,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 15,
                              ),
                            ),
                            Text(
                              'Virtual University Academic Vault • $code',
                              style: TextStyle(
                                color: Colors.white.withAlphaFrac(0.7),
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _headerStat('${courseFiles.length}', 'Drive Files'),
                      const SizedBox(width: 16),
                      _headerStat('${pastPapers.length}', 'Past Papers'),
                      const SizedBox(width: 16),
                      _headerStat('${quizzes.length}', 'Quizzes'),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),

        // Tabs
        Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: AppColors.border)),
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _tabs.map((t) {
                final active = activeTab == t.id;
                return GestureDetector(
                  onTap: () => setState(() => activeTab = t.id),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      border: Border(
                        bottom: BorderSide(
                          color: active ? AppColors.primary : Colors.transparent,
                          width: 2,
                        ),
                      ),
                    ),
                    child: Column(
                      children: [
                        Icon(t.icon, size: 16, color: active ? AppColors.primary : AppColors.subtitle),
                        const SizedBox(height: 4),
                        Text(
                          t.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: active ? AppColors.primary : AppColors.subtitle,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),

        Expanded(
          child: Container(
            color: AppColors.background,
            child: loading
                ? const Center(child: CircularProgressIndicator())
                : _buildTabContent(),
          ),
        ),
      ],
    );
  }

  Widget _headerStat(String value, String label) {
    return RichText(
      text: TextSpan(
        children: [
          TextSpan(
            text: value,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
          ),
          TextSpan(
            text: ' $label',
            style: TextStyle(color: Colors.white.withAlphaFrac(0.7), fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildTabContent() {
    final code = _extractCourseCode(widget.subject);
    if (activeTab == 'activities') {
      return _buildActivitiesTab(code);
    }

    List<DriveVaultFile> displayList = [];

    switch (activeTab) {
      case 'all':
        displayList = courseFiles;
        break;
      case 'notes':
        displayList = courseFiles.where((f) => f.category == 'Handout / Notes').toList();
        break;
      case 'quizzes':
        displayList = courseFiles.where((f) => f.category == 'Grand Quiz').toList();
        break;
      case 'pastpapers':
        displayList = courseFiles.where((f) => f.category == 'Past Paper').toList();
        break;
      case 'downloads':
        displayList = courseFiles.where((f) => f.category == 'Study Material' || f.category == 'Assignment Solution').toList();
        break;
    }

    if (displayList.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.folder_open, size: 48, color: Colors.grey),
              const SizedBox(height: 12),
              Text(
                'No ${activeTab == 'all' ? 'drive' : activeTab} files indexed yet for ${widget.subject}.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: AppColors.mutedForeground),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => widget.navigate('contributeFile'),
                icon: const Icon(Icons.upload_file, size: 16),
                label: const Text('Contribute Material'),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(14),
      itemCount: displayList.length,
      itemBuilder: (ctx, i) => _fileCard(displayList[i]),
    );
  }

  Widget _fileCard(DriveVaultFile file) {
    IconData icon = Icons.description_outlined;
    Color iconColor = AppColors.primary;

    if (file.category == 'Grand Quiz') {
      icon = Icons.quiz_outlined;
      iconColor = AppColors.amber;
    } else if (file.category == 'Past Paper') {
      icon = Icons.history_edu_outlined;
      iconColor = AppColors.cyan;
    } else if (file.category == 'Handout / Notes') {
      icon = Icons.menu_book_outlined;
      iconColor = AppColors.green;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: AppColors.faintBorder),
      ),
      child: ListTile(
        onTap: () => _openDriveFile(file),
        leading: Container(
          width: 42,
          height: 42,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: iconColor.withAlphaFrac(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        title: Text(
          file.title,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
        ),
        subtitle: Text(
          '${file.courseCode} • ${file.category}',
          style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground),
        ),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              tooltip: 'Save to Study Vault',
              icon: const Icon(Icons.bookmark_border_rounded, color: AppColors.primary, size: 20),
              onPressed: () => _saveToPersonalVault(file),
            ),
            IconButton(
              tooltip: 'Open in Google Drive',
              icon: const Icon(Icons.open_in_new_rounded, color: AppColors.subtitle, size: 18),
              onPressed: () => _openDriveFile(file),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivitiesTab(String courseCode) {
    return FutureBuilder<List<SubjectActivityItem>>(
      future: SubjectActivityService.instance.getActivitiesForSubject(courseCode),
      builder: (ctx, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final activities = snapshot.data ?? [];

        if (activities.isEmpty) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.assignment_turned_in_rounded, size: 48, color: Colors.indigo),
                  const SizedBox(height: 12),
                  Text('No active LMS activities registered yet for $courseCode.', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Text('Students can add assignments & quizzes in Smart Planner to share with classmates!', textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: Colors.grey)),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => widget.navigate('planner'),
                    icon: const Icon(Icons.add_task_rounded),
                    label: const Text('Add Activity in Planner'),
                  ),
                ],
              ),
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(14),
          itemCount: activities.length,
          itemBuilder: (ctx, i) {
            final act = activities[i];
            return Card(
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: act.type == 'Quiz' ? Colors.purple.shade50 : Colors.indigo.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            act.type.toUpperCase(),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: act.type == 'Quiz' ? Colors.purple.shade700 : Colors.indigo.shade700,
                            ),
                          ),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: act.hasSolution ? Colors.green.shade50 : Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                act.hasSolution ? Icons.check_circle_rounded : Icons.help_outline_rounded,
                                size: 13,
                                color: act.hasSolution ? Colors.green.shade700 : Colors.amber.shade800,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                act.hasSolution ? 'Solution Available' : 'No Solution Yet',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: act.hasSolution ? Colors.green.shade800 : Colors.amber.shade900,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      act.title,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '📅 Due Date: ${act.dueDate.day}/${act.dueDate.month}/${act.dueDate.year} • Posted by ${act.creatorName}',
                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        if (act.hasSolution)
                          Expanded(
                            child: ElevatedButton.icon(
                              onPressed: () => SubjectActivityService.instance.openSolution(context, act),
                              icon: const Icon(Icons.description_rounded, size: 16),
                              label: const Text('Open Solved Solution', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.green,
                                foregroundColor: Colors.white,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          )
                        else ...[
                          Expanded(
                            child: OutlinedButton.icon(
                              onPressed: () => SubjectActivityService.instance.requestSolution(context: context, activity: act),
                              icon: const Icon(Icons.contact_support_outlined, size: 15),
                              label: const Text('Request Solution', style: TextStyle(fontSize: 11.5)),
                              style: OutlinedButton.styleFrom(
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: FilledButton.icon(
                              onPressed: () => _showUploadSolutionDialog(act),
                              icon: const Icon(Icons.upload_file_rounded, size: 15),
                              label: const Text('Upload Solution', style: TextStyle(fontSize: 11.5)),
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _showUploadSolutionDialog(SubjectActivityItem act) {
    final titleCtrl = TextEditingController(text: '${act.courseCode} ${act.title} Solved Solution');
    final urlCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        decoration: BoxDecoration(
          color: Theme.of(context).colorScheme.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.upload_file_rounded, color: AppColors.primary, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Submit Solution for ${act.courseCode}',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            const Text(
              'Submitted solutions are reviewed by our admin team before being published live to all enrolled students.',
              style: TextStyle(fontSize: 11.5, color: Colors.grey),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: titleCtrl,
              decoration: const InputDecoration(
                labelText: 'Solution Title',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: urlCtrl,
              decoration: const InputDecoration(
                labelText: 'Solution File URL (Google Drive / Direct PDF link)',
                hintText: 'https://drive.google.com/file/d/.../view',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: notesCtrl,
              decoration: const InputDecoration(
                labelText: 'Notes for Admin Reviewer (Optional)',
                hintText: 'e.g. 100% correct C++ solution with screenshots',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: () async {
                final link = urlCtrl.text.trim();
                final t = titleCtrl.text.trim();
                if (link.isEmpty || t.isEmpty) return;

                Navigator.pop(ctx);
                await SubjectActivityService.instance.submitMemberSolution(
                  activityId: act.id,
                  courseCode: act.courseCode,
                  activityTitle: act.title,
                  solutionUrl: link,
                  solutionTitle: t,
                  notes: notesCtrl.text.trim(),
                );

                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('🎉 Solution submitted! Our admin team will review and publish it live shortly.'),
                      backgroundColor: Colors.green,
                    ),
                  );
                }
              },
              icon: const Icon(Icons.send_rounded),
              label: const Text('Submit Solution for Admin Review', style: TextStyle(fontWeight: FontWeight.bold)),
              style: FilledButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

