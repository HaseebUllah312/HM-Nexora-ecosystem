import 'dart:async';
import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../services/account_service.dart';
import '../../services/community_service.dart';
import '../../utils/text_utils.dart';

class CommunityScreen extends StatefulWidget {
  final NavigateFn navigate;
  const CommunityScreen({super.key, required this.navigate});
  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  int _currentTab = 0;

  // Public Channels
  String channel = 'GENERAL';
  List<String> userEnrolledSubjects = ['CS101', 'CS201', 'MTH101'];

  // User details
  String myStudentId = 'BC210400000';
  String myName = 'Student';
  bool isAdmin = false;

  Stream<List<Map<String, dynamic>>>? _postsStream;
  Stream<List<Map<String, dynamic>>>? _requestsStream;
  Stream<List<Map<String, dynamic>>>? _conversationsStream;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() => _currentTab = _tabController.index);
    });
    _loadProfileAndStreams();
  }

  Future<void> _loadProfileAndStreams() async {
    final p = await AccountService.instance.loadProfile();
    if (mounted) {
      setState(() {
        myName = (p['name'] ?? 'Student').toString();
        myStudentId = (p['studentId'] ?? 'BC210400000').toString();
        isAdmin = (p['role'] ?? '').toString().toLowerCase() == 'admin' || myName.toLowerCase().contains('admin');
        final subs = p['enrolledSubjects'] as List?;
        if (subs != null && subs.isNotEmpty) {
          userEnrolledSubjects = subs.map((e) => e.toString().toUpperCase()).toList();
        }
        _initStreams();
      });
    }
  }

  void _initStreams() {
    _postsStream = CommunityService.streamPosts(channel);
    _requestsStream = CommunityService.streamPendingRequests(myStudentId);
    _conversationsStream = CommunityService.streamRecentConversations(myStudentId);
  }

  void _switchChannel(String newChannel) {
    setState(() {
      channel = newChannel;
      _postsStream = CommunityService.streamPosts(newChannel);
    });
  }

  Future<void> _composePublicPost() async {
    final textCtrl = TextEditingController();
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF0F172A),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(ctx).viewInsets.bottom + 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.forum_rounded, color: Color(0xFF818CF8), size: 20),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text('Post to #$channel Room', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                ),
                IconButton(onPressed: () => Navigator.pop(ctx, false), icon: const Icon(Icons.close, color: Colors.white70)),
              ],
            ),
            const SizedBox(height: 12),
            TextField(
              controller: textCtrl,
              maxLines: 4,
              autofocus: true,
              style: const TextStyle(color: Colors.white, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Ask a question, share tips or start a discussion in real time...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 14),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF6366F1),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () => Navigator.pop(ctx, true),
              icon: const Icon(Icons.send_rounded, color: Colors.white, size: 18),
              label: const Text('Publish Live Post', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );

    if (ok == true && textCtrl.text.trim().isNotEmpty) {
      await CommunityService.createPost(
        channel: channel.toLowerCase(),
        text: textCtrl.text.trim(),
        displayName: myName,
        studentId: myStudentId,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            content: Text('⚡ Post published live to community!'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
    textCtrl.dispose();
  }

  Future<void> _startPrivateChat() async {
    final idCtrl = TextEditingController();
    final noteCtrl = TextEditingController();

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F172A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: const Row(
          children: [
            Icon(Icons.lock_person_outlined, color: Color(0xFF38BDF8)),
            SizedBox(width: 8),
            Text('Start Student DM', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: idCtrl,
              autofocus: true,
              textCapitalization: TextCapitalization.characters,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Target Student ID (e.g. BC210401234)',
                labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: noteCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Intro Message (Optional)',
                labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
                filled: true,
                fillColor: const Color(0xFF1E293B),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel', style: TextStyle(color: Colors.white54))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(isAdmin ? 'Direct Chat (Admin)' : 'Connect & Chat'),
          ),
        ],
      ),
    );

    if (ok == true && idCtrl.text.trim().isNotEmpty) {
      final target = idCtrl.text.trim().toUpperCase();
      if (target == myStudentId.toUpperCase()) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Cannot message yourself!'), backgroundColor: Colors.amber),
          );
        }
        return;
      }

      await CommunityService.sendConnectionRequest(
        targetStudentId: target,
        myStudentId: myStudentId,
        myName: myName,
        note: noteCtrl.text.trim().isEmpty ? 'Wants to study together on HM Nexora' : noteCtrl.text.trim(),
        isAdmin: isAdmin,
      );

      _openPrivateConversation(target);
    }
    idCtrl.dispose();
    noteCtrl.dispose();
  }

  void _openPrivateConversation(String partnerId) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PrivateChatScreen(
          myStudentId: myStudentId,
          myName: myName,
          partnerId: partnerId,
          isAdmin: isAdmin,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            Container(
              width: 10,
              height: 10,
              margin: const EdgeInsets.only(right: 8),
              decoration: const BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(color: Color(0xFF10B981), blurRadius: 6, spreadRadius: 1),
                ],
              ),
            ),
            const Text('Community & Live Chats', style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF6366F1),
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white54,
          tabs: [
            const Tab(
              icon: Icon(Icons.public_rounded, size: 18),
              text: 'Subject Rooms',
            ),
            const Tab(
              icon: Icon(Icons.chat_rounded, size: 18),
              text: '1-on-1 DMs',
            ),
            Tab(
              child: StreamBuilder<List<Map<String, dynamic>>>(
                stream: _requestsStream,
                builder: (context, snapshot) {
                  final reqCount = snapshot.data?.length ?? 0;
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.mail_outline_rounded, size: 18),
                      const SizedBox(width: 4),
                      const Text('Requests'),
                      if (reqCount > 0) ...[
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                          decoration: BoxDecoration(color: const Color(0xFFF43F5E), borderRadius: BorderRadius.circular(10)),
                          child: Text('$reqCount', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: _currentTab == 0
          ? FloatingActionButton.extended(
              backgroundColor: const Color(0xFF6366F1),
              onPressed: _composePublicPost,
              icon: const Icon(Icons.edit_note_rounded, color: Colors.white),
              label: Text('Post in #$channel', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : (_currentTab == 1
              ? FloatingActionButton.extended(
                  backgroundColor: const Color(0xFF10B981),
                  onPressed: _startPrivateChat,
                  icon: const Icon(Icons.person_add_alt_1_rounded, color: Colors.white),
                  label: const Text('Start Student DM', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                )
              : null),
      body: TabBarView(
        controller: _tabController,
        children: [
          // 1. PUBLIC SUBJECT CHANNELS (LIVE STREAM)
          Column(
            children: [
              Container(
                color: const Color(0xFF0F172A),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _channelChip('GENERAL', '💬 General'),
                      ...userEnrolledSubjects.map((subj) => _channelChip(subj, '💻 #$subj')),
                      _channelChip('EXAMS', '📝 Exams'),
                      _channelChip('HELP', '🙋 Help Desk'),
                    ],
                  ),
                ),
              ),
              Expanded(
                child: StreamBuilder<List<Map<String, dynamic>>>(
                  stream: _postsStream,
                  builder: (context, snapshot) {
                    if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                      return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
                    }

                    final posts = snapshot.data ?? [];
                    if (posts.isEmpty) {
                      return Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.forum_outlined, size: 48, color: Colors.white24),
                            const SizedBox(height: 12),
                            Text('No posts yet in #$channel room', style: const TextStyle(color: Colors.white70, fontSize: 15)),
                            const SizedBox(height: 6),
                            const Text('Be the first to ask questions or share knowledge!', style: TextStyle(color: Colors.white38, fontSize: 12)),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _composePublicPost,
                              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF6366F1)),
                              icon: const Icon(Icons.add, color: Colors.white),
                              label: const Text('Start Discussion', style: TextStyle(color: Colors.white)),
                            ),
                          ],
                        ),
                      );
                    }

                    return RefreshIndicator(
                      onRefresh: () async {
                        await CommunityService.getPosts(channel: channel);
                        if (mounted) setState(() {});
                      },
                      child: ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: posts.length,
                        itemBuilder: (_, i) {
                          final p = posts[i];
                          final name = (p['display_name'] ?? 'Student').toString();
                          final sId = (p['student_id'] ?? '').toString();
                          final timeStr = _formatTimestamp(p['created_at']?.toString());
                          final isMe = sId.toUpperCase() == myStudentId.toUpperCase();

                          return Card(
                            color: const Color(0xFF1E293B),
                            margin: const EdgeInsets.only(bottom: 10),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                              side: const BorderSide(color: Color(0xFF334155), width: 1),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(14),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      CircleAvatar(
                                        backgroundColor: isMe ? const Color(0xFF10B981) : const Color(0xFF6366F1),
                                        radius: 18,
                                        child: Text(
                                          initialsFromName(name),
                                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Flexible(
                                                  child: Text(
                                                    name,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                                  ),
                                                ),
                                                if (isMe) ...[
                                                  const SizedBox(width: 6),
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                                    decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                                                    child: const Text('YOU', style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
                                                  ),
                                                ],
                                                if (name.toLowerCase().contains('admin') || name.toLowerCase().contains('mughal')) ...[
                                                  const SizedBox(width: 6),
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                                    decoration: BoxDecoration(color: const Color(0xFFF59E0B).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFFF59E0B).withValues(alpha: 0.5), width: 0.5)),
                                                    child: const Text('👑 ADMIN', style: TextStyle(color: Color(0xFFFBBF24), fontSize: 9, fontWeight: FontWeight.bold)),
                                                  ),
                                                ] else if (sId.isNotEmpty && (userEnrolledSubjects.contains(channel.toUpperCase()) || isMe)) ...[
                                                  const SizedBox(width: 6),
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                                    decoration: BoxDecoration(color: const Color(0xFF10B981).withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6), border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 0.5)),
                                                    child: const Text('🎓 VERIFIED', style: TextStyle(color: Color(0xFF34D399), fontSize: 8.5, fontWeight: FontWeight.bold)),
                                                  ),
                                                ],
                                              ],
                                            ),
                                            Text(
                                              '${sId.isNotEmpty ? "$sId • " : ""}#$channel • $timeStr',
                                              style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                                            ),
                                          ],
                                        ),
                                      ),
                                      if (!isMe && sId.isNotEmpty)
                                        IconButton(
                                          icon: const Icon(Icons.chat_bubble_outline_rounded, color: Color(0xFF38BDF8), size: 18),
                                          tooltip: 'DM Student',
                                          onPressed: () => _openPrivateConversation(sId),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    (p['text'] ?? '').toString(),
                                    style: const TextStyle(color: Colors.white, fontSize: 13.5, height: 1.45),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    );
                  },
                ),
              ),
            ],
          ),

          // 2. 1-ON-1 DIRECT MESSAGES (LIVE LIST)
          StreamBuilder<List<Map<String, dynamic>>>(
            stream: _conversationsStream,
            builder: (context, snapshot) {
              final conversations = snapshot.data ?? [];

              return Column(
                children: [
                  // Top Search & Quick Connect Bar
                  Container(
                    padding: const EdgeInsets.all(12),
                    color: const Color(0xFF0F172A),
                    child: InkWell(
                      onTap: _startPrivateChat,
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: const Row(
                          children: [
                            Icon(Icons.search_rounded, color: Color(0xFF818CF8), size: 20),
                            SizedBox(width: 10),
                            Text('Enter Student ID to chat privately...', style: TextStyle(color: Colors.white54, fontSize: 13)),
                            Spacer(),
                            Icon(Icons.arrow_forward_ios_rounded, color: Colors.white38, size: 14),
                          ],
                        ),
                      ),
                    ),
                  ),

                  Expanded(
                    child: conversations.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(20),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF6366F1).withValues(alpha: 0.12),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.chat_bubble_outline_rounded, size: 48, color: Color(0xFF818CF8)),
                                  ),
                                  const SizedBox(height: 16),
                                  const Text('No Active Direct Chats', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                                  const SizedBox(height: 6),
                                  const Text(
                                    'Connect with batchmates and classmates by entering their VULMS Student ID to chat 1-on-1 in real-time.',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Colors.white60, fontSize: 12.5),
                                  ),
                                  const SizedBox(height: 18),
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: const Color(0xFF6366F1),
                                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    ),
                                    onPressed: _startPrivateChat,
                                    icon: const Icon(Icons.add_comment_rounded, color: Colors.white, size: 18),
                                    label: const Text('Start New Conversation', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : ListView.separated(
                            padding: const EdgeInsets.all(12),
                            itemCount: conversations.length,
                            separatorBuilder: (_, __) => const Divider(color: Color(0xFF1E293B), height: 1),
                            itemBuilder: (_, i) {
                              final c = conversations[i];
                              final pId = (c['partnerId'] ?? '').toString();
                              final pName = (c['partnerName'] ?? 'Student $pId').toString();
                              final lastMsg = (c['lastMessage'] ?? '').toString();
                              final timeStr = _formatTimestamp(c['lastTime']?.toString());

                              return ListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                leading: Stack(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: const Color(0xFF6366F1),
                                      radius: 24,
                                      child: Text(
                                        initialsFromName(pName),
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    Positioned(
                                      bottom: 0,
                                      right: 0,
                                      child: Container(
                                        width: 12,
                                        height: 12,
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF10B981),
                                          shape: BoxShape.circle,
                                          border: Border.all(color: const Color(0xFF0F172A), width: 2),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                title: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        pId,
                                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                                      ),
                                    ),
                                    Text(
                                      timeStr,
                                      style: const TextStyle(color: Colors.white38, fontSize: 11),
                                    ),
                                  ],
                                ),
                                subtitle: Text(
                                  lastMsg,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: Colors.white60, fontSize: 12.5),
                                ),
                                trailing: const Icon(Icons.chevron_right_rounded, color: Colors.white30, size: 20),
                                onTap: () => _openPrivateConversation(pId),
                              );
                            },
                          ),
                  ),
                ],
              );
            },
          ),

          // 3. CONNECTION REQUESTS (LIVE STREAM)
          StreamBuilder<List<Map<String, dynamic>>>(
            stream: _requestsStream,
            builder: (context, snapshot) {
              final pendingRequests = snapshot.data ?? [];

              if (pendingRequests.isEmpty) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.mark_email_read_outlined, size: 48, color: Colors.white24),
                      SizedBox(height: 12),
                      Text('No pending connection requests', style: TextStyle(color: Colors.white60, fontSize: 15)),
                      SizedBox(height: 6),
                      Text('Requests from students will appear here in real-time.', style: TextStyle(color: Colors.white38, fontSize: 12)),
                    ],
                  ),
                );
              }

              return ListView.builder(
                padding: const EdgeInsets.all(12),
                itemCount: pendingRequests.length,
                itemBuilder: (_, i) {
                  final req = pendingRequests[i];
                  return Card(
                    color: const Color(0xFF1E293B),
                    margin: const EdgeInsets.only(bottom: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14), side: const BorderSide(color: Color(0xFF334155))),
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          const CircleAvatar(
                            backgroundColor: Color(0xFF10B981),
                            child: Icon(Icons.person, color: Colors.white),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(req['from_name'] ?? 'Student', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                Text('ID: ${req['from_id']}', style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11)),
                                if (req['note'] != null && req['note'].toString().isNotEmpty)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 4),
                                    child: Text(req['note'].toString(), style: const TextStyle(color: Colors.white70, fontSize: 12)),
                                  ),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 28),
                            tooltip: 'Accept',
                            onPressed: () async {
                              await CommunityService.respondToRequest(req['id'], true);
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('Accepted connection from ${req['from_name']}!')),
                                );
                              }
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.cancel_rounded, color: Color(0xFFF43F5E), size: 28),
                            tooltip: 'Decline',
                            onPressed: () async {
                              await CommunityService.respondToRequest(req['id'], false);
                            },
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _channelChip(String id, String label) {
    final active = channel == id;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        selected: active,
        selectedColor: const Color(0xFF6366F1),
        backgroundColor: const Color(0xFF1E293B),
        label: Text(label, style: TextStyle(color: active ? Colors.white : Colors.white70, fontSize: 12, fontWeight: active ? FontWeight.bold : FontWeight.normal)),
        onSelected: (_) => _switchChannel(id),
      ),
    );
  }

  static String _formatTimestamp(String? iso) {
    if (iso == null || iso.isEmpty) return 'Just now';
    try {
      final dt = DateTime.parse(iso).toLocal();
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inSeconds < 60) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${dt.day}/${dt.month}';
    } catch (_) {
      return 'Recent';
    }
  }
}

class PrivateChatScreen extends StatefulWidget {
  final String myStudentId;
  final String myName;
  final String partnerId;
  final bool isAdmin;

  const PrivateChatScreen({
    super.key,
    required this.myStudentId,
    required this.myName,
    required this.partnerId,
    required this.isAdmin,
  });

  @override
  State<PrivateChatScreen> createState() => _PrivateChatScreenState();
}

class _PrivateChatScreenState extends State<PrivateChatScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  late Stream<List<Map<String, dynamic>>> _messagesStream;

  @override
  void initState() {
    super.initState();
    _messagesStream = CommunityService.streamPrivateMessages(widget.partnerId, widget.myStudentId);
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _send() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    _msgCtrl.clear();

    await CommunityService.sendPrivateMessage(
      senderId: widget.myStudentId,
      senderName: widget.myName,
      receiverId: widget.partnerId,
      text: text,
    );

    _scrollToBottom();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: const Color(0xFF6366F1),
              radius: 17,
              child: Text(
                widget.partnerId.length >= 2 ? widget.partnerId.substring(0, 2) : 'ST',
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(widget.partnerId, style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold)),
                  const Row(
                    children: [
                      Icon(Icons.circle, color: Color(0xFF10B981), size: 8),
                      SizedBox(width: 4),
                      Text('Live Student DM', style: TextStyle(color: Color(0xFF10B981), fontSize: 11)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<List<Map<String, dynamic>>>(
              stream: _messagesStream,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting && !snapshot.hasData) {
                  return const Center(child: CircularProgressIndicator(color: Color(0xFF6366F1)));
                }

                final messages = snapshot.data ?? [];
                if (messages.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.lock_clock_outlined, size: 44, color: Colors.white24),
                          const SizedBox(height: 12),
                          Text('Direct encrypted chat with ${widget.partnerId}', style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          const Text('Messages are delivered in real time. Say hello! 👋', style: TextStyle(color: Colors.white38, fontSize: 12)),
                        ],
                      ),
                    ),
                  );
                }

                _scrollToBottom();

                return ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  itemCount: messages.length,
                  itemBuilder: (_, i) {
                    final m = messages[i];
                    final isMe = (m['sender_id'] ?? '').toString().toUpperCase().trim() == widget.myStudentId.toUpperCase().trim();
                    final timeStr = _CommunityScreenState._formatTimestamp(m['created_at']?.toString());

                    return Align(
                      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: isMe ? const Color(0xFF6366F1) : const Color(0xFF1E293B),
                          borderRadius: BorderRadius.only(
                            topLeft: const Radius.circular(16),
                            topRight: const Radius.circular(16),
                            bottomLeft: isMe ? const Radius.circular(16) : const Radius.circular(4),
                            bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(16),
                          ),
                          border: isMe ? null : Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Column(
                          crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                          children: [
                            Text(
                              (m['text'] ?? '').toString(),
                              style: const TextStyle(color: Colors.white, fontSize: 13.5, height: 1.35),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(timeStr, style: TextStyle(color: isMe ? Colors.white70 : Colors.white38, fontSize: 10)),
                                if (isMe) ...[
                                  const SizedBox(width: 4),
                                  const Icon(Icons.done_all_rounded, color: Colors.white70, size: 12),
                                ],
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            color: const Color(0xFF0F172A),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                      decoration: InputDecoration(
                        hintText: 'Type a message to ${widget.partnerId}...',
                        hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
                        filled: true,
                        fillColor: const Color(0xFF1E293B),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: (_) => _send(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  InkWell(
                    onTap: _send,
                    borderRadius: BorderRadius.circular(24),
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: Color(0xFF6366F1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
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
}
