import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hm_nexora/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const HMNexoraApp());
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
