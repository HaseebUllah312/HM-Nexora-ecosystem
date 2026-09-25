/// Simple string-based screen identifiers, mirroring the original React app's
/// `AuthScreen` / `MainScreen` union types.
class Screens {
  Screens._();

  static const List<String> auth = ['splash', 'onboard', 'login', 'register'];
  static const List<String> main = [
    'home',
    'subjects',
    'subjectDetail',
    'lms',
    'aiMentor',
    'community',
    'updates',
    'planner',
    'studyVault',
    'profile',
    'settings',
    'contributeFile',
    'mockExam',
    'adminPanel',
    'cppCompiler',
    'videoDownloader',
  ];
}

/// Signature matching the React `NavigateFn`: navigate(target, {data}).
typedef NavigateFn = void Function(String target, [Map<String, String>? data]);
