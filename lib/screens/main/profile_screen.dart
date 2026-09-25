import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../navigation.dart';
import '../../services/account_service.dart';
import '../../theme.dart';
import '../../utils/text_utils.dart';

class ProfileScreen extends StatefulWidget {
  final NavigateFn navigate;
  const ProfileScreen({super.key, required this.navigate});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool loading = true;
  Map<String, dynamic> profile = {};

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final p = await AccountService.instance.loadProfile();
    if (mounted) {
      setState(() {
        profile = p;
        loading = false;
      });
    }
  }

  Future<void> _edit() async {
    final fields = <String, TextEditingController>{
      'name': TextEditingController(text: (profile['name'] ?? '').toString()),
      'studentId': TextEditingController(text: (profile['studentId'] ?? '').toString()),
      'whatsappNumber': TextEditingController(text: (profile['whatsappNumber'] ?? '').toString()),
      'enrolledSubjects': TextEditingController(text: ((profile['enrolledSubjects'] as List?)?.join(', ') ?? 'CS407, CS506, MGT502').toString()),
      'department': TextEditingController(text: (profile['department'] ?? '').toString()),
      'program': TextEditingController(text: (profile['program'] ?? '').toString()),
      'year': TextEditingController(text: (profile['year'] ?? '').toString()),
    };

    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: ListView(
          shrinkWrap: true,
          children: [
            Row(
              children: [
                const Expanded(
                  child: Text('Edit Profile & Student Info', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                ),
                IconButton(onPressed: () => Navigator.pop(ctx, false), icon: const Icon(Icons.close, color: Colors.white70)),
              ],
            ),
            const SizedBox(height: 10),
            ...fields.entries.map((e) => Padding(
                  padding: const EdgeInsets.only(top: 10),
                  child: TextField(
                    controller: e.value,
                    style: const TextStyle(color: Colors.white, fontSize: 14),
                    decoration: InputDecoration(
                      labelText: {
                        'name': 'Full Name',
                        'studentId': 'VU Student ID (e.g. BC210401234)',
                        'whatsappNumber': 'WhatsApp Number for Alerts',
                        'enrolledSubjects': 'Enrolled Subjects (e.g. CS101, CS201, MTH101)',
                        'department': 'Department',
                        'program': 'Degree Program (e.g. BSCS, BBA, MIT)',
                        'year': 'Semester / Year (e.g. Semester 4)',
                      }[e.key],
                      labelStyle: const TextStyle(color: Colors.white60),
                      filled: true,
                      fillColor: const Color(0xFF1E293B),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                    ),
                  ),
                )),
            const SizedBox(height: 18),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(ctx, true),
              child: const Text('Save Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );

    if (ok == true) {
      final next = {...profile};
      for (final e in fields.entries) {
        if (e.key == 'enrolledSubjects') {
          next['enrolledSubjects'] = e.value.text.split(',').map((x) => x.trim().toUpperCase()).where((x) => x.isNotEmpty).toList();
        } else {
          next[e.key] = e.value.text.trim();
        }
      }
      await AccountService.instance.saveProfile(next);
      await _load();
    }
    for (final c in fields.values) c.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (loading) return const Center(child: CircularProgressIndicator());
    final name = (profile['name'] ?? 'Student').toString().trim();
    final sid = (profile['studentId'] ?? '').toString().trim();
    final program = (profile['program'] ?? 'BS Computer Science').toString();
    final year = (profile['year'] ?? 'Semester 4').toString();
    final subjects = ((profile['enrolledSubjects'] as List?)?.join(', ') ?? 'CS101, CS201, MTH101').toString();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 💳 HM NEXORA HOLOGRAPHIC DIGITAL STUDENT ID CARD
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1E1B4B), Color(0xFF0F172A), Color(0xFF1E293B)],
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF818CF8).withOpacity(0.5), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6366F1).withOpacity(0.25),
                  blurRadius: 24,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Brand & Verified Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: const [
                        Icon(Icons.school_rounded, color: Color(0xFF38BDF8), size: 22),
                        SizedBox(width: 8),
                        Text(
                          'HM NEXORA STUDENT CARD',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFF10B981), width: 1),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.verified, color: Color(0xFF10B981), size: 12),
                          SizedBox(width: 4),
                          Text(
                            'VERIFIED',
                            style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),

                // Student Avatar & Details
                Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF6366F1), Color(0xFF38BDF8)],
                        ),
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        initialsFromName(name.isNotEmpty ? name : 'Student'),
                        style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            name.isNotEmpty ? name : 'Student Scholar',
                            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            program.isNotEmpty ? program : 'Virtual University of Pakistan',
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                          ),
                          const SizedBox(height: 4),
                          GestureDetector(
                            onTap: () {
                              if (sid.isNotEmpty) {
                                Clipboard.setData(ClipboardData(text: sid));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Student ID copied to clipboard!')),
                                );
                              }
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF334155),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    sid.isNotEmpty ? sid : 'ID: Not set',
                                    style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                  const SizedBox(width: 4),
                                  const Icon(Icons.copy, color: Color(0xFF38BDF8), size: 11),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),
                const Divider(color: Color(0xFF334155)),
                const SizedBox(height: 8),

                // Card Footer with Semester & Subjects
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('SEMESTER', style: TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
                        Text(year, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('SUBJECTS', style: TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
                        Text(subjects.split(',').length.toString() + ' Enrolled', style: const TextStyle(color: Color(0xFF10B981), fontSize: 12, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('SECURITY KEY', style: TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.bold)),
                        Text(sid.isNotEmpty ? 'NX-${sid.hashCode.abs().toString().substring(0, 6)}' : 'NX-SCHOLAR', style: const TextStyle(color: Color(0xFF818CF8), fontSize: 11, fontFamily: 'monospace')),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Profile Actions & Details
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF334155)),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.edit_note, color: Color(0xFF6366F1)),
                  title: const Text('Edit Student Profile', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('Update full name, WhatsApp, degree & subjects', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white38),
                  onTap: _edit,
                ),
                const Divider(color: Color(0xFF334155)),
                ListTile(
                  leading: const Icon(Icons.verified_user_outlined, color: Color(0xFF10B981)),
                  title: const Text('VULMS Verification', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('Login via in-app LMS to auto-verify enrolled subjects', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white38),
                  onTap: () => widget.navigate('lms'),
                ),
                const Divider(color: Color(0xFF334155)),
                ListTile(
                  leading: const Icon(Icons.settings_outlined, color: Color(0xFF38BDF8)),
                  title: const Text('Account & App Settings', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                  subtitle: const Text('Theme, audio, cloud sync & logout', style: TextStyle(color: Colors.white60, fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white38),
                  onTap: () => widget.navigate('settings'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
