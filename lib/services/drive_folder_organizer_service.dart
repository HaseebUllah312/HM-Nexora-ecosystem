import 'nexora_cloud_service.dart';
import 'supabase_service.dart';

class DriveFolderOrganizerService {
  DriveFolderOrganizerService._();
  static final DriveFolderOrganizerService instance = DriveFolderOrganizerService._();

  static const String masterRootFolderId = '1cmecXWcl_Y07uIemFD3Jp_b-2Bv6d7ni';
  static const String masterOwnerEmail = 'haseebsaleem312@gmail.com';
  static const String masterRootFolderUrl = 'https://drive.google.com/drive/folders/1cmecXWcl_Y07uIemFD3Jp_b-2Bv6d7ni?usp=sharing';

  /// Maps category names to well-structured subfolder names inside course folder.
  String getSubfolderCategoryName(String category) {
    final clean = category.toLowerCase().trim();
    if (clean.contains('premium') || clean.contains('vip') || clean.contains('exclusive')) return 'Premium_Files_Exclusives';
    if (clean.contains('midterm') || clean.contains('mid_term') || clean.contains('mid term') || clean.contains('mid')) return 'Midterm_Papers';
    if (clean.contains('finalterm') || clean.contains('final_term') || clean.contains('final term') || clean.contains('final')) return 'Finalterm_Papers';
    if (clean.contains('handout') || clean.contains('note')) return 'Handouts_Notes';
    if (clean.contains('past') || clean.contains('paper')) return 'Past_Papers';
    if (clean.contains('quiz')) return 'Quizzes_MCQs';
    if (clean.contains('solution') || clean.contains('assignment')) return 'Assignment_Solutions';
    return 'General_Study_Materials';
  }

  /// Calculates the well-structured Drive storage target path.
  /// Example: "1cmecXWcl_Y07uIemFD3Jp_b-2Bv6d7ni / CS407 / Assignment_Solutions / CS407_Assignment_1_Solution.pdf"
  Map<String, String> getStructuredStorageTarget({
    required String courseCode,
    required String category,
    required String fileName,
  }) {
    final cleanCode = courseCode.toUpperCase().trim();
    final subCategory = getSubfolderCategoryName(category);
    final targetPath = 'HM_Nexora_Drive / $cleanCode / $subCategory / $fileName';

    return {
      'root_folder_id': masterRootFolderId,
      'owner_email': masterOwnerEmail,
      'course_code': cleanCode,
      'subfolder_category': subCategory,
      'target_path': targetPath,
    };
  }

  /// Sends a structured upload request to Cloudflare API Worker & Supabase to create folder & move file.
  Future<Map<String, dynamic>> registerStructuredDriveFile({
    required String courseCode,
    required String title,
    required String category,
    required String fileUrl,
    required String contributorEmail,
    String? fileId,
  }) async {
    final cleanCode = courseCode.toUpperCase().trim();
    final subCategory = getSubfolderCategoryName(category);
    final fileName = '${cleanCode}_${category.replaceAll(' ', '_')}_${DateTime.now().millisecondsSinceEpoch}.pdf';

    final targetInfo = getStructuredStorageTarget(
      courseCode: cleanCode,
      category: category,
      fileName: fileName,
    );

    final payload = {
      'master_drive_folder_id': masterRootFolderId,
      'master_owner_email': masterOwnerEmail,
      'course_code': cleanCode,
      'category': category,
      'subfolder_category': subCategory,
      'title': title,
      'file_name': fileName,
      'url': fileUrl,
      'contributor': contributorEmail,
      'target_path': targetInfo['target_path'],
      'status': 'approved',
      'created_at': DateTime.now().toIso8601String(),
    };

    // 1. Save to Supabase `contributions` & `master_drive_index`
    final c = SupabaseService.client;
    if (c != null) {
      try {
        await c.from('contributions').insert(payload);
      } catch (_) {}
    }

    // 2. Dispatch structured folder creation & organization to Nexora Cloud API Worker
    try {
      final cloud = NexoraCloudService();
      await cloud.post('/drive/organize-structured', payload);
    } catch (_) {}

    return payload;
  }
}
