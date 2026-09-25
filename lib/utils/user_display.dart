import '../services/supabase_service.dart';
import 'text_utils.dart';

class UserDisplay {
  UserDisplay._();

  static String name() {
    final user = SupabaseService.client?.auth.currentUser;
    final n = user?.userMetadata?['name']?.toString();
    return (n != null && n.trim().isNotEmpty) ? n.trim() : 'Student';
  }

  static String initials() => initialsFromName(name());
}
