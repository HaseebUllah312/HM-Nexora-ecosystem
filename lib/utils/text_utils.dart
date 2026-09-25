/// Pure string helpers with no Firebase/Flutter dependency, so they can be
/// unit tested directly (see test/text_utils_test.dart).
String initialsFromName(String name) {
  final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) return 'ST';
  return parts.map((p) => p[0]).take(2).join().toUpperCase();
}
