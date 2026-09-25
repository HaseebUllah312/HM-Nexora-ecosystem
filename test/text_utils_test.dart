import 'package:flutter_test/flutter_test.dart';
import 'package:hm_nexora/utils/text_utils.dart';

void main() {
  group('initialsFromName', () {
    test('returns two uppercase initials for a two-word name', () {
      expect(initialsFromName('Ahmad Al-Hassan'), 'AA');
    });

    test('returns a single initial for a one-word name', () {
      expect(initialsFromName('Cher'), 'C');
    });

    test('ignores extra whitespace between words', () {
      expect(initialsFromName('  Sara   Al-Khaldi  '), 'SA');
    });

    test('falls back to ST for an empty name', () {
      expect(initialsFromName(''), 'ST');
    });

    test('falls back to ST for a whitespace-only name', () {
      expect(initialsFromName('   '), 'ST');
    });

    test('only takes the first two words for a long name', () {
      expect(initialsFromName('Mohammed Ali Rashid Al-Farsi'), 'MA');
    });
  });
}
