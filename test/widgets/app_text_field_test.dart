import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hm_nexora/widgets/app_text_field.dart';

void main() {
  testWidgets('AppTextField shows its label and placeholder', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppTextField(
            label: 'Email Address',
            placeholder: 'you@university.edu',
            icon: Icons.mail_outline,
          ),
        ),
      ),
    );

    expect(find.text('Email Address'), findsOneWidget);
    expect(find.text('you@university.edu'), findsOneWidget);
  });

  testWidgets('AppTextField accepts typed input via its controller', (tester) async {
    final controller = TextEditingController();

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AppTextField(
            label: 'Full Name',
            placeholder: 'Ahmad Al-Hassan',
            controller: controller,
          ),
        ),
      ),
    );

    await tester.enterText(find.byType(TextField), 'Sara Al-Khaldi');
    expect(controller.text, 'Sara Al-Khaldi');
  });

  testWidgets('AppTextField obscures text when obscure is true', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: AppTextField(
            label: 'Password',
            placeholder: 'Enter your password',
            obscure: true,
            icon: Icons.lock_outline,
          ),
        ),
      ),
    );

    final field = tester.widget<TextField>(find.byType(TextField));
    expect(field.obscureText, isTrue);
  });
}
