import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../theme.dart';
import '../../widgets/app_text_field.dart';
import '../../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  final NavigateFn navigate;
  const RegisterScreen({super.key, required this.navigate});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  bool showPass = false;
  bool agreed = true;
  bool loading = false;
  String? error;
  final name = TextEditingController();
  final email = TextEditingController();
  final studentId = TextEditingController();
  final password = TextEditingController();

  Future<void> _submit() async {
    if (name.text.trim().isEmpty || email.text.trim().isEmpty || password.text.isEmpty) {
      setState(() => error = 'Please fill in your name, email, and password.');
      return;
    }
    if (!agreed) {
      setState(() => error = 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    if (password.text.length < 6) {
      setState(() => error = 'Password must be at least 6 characters.');
      return;
    }
    setState(() {
      loading = true;
      error = null;
    });
    try {
      final confirmationRequired = await AuthService.instance.register(
        name: name.text.trim(),
        email: email.text,
        studentId: studentId.text.trim(),
        password: password.text,
      );
      if (!mounted) return;
      if (confirmationRequired) {
        await showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Check your email'),
            content: const Text(
              'Your account was created. Confirm your email, then sign in.',
            ),
            actions: [
              FilledButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('OK'),
              ),
            ],
          ),
        );
        if (mounted) widget.navigate('login');
      } else {
        widget.navigate('main');
      }
    } catch (e) {
      setState(() => error = AuthService.friendlyError(e));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.background,
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 40),
                decoration: const BoxDecoration(gradient: AppColors.cyanGradient),
                child: Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Positioned(
                      top: -40,
                      right: -40,
                      child: Container(
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.primary.withAlphaFrac(0.2)),
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          onPressed: () => widget.navigate('login'),
                          icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
                        ),
                        const SizedBox(height: 12),
                        const Text('Create Account', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text('Join thousands of students on Nexora', style: TextStyle(color: Colors.white.withAlphaFrac(0.6), fontSize: 14)),
                      ],
                    ),
                  ],
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -24),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [BoxShadow(color: Colors.black.withAlphaFrac(0.06), blurRadius: 20, offset: const Offset(0, 8))],
                    ),
                    child: Column(
                      children: [
                        AppTextField(label: 'Full Name', placeholder: 'Ahmad Al-Hassan', icon: Icons.person_outline, controller: name),
                        const SizedBox(height: 16),
                        AppTextField(label: 'Student Email', placeholder: 'student@university.edu', icon: Icons.mail_outline, controller: email, keyboardType: TextInputType.emailAddress),
                        const SizedBox(height: 16),
                        AppTextField(
                          label: 'Student ID',
                          placeholder: 'e.g. 2024-CS-0042',
                          controller: studentId,
                          leading: const Text('ID', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                        ),
                        const SizedBox(height: 16),
                        AppTextField(
                          label: 'Password',
                          placeholder: 'Min. 6 characters',
                          icon: Icons.lock_outline,
                          controller: password,
                          obscure: !showPass,
                          trailing: IconButton(
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                            icon: Icon(showPass ? Icons.visibility_off_outlined : Icons.visibility_outlined, size: 18, color: AppColors.subtitle),
                            onPressed: () => setState(() => showPass = !showPass),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            GestureDetector(
                              onTap: () => setState(() => agreed = !agreed),
                              child: Container(
                                width: 20,
                                height: 20,
                                margin: const EdgeInsets.only(top: 2),
                                decoration: BoxDecoration(
                                  color: agreed ? AppColors.primary : Colors.transparent,
                                  border: Border.all(color: agreed ? AppColors.primary : AppColors.border, width: 1.5),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: agreed ? const Icon(Icons.check, size: 14, color: Colors.white) : null,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: RichText(
                                text: const TextSpan(
                                  style: TextStyle(color: AppColors.mutedForeground, fontSize: 12, height: 1.5),
                                  children: [
                                    TextSpan(text: 'I agree to the '),
                                    TextSpan(text: 'Terms of Service', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                                    TextSpan(text: ' and '),
                                    TextSpan(text: 'Privacy Policy', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        if (error != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Text(error!, style: const TextStyle(color: AppColors.red, fontSize: 12, fontWeight: FontWeight.w500)),
                          ),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: loading ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.cyan,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                              elevation: 4,
                            ),
                            child: loading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2.4, valueColor: AlwaysStoppedAnimation(Colors.white)),
                                  )
                                : const Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text('Create Account', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                                      SizedBox(width: 8),
                                      Icon(Icons.arrow_forward, size: 18),
                                    ],
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Transform.translate(
                offset: const Offset(0, -12),
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text('Already have an account? ', style: TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
                        GestureDetector(
                          onTap: () => widget.navigate('login'),
                          child: const Text('Sign In', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
