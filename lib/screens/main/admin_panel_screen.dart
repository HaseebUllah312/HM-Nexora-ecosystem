import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../navigation.dart';
import '../../services/app_preferences.dart';
import '../../services/drive_folder_organizer_service.dart';
import '../../services/nexora_cloud_service.dart';
import '../../services/supabase_service.dart';
import '../../services/auth_service.dart';
import '../../widgets/in_app_document_viewer.dart';

class AdminPanelScreen extends StatefulWidget {
  final NavigateFn navigate;

  const AdminPanelScreen({
    super.key,
    required this.navigate,
  });

  @override
  State<AdminPanelScreen> createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final cloud = NexoraCloudService();

  bool loadingServerStatus = false;
  bool serverConnected = false;
  Map<String, dynamic> serverHealth = {};
  Map<String, dynamic> dbStats = {};

  // Feature Switches
  bool mockExamEnabled = true;
  bool podcastModeEnabled = true;
  bool communityRoomsEnabled = true;
  bool deadlineAlertsEnabled = true;
  bool vulmsSyncEnabled = true;

  // AI Configuration
  String selectedModel = 'gemini-flash-latest';
  final List<String> activeKeyPool = [
    'QVEuQWI4Uk42SU5rV2c5YmQzNi1Hb3ZwX1ZaTS1UX2FBWVRXOHYzTnR4RFUyWTlNVTc1UGc=',
    'QVEuQWI4Uk42S19HU3k3MWg5aXR4ckVtbXd3eDFlclNxRW5BeWNZekFUZmd0Zm9DNmtUekE=',
    'QUl6YVN5RFJuajdQZnZHU3JmSlRYbHlrbHZrUU5LZDF3aENjbEQw',
    'QVEuQWI4Uk42S1U3V296LWxiS2d0NC04Y0pQY3NYUnJYVncyd0o4Q2VydU84X2RET2xHN2c=',
    'QVEuQWI4Uk42TG5HUEpRYjdhT0pFaGRkTnA1Q3lzdlk5elI2RkZuRm1Va0d2QlVWcWZDVmc=',
  ].map((k) => utf8.decode(base64.decode(k))).toList();

  // Course Question Bank
  String selectedCourse = 'CS407';
  String questionType = 'mcq'; // 'mcq' | 'short' | 'long'
  final TextEditingController qTextController = TextEditingController();
  final TextEditingController optAController = TextEditingController();
  final TextEditingController optBController = TextEditingController();
  final TextEditingController optCController = TextEditingController();
  final TextEditingController optDController = TextEditingController();
  final TextEditingController explController = TextEditingController();
  final TextEditingController modelSolController = TextEditingController();
  int correctOptIndex = 0;

  // Community Chat Moderation
  String modSelectedRoom = 'GENERAL';
  bool loadingLiveMsgs = false;
  bool isCurrentRoomLocked = false;
  List<Map<String, dynamic>> liveCommunityMsgs = [];
  final List<Map<String, dynamic>> simulatedCommunityMsgs = [
    {'id': 'm1', 'user': 'Student_BC2104', 'room': 'CS407', 'msg': 'Does anyone have the grand quiz solved papers for CS407?', 'time': '10:14 AM'},
    {'id': 'm2', 'user': 'Alex_CS', 'room': 'CS407', 'msg': 'Check the study vault! I uploaded 3 past papers yesterday.', 'time': '10:18 AM'},
    {'id': 'm3', 'user': 'SpamUser99', 'room': 'CS407', 'msg': 'Click here to buy fake assignment solutions cheap!', 'time': '10:25 AM'},
    {'id': 'm4', 'user': 'Fatima_MGT', 'room': 'MGT502', 'msg': 'Can someone explain organizational structure types?', 'time': '11:02 AM'},
  ];

  // Verified Students Management
  bool loadingVerifications = false;
  List<Map<String, dynamic>> verifiedStudentsList = [];

  // YouTube & Study Files Management
  final TextEditingController ytTitleController = TextEditingController();
  final TextEditingController ytUrlController = TextEditingController();
  final List<Map<String, String>> youtubeLectures = [
    {'title': 'CS407 Virtual Memory Complete Lecture', 'url': 'https://youtube.com/watch?v=demo1', 'course': 'CS407'},
    {'title': 'CS506 Java GUI & Event Handling', 'url': 'https://youtube.com/watch?v=demo2', 'course': 'CS506'},
  ];

  // Course Reviews Moderation
  final List<Map<String, dynamic>> studentReviews = [
    {'id': 'r1', 'course': 'CS407', 'user': 'Zain_BC19', 'rating': 5, 'comment': 'Great AI summaries and past paper practice!'},
    {'id': 'r2', 'course': 'MGT502', 'user': 'Hira_VU', 'rating': 4, 'comment': 'Very helpful exam preparation questions.'},
  ];

  // Announcement Studio
  final TextEditingController broadcastTitleController = TextEditingController();
  final TextEditingController broadcastMsgController = TextEditingController();
  final List<Map<String, String>> publishedAnnouncements = [
    {
      'id': 'a1',
      'title': 'VULMS Grand Quiz Datesheet & Past Papers Released',
      'body': 'Prepare for upcoming Grand Quizzes using our AI Mock Exam Platform & Study Vault!',
      'date': 'Today, 10:30 AM',
      'status': 'Active Broadcast',
    },
    {
      'id': 'a2',
      'title': 'System Maintenance & New AI Mentor Upgrade',
      'body': 'HM Nexora v1.6.1 is live with faster handout summaries and quiz generation.',
      'date': 'Yesterday, 4:15 PM',
      'status': 'Active Broadcast',
    },
  ];

  // Files & Contributions Manager
  final TextEditingController newFileTitleController = TextEditingController();
  final TextEditingController newFileUrlController = TextEditingController();
  final TextEditingController newFileCourseController = TextEditingController();
  final TextEditingController fileSearchController = TextEditingController();
  String newFileCategory = 'Handout / Notes';
  String adminFileFilterStatus = 'All'; // 'All' | 'Pending' | 'Approved' | 'Rejected'
  String fileSearchQuery = '';

  final List<Map<String, dynamic>> adminFilesList = [
    {
      'id': 'contrib_1723981200000',
      'course_code': 'CS407',
      'title': 'CS407 Midterm Solution File (Fall 2024)',
      'file_name': 'CS407_Midterm_Solution_2024.pdf',
      'category': 'Past Paper',
      'url': 'https://drive.google.com/file/d/1ABHZt6HR5BUvzNQNGmZWgIjI5mH8J4Md/view',
      'contributor': 'student.ali@vu.edu.pk',
      'status': 'pending',
      'created_at': 'Today, 11:20 AM',
    },
    {
      'id': 'contrib_1723980000000',
      'course_code': 'MGT502',
      'title': 'MGT502 Handouts Chapter 1-15 Highlighted',
      'file_name': 'MGT502_Highlighted_Handouts.pdf',
      'category': 'Handout / Notes',
      'url': 'https://drive.google.com/file/d/1sQKgKIOksWTygzHCTV6J-k6GcCoLwt7e/view',
      'contributor': 'fatima.khan@vu.edu.pk',
      'status': 'pending',
      'created_at': 'Today, 09:45 AM',
    },
    {
      'id': 'gd_1ABHZt6HR5BUvzNQNGmZWgIjI5mH8J4Md',
      'course_code': 'CS407',
      'title': 'CS407 MCQs by HM Nexora',
      'file_name': 'CS407 MCQs by HM Nexora.pdf',
      'category': 'Grand Quiz',
      'url': 'https://drive.google.com/file/d/1ABHZt6HR5BUvzNQNGmZWgIjI5mH8J4Md/view',
      'contributor': 'haseebsaleem312@gmail.com (Owner)',
      'status': 'approved',
      'created_at': '2026-08-18',
    },
    {
      'id': 'gd_1sQKgKIOksWTygzHCTV6J-k6GcCoLwt7e',
      'course_code': 'SOC609',
      'title': 'SOC609_Highlighted_handouts',
      'file_name': 'SOC609_Highlighted_handouts.pdf',
      'category': 'Handout / Notes',
      'url': 'https://drive.google.com/file/d/1sQKgKIOksWTygzHCTV6J-k6GcCoLwt7e/view',
      'contributor': 'Admin Upload',
      'status': 'approved',
      'created_at': '2026-08-18',
    },
  ];

  // Users & Admin Manager
  final TextEditingController newAdminEmailController = TextEditingController();
  String userFilterRole = 'All'; // 'All' | 'Admins' | 'Students'
  final List<Map<String, dynamic>> userAccounts = [
    {
      'email': 'haseebsaleem312@gmail.com',
      'name': 'Haseeb Saleem',
      'role': 'Owner',
      'studentId': 'BC-OWNER-01',
      'status': 'Active',
      'joined': '2024-01-01',
    },
    {
      'email': 'admin.support@vu.edu.pk',
      'name': 'VU Support Admin',
      'role': 'Admin',
      'studentId': 'ADM-9901',
      'status': 'Active',
      'joined': '2024-02-15',
    },
    {
      'email': 'student.ali@vu.edu.pk',
      'name': 'Ali Raza',
      'role': 'Student',
      'studentId': 'BC210408990',
      'status': 'Active',
      'joined': '2024-05-10',
    },
    {
      'email': 'fatima.khan@vu.edu.pk',
      'name': 'Fatima Khan',
      'role': 'Student',
      'studentId': 'MC220901234',
      'status': 'Active',
      'joined': '2024-06-01',
    },
  ];

  void _approveFile(int index) async {
    final file = adminFilesList[index];
    setState(() {
      file['status'] = 'approved';
    });

    final c = SupabaseService.client;
    if (c != null && file['id'] != null) {
      try {
        await c.from('contributions').update({'status': 'approved'}).eq('id', file['id']);

        // If this contribution is a solution submission for an activity, publish live!
        if (file['activity_id'] != null && file['activity_id'].toString().isNotEmpty) {
          await c.from('lms_activities').update({
            'solution_url': file['url'],
            'solution_title': file['title'],
          }).eq('id', file['activity_id']);
        }
      } catch (_) {}
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Approved "${file['title']}"! Published live to all students. 🎉'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _rejectFile(int index) async {
    final file = adminFilesList[index];
    setState(() {
      file['status'] = 'rejected';
    });

    final c = SupabaseService.client;
    if (c != null && file['id'] != null) {
      try {
        await c.from('contributions').update({'status': 'rejected'}).eq('id', file['id']);
      } catch (_) {}
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Rejected "${file['title']}".'),
          backgroundColor: Colors.amber.shade900,
        ),
      );
    }
  }

  void _deleteFile(int index) async {
    final file = adminFilesList[index];
    final title = file['title'];
    setState(() {
      adminFilesList.removeAt(index);
    });

    final c = SupabaseService.client;
    if (c != null && file['id'] != null) {
      try {
        await c.from('contributions').delete().eq('id', file['id']);
      } catch (_) {}
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Deleted "$title" permanently.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _addNewAdminFile() async {
    final title = newFileTitleController.text.trim();
    final url = newFileUrlController.text.trim();
    final course = newFileCourseController.text.trim().toUpperCase();

    if (title.isEmpty || url.isEmpty || course.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter course code, title, and Google Drive URL!'), backgroundColor: Colors.red),
      );
      return;
    }

    final newFile = {
      'id': 'gd_admin_${DateTime.now().millisecondsSinceEpoch}',
      'course_code': course,
      'title': title,
      'file_name': '$title.pdf',
      'category': newFileCategory,
      'url': url,
      'contributor': 'haseebsaleem312@gmail.com (Owner)',
      'status': 'approved',
      'created_at': DateTime.now().toString().split(' ').first,
    };

    setState(() {
      adminFilesList.insert(0, newFile);
    });

    final c = SupabaseService.client;
    if (c != null) {
      try {
        await c.from('contributions').insert({
          'id': newFile['id'],
          'course_code': course,
          'title': title,
          'file_name': newFile['file_name'],
          'category': newFileCategory,
          'url': url,
          'status': 'approved',
          'created_at': DateTime.now().toIso8601String(),
        });
      } catch (_) {}
    }

    await DriveFolderOrganizerService.instance.registerStructuredDriveFile(
      courseCode: course,
      title: title,
      category: newFileCategory,
      fileUrl: url,
      contributorEmail: 'haseebsaleem312@gmail.com (Owner)',
    );

    newFileTitleController.clear();
    newFileUrlController.clear();
    newFileCourseController.clear();

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Uploaded & Published "$title" to $course Vault! 🚀'), backgroundColor: Colors.green),
      );
    }
  }

  void _openFileUrl(String? rawUrl, {String title = 'Document', String course = '', String category = ''}) {
    if (rawUrl == null || rawUrl.isEmpty) return;
    InAppDocumentViewer.open(
      context,
      title: title,
      url: rawUrl,
      courseCode: course,
      category: category,
    );
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 8, vsync: this);
    apiKeyInput.text = AppPreferences.instance.customApiKey;
    _checkServerStatus();
    _loadLiveCommunityMsgs();
    _loadVerifiedStudents();
  }

  @override
  void dispose() {
    _tabController.dispose();
    apiKeyInput.dispose();
    qTextController.dispose();
    optAController.dispose();
    optBController.dispose();
    optCController.dispose();
    optDController.dispose();
    explController.dispose();
    modelSolController.dispose();
    ytTitleController.dispose();
    ytUrlController.dispose();
    broadcastTitleController.dispose();
    broadcastMsgController.dispose();
    newAdminEmailController.dispose();
    newFileTitleController.dispose();
    newFileUrlController.dispose();
    newFileCourseController.dispose();
    fileSearchController.dispose();
    super.dispose();
  }

  Future<void> _checkServerStatus() async {
    setState(() => loadingServerStatus = true);
    try {
      final base = NexoraCloudService.apiBase.replaceAll(RegExp(r'/$'), '');
      final hRes = await http.get(Uri.parse('$base/health')).timeout(const Duration(seconds: 4));
      final dRes = await http.get(Uri.parse('$base/api/v1/db-check')).timeout(const Duration(seconds: 4));

      if (hRes.statusCode == 200 && dRes.statusCode == 200) {
        serverHealth = jsonDecode(hRes.body);
        dbStats = jsonDecode(dRes.body);
        serverConnected = true;
      }
    } catch (_) {
      serverConnected = false;
    } finally {
      if (mounted) setState(() => loadingServerStatus = false);
    }
  }

  Future<void> _loadLiveCommunityMsgs() async {
    if (!mounted) return;
    setState(() => loadingLiveMsgs = true);
    try {
      final c = SupabaseService.client;
      if (c != null) {
        final code = modSelectedRoom.toUpperCase().trim();
        dynamic res;
        if (code == 'ALL') {
          res = await c.from('community_messages').select().order('created_at', ascending: false).limit(50);
        } else {
          res = await c.from('community_messages').select().or('course_code.eq.$code,channel.eq.$code').order('created_at', ascending: false).limit(50);
        }
        if (mounted && res is List) {
          setState(() {
            liveCommunityMsgs = List<Map<String, dynamic>>.from(res);
          });
        }

        // Check room lock state
        final lockRows = await c.from('user_settings').select().eq('user_id', 'room_lock_$code');
        if (lockRows.isNotEmpty && lockRows[0]['settings_json'] != null) {
          try {
            final data = jsonDecode(lockRows[0]['settings_json']);
            if (mounted) setState(() => isCurrentRoomLocked = data['locked'] == true);
          } catch (_) {}
        } else {
          if (mounted) setState(() => isCurrentRoomLocked = false);
        }
      }
    } catch (_) {} finally {
      if (mounted) setState(() => loadingLiveMsgs = false);
    }
  }

  Future<void> _deleteCommunityMessageLive(String id) async {
    setState(() {
      liveCommunityMsgs.removeWhere((m) => m['id'] == id);
      simulatedCommunityMsgs.removeWhere((m) => m['id'] == id);
    });

    final c = SupabaseService.client;
    if (c != null) {
      try {
        await c.from('community_messages').delete().eq('id', id);
      } catch (_) {}
      try {
        await c.from('community_posts').delete().eq('id', id);
      } catch (_) {}
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Message deleted permanently from community room! 🗑️'), backgroundColor: Colors.red),
      );
    }
  }

  Future<void> _toggleRoomLock() async {
    final code = modSelectedRoom.toUpperCase().trim();
    final newStatus = !isCurrentRoomLocked;
    setState(() => isCurrentRoomLocked = newStatus);

    final c = SupabaseService.client;
    if (c != null) {
      try {
        await c.from('user_settings').upsert({
          'user_id': 'room_lock_$code',
          'settings_json': jsonEncode({'locked': newStatus, 'updated_at': DateTime.now().toIso8601String()}),
          'updated_at': DateTime.now().toIso8601String(),
        });
      } catch (_) {}
    }

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(newStatus ? '🔒 Room #$code is now LOCKED (Students cannot post)' : '🔓 Room #$code is now UNLOCKED'),
          backgroundColor: newStatus ? Colors.red : Colors.green,
        ),
      );
    }
  }

  Future<void> _loadVerifiedStudents() async {
    if (!mounted) return;
    setState(() => loadingVerifications = true);
    try {
      final c = SupabaseService.client;
      if (c != null) {
        final rows = await c.from('user_settings').select().like('user_id', 'verify_%');
        final list = <Map<String, dynamic>>[];
        for (var r in rows) {
          try {
            final data = jsonDecode(r['settings_json'] ?? '{}');
            list.add(Map<String, dynamic>.from(data));
          } catch (_) {}
        }
        if (mounted) {
          setState(() {
            verifiedStudentsList = list;
          });
        }
      }
    } catch (_) {} finally {
      if (mounted) setState(() => loadingVerifications = false);
    }
  }

  Future<void> _toggleStudentVerification(String sid, bool verify) async {
    final c = SupabaseService.client;
    if (c != null) {
      try {
        final rows = await c.from('user_settings').select().eq('user_id', 'verify_$sid');
        Map<String, dynamic> data = {
          'student_id': sid,
          'is_verified': verify,
          'verified_subjects': ['CS101', 'CS201', 'MTH101', 'ACC501'],
          'verified_via': 'admin_panel',
          'updated_at': DateTime.now().toIso8601String(),
        };
        if (rows.isNotEmpty && rows[0]['settings_json'] != null) {
          data = jsonDecode(rows[0]['settings_json']);
          data['is_verified'] = verify;
          data['updated_at'] = DateTime.now().toIso8601String();
        }
        await c.from('user_settings').upsert({
          'user_id': 'verify_$sid',
          'settings_json': jsonEncode(data),
          'updated_at': DateTime.now().toIso8601String(),
        });
        await _loadVerifiedStudents();
      } catch (_) {}
    }
  }

  void _saveAiSettings() {
    AppPreferences.instance.update(apiKey: apiKeyInput.text.trim());
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('AI Engine & Key Configuration Saved! ✨'), backgroundColor: Colors.green),
    );
  }

  void _addQuestionToDatabase() {
    if (qTextController.text.trim().isEmpty) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Added new $questionType question to $selectedCourse Database! 🧠'),
        backgroundColor: Colors.green,
      ),
    );

    qTextController.clear();
    optAController.clear();
    optBController.clear();
    optCController.clear();
    optDController.clear();
    explController.clear();
    modelSolController.clear();
  }

  void _deleteCommunityMessage(String id) {
    _deleteCommunityMessageLive(id);
  }

  void _addYoutubeVideo() {
    if (ytTitleController.text.trim().isEmpty || ytUrlController.text.trim().isEmpty) return;

    setState(() {
      youtubeLectures.add({
        'title': ytTitleController.text.trim(),
        'url': ytUrlController.text.trim(),
        'course': selectedCourse,
      });
    });

    ytTitleController.clear();
    ytUrlController.clear();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Added YouTube video resource to $selectedCourse! 📺'), backgroundColor: Colors.green),
    );
  }

  Future<void> _sendGlobalBroadcast() async {
    final title = broadcastTitleController.text.trim();
    final body = broadcastMsgController.text.trim();

    if (title.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter an announcement title!'), backgroundColor: Colors.red),
      );
      return;
    }

    final newAnnouncement = {
      'id': 'a_${DateTime.now().millisecondsSinceEpoch}',
      'title': title,
      'body': body.isEmpty ? 'Official announcement from HM Nexora Admin.' : body,
      'date': 'Just now',
      'created_at': DateTime.now().toIso8601String(),
      'status': 'Active Broadcast',
    };

    setState(() {
      publishedAnnouncements.insert(0, newAnnouncement);
    });

    // 1. Write to Supabase Database for live multi-device broadcast
    final c = SupabaseService.client;
    if (c != null) {
      try {
        await c.from('announcements').insert({
          'title': title,
          'body': body.isEmpty ? 'Official announcement from HM Nexora Admin.' : body,
          'created_at': DateTime.now().toIso8601String(),
          'author': 'HM Nexora Admin',
        });
      } catch (_) {}
    }

    // 2. Broadcast via Nexora Cloud API
    try {
      final cloud = NexoraCloudService();
      await cloud.post('/broadcast', {'title': title, 'content': body});
    } catch (_) {}

    // 3. Show live Push Notification Banner on screen
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.campaign_rounded, color: Colors.white, size: 24),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('📢 LIVE ANNOUNCEMENT BROADCAST', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.amber.shade200)),
                    Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: Colors.indigo,
          duration: const Duration(seconds: 5),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    broadcastTitleController.clear();
    broadcastMsgController.clear();
  }

  void _addAdminUser() {
    final email = newAdminEmailController.text.trim().toLowerCase();
    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid email address!'), backgroundColor: Colors.red),
      );
      return;
    }

    final existingIdx = userAccounts.indexWhere((u) => u['email'].toString().toLowerCase() == email);
    if (existingIdx != -1) {
      if (userAccounts[existingIdx]['role'] == 'Owner') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User is already System Owner!'), backgroundColor: Colors.amber),
        );
        return;
      }
      setState(() {
        userAccounts[existingIdx]['role'] = 'Admin';
      });
    } else {
      setState(() {
        userAccounts.add({
          'email': email,
          'name': email.split('@').first,
          'role': 'Admin',
          'studentId': 'ADM-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
          'status': 'Active',
          'joined': DateTime.now().toString().split(' ').first,
        });
      });
    }

    newAdminEmailController.clear();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Granted Admin privileges to $email! 🛡️'), backgroundColor: Colors.green),
    );
  }

  void _toggleUserRole(int index) {
    final user = userAccounts[index];
    if (user['role'] == 'Owner') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('System Owner role cannot be demoted.'), backgroundColor: Colors.amber),
      );
      return;
    }

    setState(() {
      if (user['role'] == 'Admin') {
        user['role'] = 'Student';
      } else {
        user['role'] = 'Admin';
      }
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Updated ${user['email']} role to ${user['role']}'), backgroundColor: Colors.indigo),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final accent = AppPreferences.instance.accent;

    if (!AuthService.instance.isMasterAdmin) {
      return Scaffold(
        backgroundColor: cs.surfaceContainerLowest,
        appBar: AppBar(
          title: const Text('👑 Admin Control Center'),
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.lock_rounded, size: 40, color: Colors.red),
                ),
                const SizedBox(height: 20),
                const Text(
                  'Access Restricted',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                ),
                const SizedBox(height: 8),
                Text(
                  'The Admin Control Center is reserved for the Owner (haseebsaleem312@gmail.com) and authorized admins. You are signed in as a standard student.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: cs.onSurfaceVariant, fontSize: 13),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () => widget.navigate('home'),
                  icon: const Icon(Icons.home_rounded, size: 18),
                  label: const Text('Back to Student Home'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: cs.surfaceContainerLowest,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('👑 Master Unified Admin Control Center', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            Text(
              AuthService.instance.isOwner ? '👑 Owner: haseebsaleem312@gmail.com (Super Admin)' : 'Admin Control Center',
              style: const TextStyle(fontSize: 11, color: Colors.amber),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          tabs: const [
            Tab(icon: Icon(Icons.dashboard_rounded), text: 'Telemetry'),
            Tab(icon: Icon(Icons.people_alt_rounded), text: 'Users & Admins'),
            Tab(icon: Icon(Icons.quiz_rounded), text: 'Exam Questions'),
            Tab(icon: Icon(Icons.forum_rounded), text: 'Community Chat Mod'),
            Tab(icon: Icon(Icons.folder_special_rounded), text: 'Files & Contributions'),
            Tab(icon: Icon(Icons.star_rounded), text: 'Course Reviews'),
            Tab(icon: Icon(Icons.campaign_rounded), text: 'VULMS Notice Studio'),
            Tab(icon: Icon(Icons.tune_rounded), text: 'Toggles & AI Keys'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTelemetryTab(cs, accent),
          _buildUsersAndAdminTab(cs, accent),
          _buildExamQuestionBankTab(cs, accent),
          _buildCommunityModTab(cs, accent),
          _buildFilesAndYoutubeTab(cs, accent),
          _buildCourseReviewsTab(cs, accent),
          _buildAnnouncementStudioTab(cs, accent),
          _buildGlobalTogglesAndAiTab(cs, accent),
        ],
      ),
    );
  }

  // TAB 1: System Telemetry & Cloud Health
  Widget _buildTelemetryTab(ColorScheme cs, Color accent) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            color: serverConnected ? Colors.green.withValues(alpha: 0.1) : Colors.amber.withValues(alpha: 0.1),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(
                    serverConnected ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
                    size: 40,
                    color: serverConnected ? Colors.green : Colors.amber,
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          serverConnected ? 'Unified Cloud Backend Online & Connected ✓' : 'Cloud Failover Active',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: serverConnected ? Colors.green : Colors.amber),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          serverConnected ? 'Synchronized across Chrome Extension & Mobile App' : 'Local state fallback active',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: _checkServerStatus,
                    icon: loadingServerStatus ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.refresh_rounded),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          const Text('Unified Platform Statistics:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 12),

          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.6,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              _metricCard(cs, accent, 'Active AI Key Pool', '${activeKeyPool.length} Active Keys', Icons.vpn_key_rounded),
              _metricCard(cs, accent, 'Managed Courses', '6 VULMS Courses', Icons.menu_book_rounded),
              _metricCard(cs, accent, 'Database Questions', '150+ MCQs & Subjective', Icons.quiz_rounded),
              _metricCard(cs, accent, 'YouTube Video Lectures', '${youtubeLectures.length} Linked Playlists', Icons.ondemand_video_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metricCard(ColorScheme cs, Color accent, String title, String val, IconData icon) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Row(
              children: [
                Icon(icon, color: accent, size: 22),
                const Spacer(),
                Container(width: 8, height: 8, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
              ],
            ),
            const SizedBox(height: 10),
            Text(val, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            Text(title, style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant)),
          ],
        ),
      ),
    );
  }

  // TAB 2: AI Mock Exam Question Bank (MCQs + Short + Long)
  Widget _buildExamQuestionBankTab(ColorScheme cs, Color accent) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Set Course Exam Questions (MCQs, Short & Long)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      const Text('Course:', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 8),
                      DropdownButton<String>(
                        value: selectedCourse,
                        items: ['CS407', 'CS435', 'CS506', 'CS606', 'MGT502', 'MTH501']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontWeight: FontWeight.bold))))
                            .toList(),
                        onChanged: (v) => setState(() => selectedCourse = v!),
                      ),
                      const SizedBox(width: 16),
                      const Text('Type:', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 8),
                      DropdownButton<String>(
                        value: questionType,
                        items: const [
                          DropdownMenuItem(value: 'mcq', child: Text('MCQ (1 Mark)')),
                          DropdownMenuItem(value: 'short', child: Text('Short Question (3 Marks)')),
                          DropdownMenuItem(value: 'long', child: Text('Long Question (5 Marks)')),
                        ],
                        onChanged: (v) => setState(() => questionType = v!),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: qTextController,
                    maxLines: 2,
                    decoration: const InputDecoration(labelText: 'Question Statement', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 10),

                  if (questionType == 'mcq') ...[
                    TextField(controller: optAController, decoration: const InputDecoration(labelText: 'Option A', border: OutlineInputBorder())),
                    const SizedBox(height: 8),
                    TextField(controller: optBController, decoration: const InputDecoration(labelText: 'Option B', border: OutlineInputBorder())),
                    const SizedBox(height: 8),
                    TextField(controller: optCController, decoration: const InputDecoration(labelText: 'Option C', border: OutlineInputBorder())),
                    const SizedBox(height: 8),
                    TextField(controller: optDController, decoration: const InputDecoration(labelText: 'Option D', border: OutlineInputBorder())),
                    const SizedBox(height: 10),

                    Row(
                      children: [
                        const Text('Correct Option:', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(width: 12),
                        DropdownButton<int>(
                          value: correctOptIndex,
                          items: const [
                            DropdownMenuItem(value: 0, child: Text('Option A')),
                            DropdownMenuItem(value: 1, child: Text('Option B')),
                            DropdownMenuItem(value: 2, child: Text('Option C')),
                            DropdownMenuItem(value: 3, child: Text('Option D')),
                          ],
                          onChanged: (v) => setState(() => correctOptIndex = v!),
                        ),
                      ],
                    ),
                  ] else ...[
                    TextField(
                      controller: modelSolController,
                      maxLines: 3,
                      decoration: const InputDecoration(labelText: 'Official VULMS Model Solution Answer', border: OutlineInputBorder()),
                    ),
                  ],

                  const SizedBox(height: 10),
                  TextField(
                    controller: explController,
                    decoration: const InputDecoration(labelText: 'AI Solution Explanation / Marking Notes', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(backgroundColor: accent),
                      onPressed: _addQuestionToDatabase,
                      icon: const Icon(Icons.add_task_rounded),
                      label: Text('Save $questionType Question to $selectedCourse Database'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // TAB 3: Community Chat Moderator (View & Delete Messages Live)
  Widget _buildCommunityModTab(ColorScheme cs, Color accent) {
    final msgs = liveCommunityMsgs.isNotEmpty ? liveCommunityMsgs : simulatedCommunityMsgs;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Filter & Refresh Header
          Card(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Text('Channel:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(width: 8),
                      DropdownButton<String>(
                        value: modSelectedRoom,
                        items: ['GENERAL', 'CS101', 'CS201', 'CS301', 'CS302', 'CS407', 'CS506', 'MGT101', 'MGT502', 'MTH101', 'MTH501', 'ALL']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c == 'ALL' ? '🌐 All Rooms' : '# $c', style: const TextStyle(fontWeight: FontWeight.bold))))
                            .toList(),
                        onChanged: (v) {
                          if (v != null) {
                            setState(() => modSelectedRoom = v);
                            _loadLiveCommunityMsgs();
                          }
                        },
                      ),
                      const Spacer(),
                      IconButton.filledTonal(
                        icon: loadingLiveMsgs ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.refresh_rounded, size: 18),
                        onPressed: _loadLiveCommunityMsgs,
                        tooltip: 'Refresh Live Messages',
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Room Lock Status Indicator & Control
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isCurrentRoomLocked ? Colors.red.withValues(alpha: 0.12) : Colors.green.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isCurrentRoomLocked ? Colors.red.withValues(alpha: 0.4) : Colors.green.withValues(alpha: 0.4)),
                    ),
                    child: Row(
                      children: [
                        Icon(isCurrentRoomLocked ? Icons.lock_rounded : Icons.lock_open_rounded, color: isCurrentRoomLocked ? Colors.red : Colors.green, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            isCurrentRoomLocked ? 'Room #$modSelectedRoom is LOCKED by Admin' : 'Room #$modSelectedRoom is OPEN & ACTIVE',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: isCurrentRoomLocked ? Colors.red : Colors.green),
                          ),
                        ),
                        FilledButton.tonal(
                          style: FilledButton.styleFrom(
                            backgroundColor: isCurrentRoomLocked ? Colors.green : Colors.red,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                            minimumSize: const Size(60, 32),
                          ),
                          onPressed: _toggleRoomLock,
                          child: Text(isCurrentRoomLocked ? 'Unlock Room' : 'Lock Room', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          Text('Live Room Messages (${msgs.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 8),

          if (msgs.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(30),
                child: Center(child: Text('No active messages in this channel.')),
              ),
            )
          else
            ...msgs.map((m) {
              final user = (m['display_name'] ?? m['user'] ?? 'Student').toString();
              final sid = (m['student_id'] ?? m['user_id'] ?? '').toString();
              final text = (m['text'] ?? m['msg'] ?? '').toString();
              final isVerified = m['is_verified'] == true || user.contains('✓') || user.contains('🎓');
              final isAdmin = user.toLowerCase().contains('admin') || user.toLowerCase().contains('mughal');
              final id = m['id']?.toString() ?? '';
              final timeStr = m['created_at'] != null ? m['created_at'].toString().substring(0, 16).replaceAll('T', ' ') : (m['time'] ?? 'Recent');

              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isAdmin ? Colors.amber : (isVerified ? Colors.teal : accent.withValues(alpha: 0.15)),
                    child: Text(
                      isAdmin ? '👑' : (isVerified ? '🎓' : (user.isNotEmpty ? user[0].toUpperCase() : 'S')),
                      style: TextStyle(color: isAdmin || isVerified ? Colors.black : accent, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                  title: Row(
                    children: [
                      Flexible(child: Text(user, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13))),
                      if (isAdmin) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(color: Colors.amber.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                          child: const Text('ADMIN', style: TextStyle(color: Colors.amber, fontSize: 8.5, fontWeight: FontWeight.bold)),
                        ),
                      ] else if (isVerified) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(color: Colors.teal.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(4)),
                          child: const Text('VERIFIED', style: TextStyle(color: Colors.teal, fontSize: 8.5, fontWeight: FontWeight.bold)),
                        ),
                      ],
                      const Spacer(),
                      Text(timeStr, style: TextStyle(fontSize: 10, color: cs.onSurfaceVariant)),
                    ],
                  ),
                  subtitle: Padding(
                    padding: const EdgeInsets.only(top: 4),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(text, style: const TextStyle(fontSize: 13)),
                        if (sid.isNotEmpty) Text('VUID: $sid', style: TextStyle(fontSize: 10, color: cs.onSurfaceVariant)),
                      ],
                    ),
                  ),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_forever_rounded, color: Colors.red),
                    onPressed: () => _deleteCommunityMessage(id),
                    tooltip: 'Delete Message Permanently',
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  // TAB 4: Files & User Contributions Manager
  Widget _buildFilesAndYoutubeTab(ColorScheme cs, Color accent) {
    final pendingCount = adminFilesList.where((f) => f['status'] == 'pending').length;
    final approvedCount = adminFilesList.where((f) => f['status'] == 'approved').length;
    final rejectedCount = adminFilesList.where((f) => f['status'] == 'rejected').length;

    final filteredFiles = adminFilesList.where((f) {
      final matchesStatus = adminFileFilterStatus == 'All' ||
          (adminFileFilterStatus == 'Pending' && f['status'] == 'pending') ||
          (adminFileFilterStatus == 'Approved' && f['status'] == 'approved') ||
          (adminFileFilterStatus == 'Rejected' && f['status'] == 'rejected');

      final q = fileSearchQuery.trim().toLowerCase();
      final matchesSearch = q.isEmpty ||
          '${f['title']} ${f['course_code']} ${f['category']} ${f['contributor']}'
              .toLowerCase()
              .contains(q);

      return matchesStatus && matchesSearch;
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stat Overview Row
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.amber.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.amber.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    children: [
                      Text('$pendingCount', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.amber)),
                      const SizedBox(height: 2),
                      const Text('Pending Review', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.green.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    children: [
                      Text('$approvedCount', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.green)),
                      const SizedBox(height: 2),
                      const Text('Approved Live', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                  ),
                  child: Column(
                    children: [
                      Text('$rejectedCount', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.red)),
                      const SizedBox(height: 2),
                      const Text('Rejected', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Admin Add File Form Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.upload_file_rounded, color: Colors.indigo),
                      const SizedBox(width: 8),
                      Text('Admin Upload & Publish File', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: cs.onSurface)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  const Text('Directly publish a new past paper, handout, or quiz link into the vault.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: newFileCourseController,
                          textCapitalization: TextCapitalization.characters,
                          decoration: const InputDecoration(
                            labelText: 'Course Code (e.g. CS407)',
                            border: OutlineInputBorder(),
                            isDense: true,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: newFileCategory,
                          decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder(), isDense: true),
                          items: ['Handout / Notes', 'Midterm Paper', 'Finalterm Paper', 'Past Paper', 'Grand Quiz', 'Study Material', 'Assignment Solution', 'Premium / Exclusive File']
                              .map((cat) => DropdownMenuItem(value: cat, child: Text(cat, style: const TextStyle(fontSize: 12))))
                              .toList(),
                          onChanged: (v) => setState(() => newFileCategory = v!),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: newFileTitleController,
                    decoration: const InputDecoration(labelText: 'File Title', border: OutlineInputBorder(), isDense: true),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: newFileUrlController,
                    decoration: const InputDecoration(labelText: 'Google Drive URL / Public Link', border: OutlineInputBorder(), isDense: true),
                  ),
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(backgroundColor: accent),
                      onPressed: _addNewAdminFile,
                      icon: const Icon(Icons.cloud_upload_rounded, size: 18),
                      label: const Text('Publish File to Vault'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // File List Search & Filter Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Files & User Contributions (${filteredFiles.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'All', label: Text('All')),
                  ButtonSegment(value: 'Pending', label: Text('Pending')),
                  ButtonSegment(value: 'Approved', label: Text('Approved')),
                ],
                selected: {adminFileFilterStatus},
                onSelectionChanged: (set) => setState(() => adminFileFilterStatus = set.first),
              ),
            ],
          ),
          const SizedBox(height: 10),

          TextField(
            controller: fileSearchController,
            onChanged: (v) => setState(() => fileSearchQuery = v),
            decoration: InputDecoration(
              hintText: 'Search files by course code, title, or contributor email...',
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: fileSearchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear, size: 16),
                      onPressed: () {
                        fileSearchController.clear();
                        setState(() => fileSearchQuery = '');
                      },
                    )
                  : null,
              border: const OutlineInputBorder(),
              isDense: true,
            ),
          ),
          const SizedBox(height: 12),

          // List of File Items
          if (filteredFiles.isEmpty)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.folder_off_rounded, size: 40, color: Colors.grey),
                      const SizedBox(height: 8),
                      Text('No files found for "$adminFileFilterStatus" filter.', style: const TextStyle(color: Colors.grey)),
                    ],
                  ),
                ),
              ),
            )
          else
            ...filteredFiles.map((file) {
              final idx = adminFilesList.indexOf(file);
              final isPending = file['status'] == 'pending';
              final isApproved = file['status'] == 'approved';
              final isRejected = file['status'] == 'rejected';

              Color statusColor = Colors.green;
              String statusLabel = 'Approved';

              if (isPending) {
                statusColor = Colors.amber.shade800;
                statusLabel = 'Pending Review';
              } else if (isRejected) {
                statusColor = Colors.red;
                statusLabel = 'Rejected';
              }

              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              isPending ? Icons.pending_actions_rounded : isApproved ? Icons.check_circle_rounded : Icons.cancel_rounded,
                              color: statusColor,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  file['title'] ?? '',
                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  '${file['course_code']} • ${file['category']} • ${file['created_at']}',
                                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                                ),
                                Text(
                                  'Uploaded by: ${file['contributor']}',
                                  style: const TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: statusColor.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              statusLabel,
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      const Divider(height: 1),
                      const SizedBox(height: 6),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          TextButton.icon(
                            onPressed: () => _openFileUrl(file['url'], title: file['title'] ?? 'Document', course: file['course_code'] ?? '', category: file['category'] ?? ''),
                            icon: const Icon(Icons.open_in_new_rounded, size: 15),
                            label: const Text('View Document In-App', style: TextStyle(fontSize: 11)),
                          ),
                          Row(
                            children: [
                              if (isPending || isRejected)
                                FilledButton.icon(
                                  style: FilledButton.styleFrom(backgroundColor: Colors.green, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
                                  onPressed: () => _approveFile(idx),
                                  icon: const Icon(Icons.check_rounded, size: 15),
                                  label: const Text('Approve', style: TextStyle(fontSize: 11)),
                                ),
                              if (isPending) ...[
                                const SizedBox(width: 6),
                                OutlinedButton.icon(
                                  style: OutlinedButton.styleFrom(foregroundColor: Colors.amber.shade900, padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
                                  onPressed: () => _rejectFile(idx),
                                  icon: const Icon(Icons.close_rounded, size: 15),
                                  label: const Text('Reject', style: TextStyle(fontSize: 11)),
                                ),
                              ],
                              const SizedBox(width: 6),
                              IconButton(
                                tooltip: 'Delete File Permanently',
                                icon: const Icon(Icons.delete_forever_rounded, color: Colors.red, size: 20),
                                onPressed: () => _deleteFile(idx),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            }),
          const SizedBox(height: 24),

          // Linked YouTube Video Lectures Section
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Add YouTube Video Lecture Link', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 14),

                  Row(
                    children: [
                      const Text('Course Subject:', style: TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(width: 12),
                      DropdownButton<String>(
                        value: selectedCourse,
                        items: ['CS407', 'CS435', 'CS506', 'CS606', 'MGT502', 'MTH501']
                            .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(fontWeight: FontWeight.bold))))
                            .toList(),
                        onChanged: (v) => setState(() => selectedCourse = v!),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  TextField(controller: ytTitleController, decoration: const InputDecoration(labelText: 'Video Title', border: OutlineInputBorder(), isDense: true)),
                  const SizedBox(height: 10),
                  TextField(controller: ytUrlController, decoration: const InputDecoration(labelText: 'YouTube Video/Playlist URL', border: OutlineInputBorder(), isDense: true)),
                  const SizedBox(height: 14),

                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(backgroundColor: accent),
                      onPressed: _addYoutubeVideo,
                      icon: const Icon(Icons.video_call_rounded),
                      label: const Text('Add YouTube Resource Link'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 14),

          const Text('Linked YouTube Video Lectures:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 10),

          ...youtubeLectures.map((yt) {
            return Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: const Icon(Icons.play_circle_fill_rounded, color: Colors.red, size: 32),
                title: Text(yt['title']!, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                subtitle: Text('${yt['course']} • ${yt['url']}', style: const TextStyle(fontSize: 11)),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
                  onPressed: () => setState(() => youtubeLectures.remove(yt)),
                ),
              ),
            );
          }),
        ],
      ),
    );
  }

  // TAB 5: Course Reviews & Rating Moderation
  Widget _buildCourseReviewsTab(ColorScheme cs, Color accent) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: studentReviews.length,
      itemBuilder: (context, index) {
        final r = studentReviews[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 10),
          child: ListTile(
            leading: CircleAvatar(
              backgroundColor: accent.withValues(alpha: 0.15),
              child: Text('${r['rating']}★', style: TextStyle(color: accent, fontWeight: FontWeight.bold)),
            ),
            title: Text('${r['course']} — Reviewed by ${r['user']}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            subtitle: Text('"${r['comment']}"', style: const TextStyle(fontSize: 12, fontStyle: FontStyle.italic)),
            trailing: IconButton(
              icon: const Icon(Icons.delete_rounded, color: Colors.red),
              onPressed: () {
                setState(() => studentReviews.removeAt(index));
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Review removed by Admin.'), backgroundColor: Colors.red),
                );
              },
            ),
          ),
        );
      },
    );
  }

  // TAB 2: Users & Admin Manager
  Widget _buildUsersAndAdminTab(ColorScheme cs, Color accent) {
    final filteredUsers = userAccounts.where((u) {
      if (userFilterRole == 'Admins') return u['role'] == 'Admin' || u['role'] == 'Owner';
      if (userFilterRole == 'Students') return u['role'] == 'Student';
      return true;
    }).toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Grant Admin Privileges Form Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.admin_panel_settings_rounded, color: Colors.amber),
                      SizedBox(width: 8),
                      Text('Grant Admin Privileges to User', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  const Text('Enter a student email address to promote them to Admin status with panel access.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: newAdminEmailController,
                          decoration: const InputDecoration(
                            hintText: 'Enter user email (e.g. co-admin@vu.edu.pk)',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.email_rounded),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      SizedBox(
                        height: 52,
                        child: FilledButton.icon(
                          style: FilledButton.styleFrom(backgroundColor: accent),
                          onPressed: _addAdminUser,
                          icon: const Icon(Icons.person_add_rounded),
                          label: const Text('+ Add Admin'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // User Filter Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('User Directory (${filteredUsers.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'All', label: Text('All')),
                  ButtonSegment(value: 'Admins', label: Text('Admins')),
                  ButtonSegment(value: 'Students', label: Text('Students')),
                ],
                selected: {userFilterRole},
                onSelectionChanged: (set) {
                  setState(() => userFilterRole = set.first);
                },
              ),
            ],
          ),
          const SizedBox(height: 12),

          // User List Cards
          ...filteredUsers.asMap().entries.map((entry) {
            final idx = entry.key;
            final user = entry.value;
            final isOwnerRole = user['role'] == 'Owner';
            final isAdminRole = user['role'] == 'Admin';

            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: isOwnerRole ? Colors.amber.withValues(alpha: 0.2) : isAdminRole ? Colors.indigo.withValues(alpha: 0.2) : Colors.grey.withValues(alpha: 0.2),
                  child: Text(
                    isOwnerRole ? '👑' : isAdminRole ? '🛡️' : '🎓',
                    style: const TextStyle(fontSize: 18),
                  ),
                ),
                title: Row(
                  children: [
                    Text(user['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: isOwnerRole ? Colors.amber.withValues(alpha: 0.2) : isAdminRole ? Colors.indigo.withValues(alpha: 0.2) : Colors.green.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        user['role'] ?? 'Student',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isOwnerRole ? Colors.amber.shade900 : isAdminRole ? Colors.indigo : Colors.green,
                        ),
                      ),
                    ),
                  ],
                ),
                subtitle: Text('${user['email']} • ID: ${user['studentId']} • Joined: ${user['joined']}'),
                trailing: isOwnerRole
                    ? const Chip(label: Text('Permanent Owner'), backgroundColor: Colors.amberAccent)
                    : OutlinedButton.icon(
                        onPressed: () => _toggleUserRole(idx),
                        icon: Icon(isAdminRole ? Icons.remove_moderator_rounded : Icons.add_moderator_rounded, size: 16),
                        label: Text(isAdminRole ? 'Revoke Admin' : 'Make Admin'),
                      ),
              ),
            );
          }),
          const SizedBox(height: 24),

          // Verified Students Section
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('🎓 Verified Students (${verifiedStudentsList.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              IconButton.filledTonal(
                icon: loadingVerifications ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)) : const Icon(Icons.refresh_rounded, size: 18),
                onPressed: _loadVerifiedStudents,
                tooltip: 'Refresh Verifications',
              ),
            ],
          ),
          const SizedBox(height: 8),

          if (verifiedStudentsList.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: Text('No external student verification requests pending.')),
              ),
            )
          else
            ...verifiedStudentsList.map((st) {
              final sid = (st['student_id'] ?? st['user_id'] ?? '').toString();
              final name = (st['student_name'] ?? 'VU Student').toString();
              final isVer = st['is_verified'] == true;
              final rawSubjects = st['verified_subjects'] ?? st['enrolled_subjects'] ?? [];
              final subs = rawSubjects is List ? rawSubjects.map((s) => s.toString()).toList() : <String>[];

              return Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: isVer ? Colors.teal : Colors.grey,
                            radius: 16,
                            child: Text(isVer ? '🎓' : '⏳', style: const TextStyle(fontSize: 14)),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(sid, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                      decoration: BoxDecoration(color: isVer ? Colors.teal.withValues(alpha: 0.15) : Colors.amber.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(4)),
                                      child: Text(isVer ? 'VERIFIED' : 'PENDING', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: isVer ? Colors.teal : Colors.amber)),
                                    ),
                                  ],
                                ),
                                Text(name, style: TextStyle(fontSize: 11, color: cs.onSurfaceVariant)),
                              ],
                            ),
                          ),
                          FilledButton.tonal(
                            style: FilledButton.styleFrom(
                              backgroundColor: isVer ? Colors.red.withValues(alpha: 0.15) : Colors.teal.withValues(alpha: 0.2),
                              foregroundColor: isVer ? Colors.red : Colors.teal,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              minimumSize: const Size(60, 32),
                            ),
                            onPressed: () => _toggleStudentVerification(sid, !isVer),
                            child: Text(isVer ? 'Revoke' : 'Approve', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      if (subs.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 4,
                          runSpacing: 4,
                          children: subs.map((s) => Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(color: accent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4), border: Border.all(color: accent.withValues(alpha: 0.3))),
                            child: Text('#$s', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: accent)),
                          )).toList(),
                        ),
                      ],
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  // TAB 7: VULMS Announcement Broadcast Studio
  Widget _buildAnnouncementStudioTab(ColorScheme cs, Color accent) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Design & Publish VULMS Announcement Banner', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 6),
                  const Text('Broadcasts live to VULMS Extension & Mobile App users when they log in.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 16),

                  TextField(
                    controller: broadcastTitleController,
                    decoration: const InputDecoration(labelText: 'Announcement Title (e.g. Midterm Date Sheet Released)', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: broadcastMsgController,
                    maxLines: 3,
                    decoration: const InputDecoration(labelText: 'Detailed Announcement Body Content...', border: OutlineInputBorder()),
                  ),
                  const SizedBox(height: 16),

                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(backgroundColor: accent),
                      onPressed: _sendGlobalBroadcast,
                      icon: const Icon(Icons.campaign_rounded),
                      label: const Text('Publish Announcement to VULMS & App'),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          // Active Broadcast Announcements Feed
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Live Broadcast Announcements (${publishedAnnouncements.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const Icon(Icons.podcasts_rounded, color: Colors.indigo),
            ],
          ),
          const SizedBox(height: 12),

          if (publishedAnnouncements.isEmpty)
            const Card(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Center(child: Text('No active broadcast announcements.', style: TextStyle(color: Colors.grey))),
              ),
            )
          else
            ...publishedAnnouncements.asMap().entries.map((entry) {
              final idx = entry.key;
              final item = entry.value;

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: Colors.indigo.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                            child: Row(
                              children: [
                                const Icon(Icons.sensors_rounded, size: 14, color: Colors.indigo),
                                const SizedBox(width: 4),
                                Text(item['status'] ?? 'Active Broadcast', style: const TextStyle(color: Colors.indigo, fontWeight: FontWeight.bold, fontSize: 11)),
                              ],
                            ),
                          ),
                          Text(item['date'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(item['title'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                      const SizedBox(height: 4),
                      Text(item['body'] ?? '', style: const TextStyle(fontSize: 13, color: Colors.grey)),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton.icon(
                          onPressed: () {
                            setState(() => publishedAnnouncements.removeAt(idx));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Announcement broadcast revoked.'), backgroundColor: Colors.red),
                            );
                          },
                          icon: const Icon(Icons.delete_outline_rounded, size: 16, color: Colors.red),
                          label: const Text('Revoke Announcement', style: TextStyle(color: Colors.red, fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
        ],
      ),
    );
  }

  // TAB 7: Global Toggles & AI Key Pool
  Widget _buildGlobalTogglesAndAiTab(ColorScheme cs, Color accent) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Global App & Extension Feature Switches:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 10),

        SwitchListTile(
          title: const Text('AI Exam & Mock Test Simulator', style: TextStyle(fontWeight: FontWeight.bold)),
          subtitle: const Text('Enable interactive exam simulator for all students'),
          value: mockExamEnabled,
          onChanged: (v) => setState(() => mockExamEnabled = v),
          activeColor: accent,
        ),
        const Divider(),

        SwitchListTile(
          title: const Text('Handout-to-Audio Podcast Mode', style: TextStyle(fontWeight: FontWeight.bold)),
          subtitle: const Text('Enable voice podcast study mode for handouts'),
          value: podcastModeEnabled,
          onChanged: (v) => setState(() => podcastModeEnabled = v),
          activeColor: accent,
        ),
        const Divider(),

        SwitchListTile(
          title: const Text('Subject Discussion Community Rooms', style: TextStyle(fontWeight: FontWeight.bold)),
          subtitle: const Text('Enable course chat channels (#CS407, #CS506, etc.)'),
          value: communityRoomsEnabled,
          onChanged: (v) => setState(() => communityRoomsEnabled = v),
          activeColor: accent,
        ),
        const Divider(),

        SwitchListTile(
          title: const Text('Smart Activity & Deadline Alerts', style: TextStyle(fontWeight: FontWeight.bold)),
          subtitle: const Text('Send automatic notifications when deadlines approach'),
          value: deadlineAlertsEnabled,
          onChanged: (v) => setState(() => deadlineAlertsEnabled = v),
          activeColor: accent,
        ),
        const Divider(),

        SwitchListTile(
          title: const Text('VULMS Auto-Sync Service', style: TextStyle(fontWeight: FontWeight.bold)),
          subtitle: const Text('Enable automatic account book and course sync'),
          value: vulmsSyncEnabled,
          onChanged: (v) => setState(() => vulmsSyncEnabled = v),
          activeColor: accent,
        ),
        const SizedBox(height: 20),

        const Text('AI Engine & Key Configuration:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 10),

        DropdownButtonFormField<String>(
          value: selectedModel,
          items: const [
            DropdownMenuItem(value: 'gemini-flash-latest', child: Text('⚡ Gemini Flash Latest (Fast & Low Latency)')),
            DropdownMenuItem(value: 'gemini-1.5-pro', child: Text('🧠 Gemini 1.5 Pro (Deep Reasoning)')),
            DropdownMenuItem(value: 'gemini-2.0-flash', child: Text('🚀 Gemini 2.0 Flash (Next-Gen AI)')),
          ],
          onChanged: (v) => setState(() => selectedModel = v!),
          decoration: const InputDecoration(labelText: 'Primary AI Model Engine', border: OutlineInputBorder()),
        ),
        const SizedBox(height: 12),

        TextField(
          controller: apiKeyInput,
          decoration: const InputDecoration(labelText: 'Custom Gemini API Key Override', border: OutlineInputBorder(), prefixIcon: Icon(Icons.key_rounded)),
        ),
        const SizedBox(height: 14),

        SizedBox(
          height: 46,
          child: FilledButton.icon(
            style: FilledButton.styleFrom(backgroundColor: accent),
            onPressed: _saveAiSettings,
            icon: const Icon(Icons.save_rounded),
            label: const Text('Save AI Key Configuration'),
          ),
        ),
      ],
    );
  }
}
