import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../services/auth_service.dart';
import '../../services/contribution_service.dart';
import '../../services/drive_folder_organizer_service.dart';
import '../../services/vault_service.dart';
import '../../theme.dart';

class ContributeFileScreen extends StatefulWidget {
  final NavigateFn navigate;
  const ContributeFileScreen({super.key, required this.navigate});

  @override
  State<ContributeFileScreen> createState() => _ContributeFileScreenState();
}

class _ContributeFileScreenState extends State<ContributeFileScreen> {
  final courseController = TextEditingController();
  final titleController = TextEditingController();
  final descriptionController = TextEditingController();

  PlatformFile? file;
  bool busy = false;
  bool aiExtracted = false;
  String? error;
  String selectedType = 'Past Paper';

  final List<String> fileTypes = [
    'Past Paper',
    'Handout / Notes',
    'Assignment Solution',
    'Grand Quiz',
    'GDB Solution',
    'Lecture Slides',
    'Other Study Material',
  ];

  Future<void> _pick() async {
    final result = await FilePicker.platform.pickFiles(
      withData: true,
      allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip'],
      type: FileType.custom,
    );

    if (result != null && result.files.isNotEmpty) {
      final pickedFile = result.files.first;
      setState(() {
        file = pickedFile;
        error = null;
      });

      _autoExtractDetails(pickedFile.name);
    }
  }

  void _autoExtractDetails(String filename) {
    final nameWithoutExt = filename.contains('.')
        ? filename.substring(0, filename.lastIndexOf('.'))
        : filename;

    // 1. Smart Course Code Extraction (e.g. CS407, MGT502, ENG101)
    final courseRegex = RegExp(r'([A-Za-z]{2,4}\s*\d{3})', caseSensitive: false);
    final match = courseRegex.firstMatch(nameWithoutExt);

    String detectedCourse = '';
    if (match != null) {
      detectedCourse = match.group(0)!.replaceAll(' ', '').toUpperCase();
    }

    // 2. Smart Category / Type Extraction
    final lowerName = nameWithoutExt.toLowerCase();
    String detectedType = 'Past Paper';

    if (lowerName.contains('handout') || lowerName.contains('note') || lowerName.contains('lecture')) {
      detectedType = 'Handout / Notes';
    } else if (lowerName.contains('assign') || lowerName.contains('solution') || lowerName.contains('sol')) {
      detectedType = 'Assignment Solution';
    } else if (lowerName.contains('quiz') || lowerName.contains('gq')) {
      detectedType = 'Grand Quiz';
    } else if (lowerName.contains('gdb')) {
      detectedType = 'GDB Solution';
    } else if (lowerName.contains('ppt') || lowerName.contains('slide')) {
      detectedType = 'Lecture Slides';
    }

    // 3. Smart Title Formatting
    String cleanedTitle = nameWithoutExt
        .replaceAll(RegExp(r'[_\-]+'), ' ')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();

    // Capitalize Title Words
    cleanedTitle = cleanedTitle.split(' ').map((w) {
      if (w.isEmpty) return '';
      return w[0].toUpperCase() + w.substring(1);
    }).join(' ');

    setState(() {
      if (detectedCourse.isNotEmpty) courseController.text = detectedCourse;
      titleController.text = cleanedTitle;
      selectedType = detectedType;
      descriptionController.text =
          'Auto-extracted $detectedType for ${detectedCourse.isEmpty ? "course" : detectedCourse}. Contributed to HM Nexora Study Vault.';
      aiExtracted = true;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          detectedCourse.isNotEmpty
              ? '✨ AI Auto-Extracted Course ($detectedCourse) and details from filename!'
              : '✨ AI Auto-Filled title and file details!',
        ),
        backgroundColor: AppColors.primary,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<void> _upload() async {
    if (file == null || courseController.text.trim().isEmpty || titleController.text.trim().isEmpty) {
      setState(() => error = 'Please select a file and verify course code & title.');
      return;
    }

    setState(() {
      busy = true;
      error = null;
    });

    try {
      final result = await ContributionService.instance.upload(
        file: file!,
        courseCode: courseController.text.trim(),
        title: titleController.text.trim(),
        description: descriptionController.text.trim(),
      );

      await DriveFolderOrganizerService.instance.registerStructuredDriveFile(
        courseCode: courseController.text.trim(),
        title: titleController.text.trim(),
        category: selectedType,
        fileUrl: (result['url'] ?? '').toString(),
        contributorEmail: AuthService.instance.currentUser?.email ?? 'haseebsaleem312@gmail.com',
      );

      await VaultService.instance.save(
        VaultItem(
          id: 'contribution-${result['id']}',
          title: titleController.text.trim(),
          type: selectedType,
          course: courseController.text.trim().toUpperCase(),
          url: result['url']?.toString(),
          source: 'contribution',
          createdAt: DateTime.now(),
        ),
      );

      if (!mounted) return;

      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.check_circle_rounded, color: Colors.green),
              SizedBox(width: 8),
              Text('Contribution Submitted!'),
            ],
          ),
          content: const Text(
            'Thank you for helping VU students! Your contribution is now saved to HM Nexora Study Vault.',
          ),
          actions: [
            FilledButton(
              onPressed: () {
                Navigator.pop(ctx);
                widget.navigate('studyVault');
              },
              child: const Text('Open Study Vault'),
            ),
          ],
        ),
      );
    } catch (e) {
      setState(() => error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  void dispose() {
    courseController.dispose();
    titleController.dispose();
    descriptionController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: cs.surfaceContainerLowest,
      appBar: AppBar(
        title: const Text('🤝 Contribute Study Material', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.cloud_upload_rounded, color: AppColors.primary, size: 28),
                      SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Contribute File to HM Nexora',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Pick a file and our AI will automatically extract the course code, title, and file type!',
                    style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12),
                  ),
                  const SizedBox(height: 18),

                  // Pick File Button / Box
                  InkWell(
                    onTap: busy ? null : _pick,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: file == null ? cs.surfaceContainerHigh : AppColors.primary.withValues(alpha: 0.08),
                        border: Border.all(
                          color: file == null ? cs.outlineVariant : AppColors.primary,
                          width: 1.5,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            file == null ? Icons.attach_file_rounded : Icons.insert_drive_file_rounded,
                            color: file == null ? cs.onSurfaceVariant : AppColors.primary,
                            size: 28,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  file == null ? 'Tap to Choose File (PDF, DOCX, PPT, ZIP)' : file!.name,
                                  style: TextStyle(
                                    fontWeight: file == null ? FontWeight.normal : FontWeight.bold,
                                    color: file == null ? cs.onSurfaceVariant : cs.onSurface,
                                    fontSize: 13,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                if (file != null)
                                  Text(
                                    '${(file!.size / 1024 / 1024).toStringAsFixed(2)} MB • Ready for Upload',
                                    style: const TextStyle(fontSize: 11, color: Colors.green, fontWeight: FontWeight.bold),
                                  ),
                              ],
                            ),
                          ),
                          OutlinedButton(
                            onPressed: busy ? null : _pick,
                            child: Text(file == null ? 'Select' : 'Change'),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  if (aiExtracted)
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.auto_awesome_rounded, color: Colors.green, size: 20),
                          SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'AI Auto-Extracted details! You can edit any field below before submitting.',
                              style: TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Course Code Input
                  TextField(
                    controller: courseController,
                    textCapitalization: TextCapitalization.characters,
                    decoration: const InputDecoration(
                      labelText: 'Course Code * (e.g. CS407, MGT502)',
                      prefixIcon: Icon(Icons.school_rounded),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Category Selector Dropdown
                  DropdownButtonFormField<String>(
                    value: selectedType,
                    decoration: const InputDecoration(
                      labelText: 'File Category / Type',
                      prefixIcon: Icon(Icons.category_rounded),
                      border: OutlineInputBorder(),
                    ),
                    items: fileTypes.map((t) {
                      return DropdownMenuItem(value: t, child: Text(t));
                    }).toList(),
                    onChanged: (v) {
                      if (v != null) setState(() => selectedType = v);
                    },
                  ),
                  const SizedBox(height: 12),

                  // Title Input
                  TextField(
                    controller: titleController,
                    decoration: const InputDecoration(
                      labelText: 'File Title *',
                      prefixIcon: Icon(Icons.title_rounded),
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Description Input
                  TextField(
                    controller: descriptionController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Description (Optional)',
                      prefixIcon: Icon(Icons.description_rounded),
                      border: OutlineInputBorder(),
                    ),
                  ),

                  if (error != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 12),
                      child: Text(error!, style: const TextStyle(color: AppColors.red, fontSize: 12)),
                    ),

                  const SizedBox(height: 20),

                  // Submit Upload Button
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(backgroundColor: AppColors.primary),
                      onPressed: busy ? null : _upload,
                      icon: busy
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Icon(Icons.cloud_upload_rounded),
                      label: Text(busy ? 'Uploading to Study Vault...' : 'Submit Contribution', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Icon(Icons.info_outline_rounded, color: cs.onSurfaceVariant, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Accepted formats: PDF, Word, PowerPoint, TXT, and ZIP up to 50MB. Please do not upload copyrighted paid material.',
                      style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
