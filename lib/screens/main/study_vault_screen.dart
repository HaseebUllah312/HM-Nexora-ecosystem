import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../services/nexora_api_service.dart';
import '../../services/drive_vault_service.dart';
import '../../services/vault_service.dart';
import '../../widgets/in_app_document_viewer.dart';
import '../../theme.dart';

class StudyVaultScreen extends StatefulWidget {
  final NavigateFn navigate;
  const StudyVaultScreen({super.key, required this.navigate});
  @override
  State<StudyVaultScreen> createState() => _StudyVaultScreenState();
}

class _StudyVaultScreenState extends State<StudyVaultScreen> {
  List<VaultItem> items = [];
  List<DriveVaultFile> driveFiles = [];
  bool loading = true;
  String query = '';
  String activeCategory = 'All';
  int activeTab = 0; // 0 = Saved Items, 1 = Nexora Drive Vault (27,650 files)

  final categories = ['All', 'Past Paper', 'Grand Quiz', 'Handout / Notes', 'Study Material'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final x = await VaultService.instance.load();
    await DriveVaultService.instance.loadVault();
    _performDriveSearch();

    if (mounted) {
      setState(() {
        items = x;
        loading = false;
      });
    }
  }

  void _performDriveSearch() {
    final results = DriveVaultService.instance.search(
      query: query,
      category: activeCategory,
      limit: 100,
    );
    setState(() {
      driveFiles = results;
    });
  }

  
  Future<void> _downloadOffline(String? url, String title) async {
    if (url == null || url.isEmpty) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
            const SizedBox(width: 12),
            Expanded(child: Text('Downloading ' + title + ' to device...')),
          ],
        ),
        duration: const Duration(seconds: 2),
      ),
    );

    final ext = url.contains('.pdf') ? '.pdf' : (url.contains('.ppt') ? '.pptx' : '.pdf');
    final fileName = title.replaceAll(RegExp(r'[^a-zA-Z0-9_-]'), '_') + ext;
    final savedFile = await NexoraApiService.downloadFileToDevice(
      fileUrl: url,
      fileName: fileName,
      onProgress: (_) {},
    );

    if (!mounted) return;
    if (savedFile != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Saved to device:\n' + savedFile.path),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 4),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not download file directly. Opening viewer...'),
        ),
      );
      _openUrl(url, title: title);
    }
  }

  void _openUrl(String? raw, {String title = 'Document', String course = '', String category = ''}) {
    if (raw == null || raw.isEmpty) return;
    InAppDocumentViewer.open(
      context,
      title: title,
      url: raw,
      courseCode: course,
      category: category,
    );
  }

  Future<void> _remove(VaultItem x) async {
    await VaultService.instance.remove(x.id);
    await _load();
  }

  Future<void> _saveDriveFileToSaved(DriveVaultFile f) async {
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
    await _load();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Saved "${f.title}" to your Saved Items! 💾'),
          backgroundColor: AppColors.green,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    final cs = Theme.of(context).colorScheme;

    final filteredSaved = items
        .where((x) =>
            query.isEmpty ||
            '${x.title} ${x.course} ${x.type}'
                .toLowerCase()
                .contains(query.toLowerCase()))
        .toList();

    return Container(
      color: cs.surfaceContainerLowest,
      child: Column(
        children: [
          // Header & Search
          Container(
            color: cs.surface,
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                Row(
                  children: [
                    const Expanded(
                      child: Text(
                        'Academic Vault',
                        style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                    ),
                    FilledButton.icon(
                      onPressed: () => widget.navigate('contributeFile'),
                      icon: const Icon(Icons.upload_file, size: 18),
                      label: const Text('Contribute'),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Segment switch
                Container(
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => activeTab = 0),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: activeTab == 0 ? AppColors.primary : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'My Saved Items (${items.length})',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: activeTab == 0 ? Colors.white : cs.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: GestureDetector(
                          onTap: () {
                            setState(() => activeTab = 1);
                            _performDriveSearch();
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: activeTab == 1 ? AppColors.primary : Colors.transparent,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Nexora Drive (27,650 Files)',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: activeTab == 1 ? Colors.white : cs.onSurfaceVariant,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),

                // Search field
                TextField(
                  onChanged: (v) {
                    setState(() => query = v);
                    if (activeTab == 1) _performDriveSearch();
                  },
                  decoration: InputDecoration(
                    prefixIcon: const Icon(Icons.search),
                    hintText: activeTab == 0
                        ? 'Search saved files and bookmarks…'
                        : 'Search 27,650 drive files (e.g. CS407, MGT502, Quiz)...',
                    border: const OutlineInputBorder(),
                  ),
                ),

                if (activeTab == 1) ...[
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: categories.map((cat) {
                        final active = activeCategory == cat;
                        return Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: FilterChip(
                            selected: active,
                            label: Text(cat, style: const TextStyle(fontSize: 10)),
                            onSelected: (_) {
                              setState(() => activeCategory = cat);
                              _performDriveSearch();
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ],
            ),
          ),

          if (activeTab == 0)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              child: Row(
                children: [
                  _stat('${items.length}', 'All Saved', AppColors.primary),
                  const SizedBox(width: 8),
                  _stat(
                      '${items.where((e) => e.source == 'cloud').length}',
                      'Cloud Sync',
                      AppColors.cyan),
                  const SizedBox(width: 8),
                  _stat(
                      '${items.where((e) => e.source == 'contribution' || e.source == 'indexed_vault').length}',
                      'Indexed Vault',
                      AppColors.green),
                ],
              ),
            ),

          Expanded(
            child: activeTab == 0
                ? _buildSavedList(filteredSaved, cs)
                : _buildDriveVaultList(cs),
          ),
        ],
      ),
    );
  }

  Widget _buildSavedList(List<VaultItem> filtered, ColorScheme cs) {
    if (filtered.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.inventory_2_outlined, size: 46, color: cs.outline),
            const SizedBox(height: 8),
            const Text('Nothing saved yet'),
            const SizedBox(height: 6),
            Text(
              'Switch to "Nexora Drive" tab above to bookmark from 27,650+ files!',
              style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(14),
        itemCount: filtered.length,
        itemBuilder: (ctx, i) {
          final x = filtered[i];
          return Card(
            child: ListTile(
              onTap: () => _openUrl(x.url, title: x.title, course: x.course, category: x.type),
              leading: Container(
                width: 42,
                height: 42,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.primary.withAlphaFrac(.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  x.type.toLowerCase().contains('video')
                      ? Icons.play_arrow
                      : Icons.description_outlined,
                  color: AppColors.primary,
                ),
              ),
              title: Text(
                x.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
              subtitle: Text(
                [x.course, x.type, x.source].where((e) => e.isNotEmpty).join(' • '),
                style: const TextStyle(fontSize: 10),
              ),
              trailing: PopupMenuButton<String>(
                onSelected: (v) {
                  if (v == 'open') _openUrl(x.url, title: x.title, course: x.course, category: x.type);
                  if (v == 'download') _downloadOffline(x.url, x.title);
                  if (v == 'remove') _remove(x);
                },
                itemBuilder: (_) => [
                  if ((x.url ?? '').isNotEmpty) ...[
                    const PopupMenuItem(value: 'open', child: Text('Open File')),
                    const PopupMenuItem(value: 'download', child: Text('📥 Save Offline to Phone')),
                  ],
                  const PopupMenuItem(value: 'remove', child: Text('Remove from Vault')),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDriveVaultList(ColorScheme cs) {
    if (driveFiles.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.search_off_rounded, size: 46, color: Colors.grey),
            const SizedBox(height: 8),
            Text('No indexed drive files found for "$query"'),
            const SizedBox(height: 6),
            const Text(
              'Try typing a course code like CS407, MGT502, ENG101, or SOC101',
              style: TextStyle(fontSize: 11, color: AppColors.mutedForeground),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(14),
      itemCount: driveFiles.length,
      itemBuilder: (ctx, i) {
        final f = driveFiles[i];
        return Card(
          child: ListTile(
            onTap: () => _openUrl(f.url, title: f.title, course: f.courseCode, category: f.category),
            leading: Container(
              width: 42,
              height: 42,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.cyan.withAlphaFrac(.08),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.cloud_download_outlined, color: AppColors.cyan),
            ),
            title: Text(
              f.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            ),
            subtitle: Text(
              '${f.courseCode} • ${f.category}',
              style: const TextStyle(fontSize: 10, color: AppColors.mutedForeground),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  tooltip: 'Save to My Saved Items',
                  icon: const Icon(Icons.bookmark_add_outlined, color: AppColors.primary),
                  onPressed: () => _saveDriveFileToSaved(f),
                ),
                IconButton(
                  tooltip: 'Open in Google Drive',
                  icon: const Icon(Icons.open_in_new_rounded, size: 18),
                  onPressed: () => _openUrl(f.url),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _stat(String n, String label, Color c) => Expanded(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 9),
          decoration: BoxDecoration(
            color: c.withAlphaFrac(.08),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(children: [
            Text(n, style: TextStyle(fontWeight: FontWeight.bold, color: c)),
            Text(label, style: const TextStyle(fontSize: 9))
          ]),
        ),
      );
}

