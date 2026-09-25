import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  final NavigateFn navigate;
  const LoginScreen({super.key, required this.navigate});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController();
  final password = TextEditingController();
  bool showPass = false;
  bool rememberMe = true;
  bool loading = false;
  bool googleLoading = false;
  bool fbLoading = false;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadSavedCredentials();
  }

  Future<void> _loadSavedCredentials() async {
    final creds = await AuthService.instance.getSavedCredentials();
    if (mounted) {
      setState(() {
        if (creds['email']!.isNotEmpty) email.text = creds['email']!;
        if (creds['password']!.isNotEmpty) password.text = creds['password']!;
        rememberMe = creds['remember'] == 'true';
      });
    }
  }

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final e = email.text.trim();
    final p = password.text;

    if (e.isEmpty || p.isEmpty) {
      setState(() => error = 'Please enter both your email and password.');
      return;
    }

    setState(() {
      loading = true;
      error = null;
    });

    try {
      await AuthService.instance.login(email: e, password: p, rememberMe: rememberMe);
      if (mounted) widget.navigate('main');
    } catch (err) {
      if (mounted) setState(() => error = AuthService.friendlyError(err));
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      googleLoading = true;
      error = null;
    });
    try {
      await AuthService.instance.signInWithGoogle();
      if (mounted && AuthService.instance.isAuthenticated) {
        widget.navigate('main');
      }
    } catch (err) {
      if (mounted) setState(() => error = AuthService.friendlyError(err));
    } finally {
      if (mounted) setState(() => googleLoading = false);
    }
  }

  Future<void> _handleFacebookSignIn() async {
    setState(() {
      fbLoading = true;
      error = null;
    });
    try {
      await AuthService.instance.signInWithFacebook();
      if (mounted && AuthService.instance.isAuthenticated) {
        widget.navigate('main');
      }
    } catch (err) {
      if (mounted) setState(() => error = AuthService.friendlyError(err));
    } finally {
      if (mounted) setState(() => fbLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: AutofillGroup(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                Center(
                  child: Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF6366F1), Color(0xFF3B82F6)],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF6366F1).withValues(alpha: 0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.school_rounded, color: Colors.white, size: 36),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Welcome to HM Nexora',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: 0.3,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Sign in with your student credentials or social account',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: Colors.white60),
                ),
                const SizedBox(height: 24),

                // Social Sign In Section
                Row(
                  children: [
                    // Google Sign In Button
                    Expanded(
                      child: OutlinedButton(
                        onPressed: (googleLoading || fbLoading || loading) ? null : _handleGoogleSignIn,
                        style: OutlinedButton.styleFrom(
                          backgroundColor: const Color(0xFF1E293B),
                          side: const BorderSide(color: Color(0xFF334155)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: googleLoading
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(2),
                                    decoration: const BoxDecoration(
                                      color: Colors.white,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Text(' G ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFFEA4335))),
                                  ),
                                  const SizedBox(width: 8),
                                  const Text('Google', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Facebook Sign In Button
                    Expanded(
                      child: OutlinedButton(
                        onPressed: (googleLoading || fbLoading || loading) ? null : _handleFacebookSignIn,
                        style: OutlinedButton.styleFrom(
                          backgroundColor: const Color(0xFF1877F2).withValues(alpha: 0.15),
                          side: const BorderSide(color: Color(0xFF1877F2)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        child: fbLoading
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                            : const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.facebook, color: Color(0xFF1877F2), size: 20),
                                  SizedBox(width: 6),
                                  Text('Facebook', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                                ],
                              ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 18),

                // Divider
                const Row(
                  children: [
                    Expanded(child: Divider(color: Color(0xFF334155), thickness: 1)),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 12),
                      child: Text('OR', style: TextStyle(color: Colors.white38, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                    Expanded(child: Divider(color: Color(0xFF334155), thickness: 1)),
                  ],
                ),

                const SizedBox(height: 18),

                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  child: Column(
                    children: [
                      TextField(
                        controller: email,
                        autofillHints: const [AutofillHints.email, AutofillHints.username],
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        keyboardType: TextInputType.emailAddress,
                        decoration: InputDecoration(
                          labelText: 'Email Address / Student ID',
                          labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                          prefixIcon: const Icon(Icons.email_outlined, color: Color(0xFF6366F1), size: 20),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: password,
                        autofillHints: const [AutofillHints.password],
                        obscureText: !showPass,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                        decoration: InputDecoration(
                          labelText: 'Password',
                          labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                          prefixIcon: const Icon(Icons.lock_outline, color: Color(0xFF6366F1), size: 20),
                          suffixIcon: IconButton(
                            icon: Icon(showPass ? Icons.visibility_off : Icons.visibility, color: Colors.white54, size: 20),
                            onPressed: () => setState(() => showPass = !showPass),
                          ),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        onSubmitted: (_) => _submit(),
                      ),
                      const SizedBox(height: 10),

                      Row(
                        children: [
                          Checkbox(
                            value: rememberMe,
                            activeColor: const Color(0xFF6366F1),
                            checkColor: Colors.white,
                            onChanged: (v) => setState(() => rememberMe = v ?? true),
                          ),
                          const Text('Remember password', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          const Spacer(),
                          TextButton(
                            onPressed: () async {
                              final scaffoldMessenger = ScaffoldMessenger.of(context);
                              if (email.text.trim().isEmpty) {
                                setState(() => error = 'Enter your email above first.');
                                return;
                              }
                              try {
                                await AuthService.instance.sendPasswordReset(email.text);
                                if (mounted) {
                                  scaffoldMessenger.showSnackBar(
                                    const SnackBar(content: Text('Password reset email sent.')),
                                  );
                                }
                              } catch (e) {
                                setState(() => error = AuthService.friendlyError(e));
                              }
                            },
                            child: const Text('Forgot?', style: TextStyle(color: Color(0xFF818CF8), fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),

                      if (error != null)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          child: Text(error!, style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 12)),
                        ),

                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: loading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: loading
                              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('Sign In', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton(
                          onPressed: () => widget.navigate('main'),
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Color(0xFF6366F1)),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Demo Access (Skip Login)', style: TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold, fontSize: 13)),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text("Don't have an account? ", style: TextStyle(color: Colors.white60, fontSize: 13)),
                    GestureDetector(
                      onTap: () => widget.navigate('register'),
                      child: const Text('Register', style: TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold, fontSize: 13)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
