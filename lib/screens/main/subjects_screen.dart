import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../services/account_service.dart';
import '../../services/subject_catalog_service.dart';
import '../../theme.dart';

class _Subject {
  final String name, code, emoji, lastAccess;
  final Color color;
  final int progress, topics;
  const _Subject(this.name, this.code, this.emoji, this.color, this.progress, this.lastAccess, this.topics);
}

const _allSubjects = [
  _Subject('Cloud Computing', 'CS407', '☁️', AppColors.primary, 85, '1h ago', 16),
  _Subject('Web Systems Development', 'CS506', '🌐', AppColors.cyan, 78, '3h ago', 14),
  _Subject('Organizational Behavior', 'MGT502', '📊', AppColors.amber, 62, '1d ago', 12),
  _Subject('Basic English', 'ENG101', '📝', AppColors.green, 90, '2h ago', 10),
  _Subject('Data Structures & Algorithms', 'CS301', '🌲', AppColors.purple, 70, '4h ago', 15),
  _Subject('Object Oriented Programming', 'CS201', '💻', AppColors.cyan, 88, '1d ago', 14),
  _Subject('Compiler Construction', 'CS606', '⚙️', AppColors.red, 45, '3d ago', 11),
  _Subject('Linear Algebra', 'MTH501', '📐', AppColors.primary, 60, '2d ago', 13),
  _Subject('Database Management Systems', 'CS403', '🗄️', AppColors.green, 82, '5h ago', 15),
  _Subject('Software Engineering 1', 'CS504', '🏗️', AppColors.purple, 75, '1d ago', 12),
];

class SubjectsScreen extends StatefulWidget {
  final NavigateFn navigate;
  const SubjectsScreen({super.key, required this.navigate});

  @override
  State<SubjectsScreen> createState() => _SubjectsScreenState();
}

class _SubjectsScreenState extends State<SubjectsScreen> {
  bool gridView = true;
  String searchQuery = '';
  List<String> enrolledCodes = ['CS407', 'CS506', 'MGT502', 'ENG101'];
  final searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    SubjectCatalogService.instance.loadCatalog();
    _loadEnrolled();
  }

  Future<void> _loadEnrolled() async {
    final codes = await AccountService.instance.getEnrolledSubjects();
    if (mounted) setState(() => enrolledCodes = codes);
  }

  @override
  void dispose() {
    searchController.dispose();
    super.dispose();
  }

  void _showEditSubjectsDialog() {
    final c = TextEditingController(text: enrolledCodes.join(', '));
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit My Enrolled Subjects'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter your subject codes separated by commas (e.g. CS407, CS506, MGT502, CS201):',
              style: TextStyle(fontSize: 12),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: c,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(
                hintText: 'CS407, CS506, MGT502',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          FilledButton(
            onPressed: () async {
              final raw = c.text.trim();
              final newCodes = raw
                  .split(',')
                  .map((x) => x.trim().toUpperCase())
                  .where((x) => x.isNotEmpty)
                  .toList();

              final profile = await AccountService.instance.loadProfile();
              await AccountService.instance.saveProfile({
                ...profile,
                'enrolledSubjects': newCodes,
              });

              setState(() => enrolledCodes = newCodes);
              Navigator.pop(ctx);

              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Enrolled subjects updated successfully! 🎉'), backgroundColor: Colors.green),
              );
            },
            child: const Text('Save Subjects'),
          ),
        ],
      ),
    );
  }

  List<_Subject> _getDisplaySubjects() {
    final query = searchQuery.trim().toLowerCase();

    if (query.isNotEmpty) {
      return _allSubjects.where((s) {
        final codeClean = s.code.replaceAll(' ', '').toLowerCase();
        final nameClean = s.name.toLowerCase();
        return codeClean.contains(query) || nameClean.contains(query);
      }).toList();
    }

    return _allSubjects.where((s) {
      final codeClean = s.code.replaceAll(' ', '').toUpperCase();
      return enrolledCodes.contains(codeClean);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final displaySubjects = _getDisplaySubjects();

    return ListView(
      padding: const EdgeInsets.only(bottom: 24),
      children: [
        // Search Subject Code Bar
        Container(
          margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.faintBorder),
          ),
          child: TextField(
            controller: searchController,
            onChanged: (v) => setState(() => searchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search any VU subject (e.g. CS407, CS201, MGT502)...',
              hintStyle: const TextStyle(fontSize: 13),
              border: InputBorder.none,
              icon: const Icon(Icons.search_rounded, color: AppColors.primary),
              suffixIcon: searchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      onPressed: () {
                        searchController.clear();
                        setState(() => searchQuery = '');
                      },
                    )
                  : null,
            ),
          ),
        ),

        // Header row
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 10),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    searchQuery.isNotEmpty ? 'Search Results (${displaySubjects.length})' : 'My Enrolled Subjects (${displaySubjects.length})',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.foreground),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    searchQuery.isNotEmpty ? 'Showing search matches across all VU courses' : 'Only material for your enrolled courses',
                    style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground),
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    tooltip: 'Edit Enrolled Subjects',
                    onPressed: _showEditSubjectsDialog,
                    icon: const Icon(Icons.edit_note_rounded, color: AppColors.primary),
                  ),
                  _viewToggle('Grid', gridView, () => setState(() => gridView = true)),
                  const SizedBox(width: 4),
                  _viewToggle('List', !gridView, () => setState(() => gridView = false)),
                ],
              ),
            ],
          ),
        ),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: displaySubjects.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: [
                        const Icon(Icons.search_off_rounded, size: 48, color: Colors.grey),
                        const SizedBox(height: 12),
                        Text(
                          'No subjects found matching "$searchQuery"',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ),
                )
              : gridView ? _buildGrid(displaySubjects) : _buildList(displaySubjects),
        ),
      ],
    );
  }

  Widget _buildGrid(List<_Subject> items) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: items.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.92,
      ),
      itemBuilder: (context, i) => _subjectCard(items[i]),
    );
  }

  Widget _buildList(List<_Subject> items) {
    return Column(
      children: items.map((s) => Padding(padding: const EdgeInsets.only(bottom: 12), child: _subjectListTile(s))).toList(),
    );
  }

  Widget _subjectCard(_Subject s) {
    return GestureDetector(
      onTap: () => widget.navigate('subjectDetail', {'subject': '${s.name} (${s.code})'}),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.faintBorder),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  width: 40, height: 40, alignment: Alignment.center,
                  decoration: BoxDecoration(color: s.color.withAlphaFrac(0.08), borderRadius: BorderRadius.circular(12)),
                  child: Text(s.emoji, style: const TextStyle(fontSize: 18)),
                ),
                const Icon(Icons.chevron_right, size: 14, color: AppColors.border),
              ],
            ),
            const SizedBox(height: 10),
            Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.foreground)),
            const SizedBox(height: 2),
            Text(s.code, style: const TextStyle(fontSize: 11, color: AppColors.subtitle)),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('${s.progress}%', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: s.color)),
                Text('${s.topics} topics', style: const TextStyle(fontSize: 10, color: AppColors.subtitle)),
              ],
            ),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(value: s.progress / 100, minHeight: 5, backgroundColor: AppColors.faintBorder, valueColor: AlwaysStoppedAnimation(s.color)),
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.access_time, size: 10, color: AppColors.subtitle),
                const SizedBox(width: 4),
                Text(s.lastAccess, style: const TextStyle(fontSize: 10, color: AppColors.subtitle)),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _subjectListTile(_Subject s) {
    return GestureDetector(
      onTap: () => widget.navigate('subjectDetail', {'subject': '${s.name} (${s.code})'}),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.faintBorder),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44, alignment: Alignment.center,
              decoration: BoxDecoration(color: s.color.withAlphaFrac(0.08), borderRadius: BorderRadius.circular(12)),
              child: Text(s.emoji, style: const TextStyle(fontSize: 20)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.foreground)),
                  Text('${s.code} · ${s.topics} topics', style: const TextStyle(fontSize: 11, color: AppColors.subtitle)),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(value: s.progress / 100, minHeight: 5, backgroundColor: AppColors.faintBorder, valueColor: AlwaysStoppedAnimation(s.color)),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text('${s.progress}%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: s.color)),
          ],
        ),
      ),
    );
  }

  Widget _stat(String value, String label, Color color) {
    return Expanded(
      child: Column(
        children: [
          Text(value, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: color)),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground)),
        ],
      ),
    );
  }

  Widget _viewToggle(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(color: active ? AppColors.primary : AppColors.muted, borderRadius: BorderRadius.circular(12)),
        child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: active ? Colors.white : AppColors.mutedForeground)),
      ),
    );
  }
}
