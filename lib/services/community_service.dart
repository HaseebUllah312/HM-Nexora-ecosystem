import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';

class CommunityService {
  static const String _localRequestsKey = 'nx_connection_requests';
  static const String _localPrivateChatsKey = 'nx_private_chats';

  // --- PUBLIC COMMUNITY POSTS & MESSAGES (UNIFIED CROSS-PLATFORM) ---

  static Future<List<Map<String, dynamic>>> getPosts({String channel = 'general'}) async {
    final cleanChannel = channel.toLowerCase().trim();
    final upperCode = channel.toUpperCase().trim();
    List<Map<String, dynamic>> remotePosts = [];
    try {
      final client = SupabaseService.client;
      if (client != null) {
        // 1. Primary: query unified community_messages
        try {
          final res = await client
              .from('community_messages')
              .select()
              .or('course_code.eq.$upperCode,course_code.eq.$cleanChannel,channel.eq.$upperCode,channel.eq.$cleanChannel')
              .order('created_at', ascending: false)
              .limit(60);
          if (res.isNotEmpty) {
            remotePosts = List<Map<String, dynamic>>.from(res).map((m) => {
              'id': m['id'] ?? 'msg_${DateTime.now().millisecondsSinceEpoch}',
              'channel': (m['course_code'] ?? m['channel'] ?? cleanChannel).toString().toLowerCase(),
              'course_code': (m['course_code'] ?? upperCode).toString().toUpperCase(),
              'text': m['text'] ?? '',
              'display_name': m['display_name'] ?? m['author_name'] ?? 'Student',
              'student_id': m['student_id'] ?? m['user_id'] ?? '',
              'user_id': m['user_id'] ?? m['student_id'] ?? '',
              'created_at': m['created_at'] ?? DateTime.now().toIso8601String(),
            }).toList();
          }
        } catch (_) {}

        // 2. Fallback: query legacy community_posts if messages was empty
        if (remotePosts.isEmpty) {
          final res2 = await client
              .from('community_posts')
              .select()
              .eq('channel', cleanChannel)
              .order('created_at', ascending: false)
              .limit(60);
          if (res2.isNotEmpty) {
            remotePosts = List<Map<String, dynamic>>.from(res2);
          }
        }
      }
    } catch (e) {
      debugPrint('[CommunityService getPosts error]: $e');
    }

    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('nx_posts_$cleanChannel');
    List<Map<String, dynamic>> localPosts = [];
    if (raw != null) {
      try {
        localPosts = List<Map<String, dynamic>>.from(jsonDecode(raw));
      } catch (_) {}
    }

    if (remotePosts.isNotEmpty) {
      final seen = <String>{};
      final merged = <Map<String, dynamic>>[];
      for (final p in remotePosts) {
        final id = (p['id'] ?? p['created_at']).toString();
        if (seen.add(id)) merged.add(p);
      }
      for (final p in localPosts) {
        final id = (p['id'] ?? p['created_at']).toString();
        if (seen.add(id)) merged.add(p);
      }
      await prefs.setString('nx_posts_$cleanChannel', jsonEncode(merged.take(60).toList()));
      return merged;
    }

    return localPosts;
  }

  /// Live Stream of Public Posts with Realtime and Polling Fallback
  static Stream<List<Map<String, dynamic>>> streamPosts(String channel) {
    late StreamController<List<Map<String, dynamic>>> controller;
    Timer? timer;
    RealtimeChannel? rtChannelMessages;
    RealtimeChannel? rtChannelPosts;

    controller = StreamController<List<Map<String, dynamic>>>.broadcast(
      onListen: () {
        getPosts(channel: channel).then((p) {
          if (!controller.isClosed) controller.add(p);
        });

        try {
          final client = SupabaseService.client;
          if (client != null) {
            // Subscribe to community_messages for cross-platform realtime
            rtChannelMessages = client.channel('public:community_messages:${channel.toUpperCase()}')
              ..onPostgresChanges(
                event: PostgresChangeEvent.all,
                schema: 'public',
                table: 'community_messages',
                callback: (_) {
                  getPosts(channel: channel).then((p) {
                    if (!controller.isClosed) controller.add(p);
                  });
                },
              )
              ..subscribe();

            // Subscribe to community_posts legacy table
            rtChannelPosts = client.channel('public:community_posts:${channel.toLowerCase()}')
              ..onPostgresChanges(
                event: PostgresChangeEvent.all,
                schema: 'public',
                table: 'community_posts',
                callback: (_) {
                  getPosts(channel: channel).then((p) {
                    if (!controller.isClosed) controller.add(p);
                  });
                },
              )
              ..subscribe();
          }
        } catch (_) {}

        timer = Timer.periodic(const Duration(seconds: 4), (_) async {
          final p = await getPosts(channel: channel);
          if (!controller.isClosed) controller.add(p);
        });
      },
      onCancel: () {
        timer?.cancel();
        try {
          final client = SupabaseService.client;
          if (client != null) {
            if (rtChannelMessages != null) client.removeChannel(rtChannelMessages!);
            if (rtChannelPosts != null) client.removeChannel(rtChannelPosts!);
          }
        } catch (_) {}
        controller.close();
      },
    );

    return controller.stream;
  }

  static Future<void> createPost({
    required String channel,
    required String text,
    required String displayName,
    required String studentId,
  }) async {
    final cleanChannel = channel.toLowerCase().trim();
    final upperCode = channel.toUpperCase().trim();
    final idStr = 'msg_${DateTime.now().millisecondsSinceEpoch}';
    final nowIso = DateTime.now().toIso8601String();

    final unifiedMsg = {
      'id': idStr,
      'course_code': upperCode,
      'channel': upperCode,
      'text': text,
      'display_name': displayName,
      'student_id': studentId.toUpperCase().trim(),
      'user_id': studentId.toUpperCase().trim(),
      'created_at': nowIso,
    };

    final legacyPost = {
      'id': idStr,
      'channel': cleanChannel,
      'text': text,
      'display_name': displayName,
      'student_id': studentId.toUpperCase().trim(),
      'created_at': nowIso,
    };

    try {
      final client = SupabaseService.client;
      if (client != null) {
        // 1. Insert into unified community_messages table (syncs with Web & Extension)
        try {
          await client.from('community_messages').insert(unifiedMsg);
        } catch (e) {
          debugPrint('[CommunityService createPost unified insert error]: $e');
        }

        // 2. Also insert into legacy community_posts
        try {
          await client.from('community_posts').insert(legacyPost);
        } catch (_) {}
      }
    } catch (e) {
      debugPrint('[CommunityService createPost remote insert]: $e');
    }

    final prefs = await SharedPreferences.getInstance();
    final current = await getPosts(channel: cleanChannel);
    current.insert(0, unifiedMsg);
    await prefs.setString('nx_posts_$cleanChannel', jsonEncode(current));
  }

  static Future<void> deletePost(String postId, String channel) async {
    final cleanChannel = channel.toLowerCase().trim();
    try {
      final client = SupabaseService.client;
      if (client != null) {
        try {
          await client.from('community_messages').delete().eq('id', postId);
        } catch (_) {}
        try {
          await client.from('community_posts').delete().eq('id', postId);
        } catch (_) {}
      }
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    final current = await getPosts(channel: cleanChannel);
    current.removeWhere((p) => p['id'] == postId);
    await prefs.setString('nx_posts_$cleanChannel', jsonEncode(current));
  }

  // --- PRIVATE 1-ON-1 DIRECT MESSAGING & REQUEST WORKFLOW ---

  static Future<bool> sendConnectionRequest({
    required String targetStudentId,
    required String myStudentId,
    required String myName,
    required String note,
    bool isAdmin = false,
  }) async {
    final req = {
      'id': 'REQ-${DateTime.now().millisecondsSinceEpoch}',
      'from_id': myStudentId.toUpperCase().trim(),
      'from_name': myName,
      'to_id': targetStudentId.toUpperCase().trim(),
      'note': note,
      'status': isAdmin ? 'accepted' : 'pending',
      'created_at': DateTime.now().toIso8601String(),
    };

    final prefs = await SharedPreferences.getInstance();
    final allReqs = await getAllRequests();
    allReqs.insert(0, req);
    await prefs.setString(_localRequestsKey, jsonEncode(allReqs));

    try {
      final client = SupabaseService.client;
      if (client != null) {
        await client.from('connection_requests').insert(req);
      }
    } catch (e) {
      debugPrint('[sendConnectionRequest error]: $e');
    }

    return true;
  }

  static Future<List<Map<String, dynamic>>> getAllRequests() async {
    List<Map<String, dynamic>> remoteReqs = [];
    try {
      final client = SupabaseService.client;
      if (client != null) {
        final res = await client
            .from('connection_requests')
            .select()
            .order('created_at', ascending: false)
            .limit(50);
        remoteReqs = List<Map<String, dynamic>>.from(res);
      }
    } catch (_) {}

    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_localRequestsKey);
    List<Map<String, dynamic>> localReqs = [];
    if (raw != null) {
      try {
        localReqs = List<Map<String, dynamic>>.from(jsonDecode(raw));
      } catch (_) {}
    }

    if (remoteReqs.isNotEmpty) {
      final seen = <String>{};
      final merged = <Map<String, dynamic>>[];
      for (final r in remoteReqs) {
        final id = (r['id'] ?? r['created_at']).toString();
        if (seen.add(id)) merged.add(r);
      }
      for (final r in localReqs) {
        final id = (r['id'] ?? r['created_at']).toString();
        if (seen.add(id)) merged.add(r);
      }
      await prefs.setString(_localRequestsKey, jsonEncode(merged));
      return merged;
    }

    return localReqs;
  }

  static Future<List<Map<String, dynamic>>> getPendingRequests(String myStudentId) async {
    final all = await getAllRequests();
    final myCleanId = myStudentId.toUpperCase().trim();
    return all.where((r) => (r['to_id'] ?? '').toString().toUpperCase().trim() == myCleanId && r['status'] == 'pending').toList();
  }

  /// Live Stream of Pending Requests for real-time badge updates
  static Stream<List<Map<String, dynamic>>> streamPendingRequests(String myStudentId) {
    late StreamController<List<Map<String, dynamic>>> controller;
    Timer? timer;
    RealtimeChannel? rtChannel;

    controller = StreamController<List<Map<String, dynamic>>>.broadcast(
      onListen: () {
        getPendingRequests(myStudentId).then((r) {
          if (!controller.isClosed) controller.add(r);
        });

        try {
          final client = SupabaseService.client;
          if (client != null) {
            rtChannel = client.channel('public:connection_requests')
              ..onPostgresChanges(
                event: PostgresChangeEvent.all,
                schema: 'public',
                table: 'connection_requests',
                callback: (_) {
                  getPendingRequests(myStudentId).then((r) {
                    if (!controller.isClosed) controller.add(r);
                  });
                },
              )
              ..subscribe();
          }
        } catch (_) {}

        timer = Timer.periodic(const Duration(seconds: 4), (_) async {
          final r = await getPendingRequests(myStudentId);
          if (!controller.isClosed) controller.add(r);
        });
      },
      onCancel: () {
        timer?.cancel();
        try {
          final client = SupabaseService.client;
          if (client != null && rtChannel != null) {
            client.removeChannel(rtChannel!);
          }
        } catch (_) {}
        controller.close();
      },
    );

    return controller.stream;
  }

  static Future<void> respondToRequest(String requestId, bool accept) async {
    final prefs = await SharedPreferences.getInstance();
    final all = await getAllRequests();
    for (var r in all) {
      if (r['id'] == requestId) {
        r['status'] = accept ? 'accepted' : 'declined';
        break;
      }
    }
    await prefs.setString(_localRequestsKey, jsonEncode(all));

    try {
      final client = SupabaseService.client;
      if (client != null) {
        await client
            .from('connection_requests')
            .update({'status': accept ? 'accepted' : 'declined'})
            .eq('id', requestId);
      }
    } catch (_) {}
  }

  static Future<bool> isConnected(String myStudentId, String otherStudentId, {bool isAdmin = false}) async {
    if (isAdmin) return true;
    final all = await getAllRequests();
    final a = myStudentId.toUpperCase().trim();
    final b = otherStudentId.toUpperCase().trim();
    return all.any((r) =>
        r['status'] == 'accepted' &&
        (((r['from_id'] ?? '').toString().toUpperCase().trim() == a && (r['to_id'] ?? '').toString().toUpperCase().trim() == b) ||
         ((r['from_id'] ?? '').toString().toUpperCase().trim() == b && (r['to_id'] ?? '').toString().toUpperCase().trim() == a)));
  }

  // --- PRIVATE 1-ON-1 MESSAGES ---

  static Future<List<Map<String, dynamic>>> getPrivateMessages(String chatPartnerId, String myStudentId) async {
    final a = myStudentId.toUpperCase().trim();
    final b = chatPartnerId.toUpperCase().trim();
    List<Map<String, dynamic>> remoteMsgs = [];

    try {
      final client = SupabaseService.client;
      if (client != null) {
        final res = await client
            .from('private_messages')
            .select()
            .or('and(sender_id.eq.$a,receiver_id.eq.$b),and(sender_id.eq.$b,receiver_id.eq.$a)')
            .order('created_at', ascending: true)
            .limit(100);
        remoteMsgs = List<Map<String, dynamic>>.from(res);
      }
    } catch (e) {
      debugPrint('[getPrivateMessages remote error]: $e');
    }

    final prefs = await SharedPreferences.getInstance();
    final key = '${_localPrivateChatsKey}_${_chatId(a, b)}';
    final raw = prefs.getString(key);
    List<Map<String, dynamic>> localMsgs = [];
    if (raw != null) {
      try {
        localMsgs = List<Map<String, dynamic>>.from(jsonDecode(raw));
      } catch (_) {}
    }

    if (remoteMsgs.isNotEmpty) {
      final seen = <String>{};
      final merged = <Map<String, dynamic>>[];
      for (final m in remoteMsgs) {
        final id = (m['id'] ?? m['created_at']).toString();
        if (seen.add(id)) merged.add(m);
      }
      for (final m in localMsgs) {
        final id = (m['id'] ?? m['created_at']).toString();
        if (seen.add(id)) merged.add(m);
      }
      merged.sort((m1, m2) => (m1['created_at'] ?? '').toString().compareTo((m2['created_at'] ?? '').toString()));
      await prefs.setString(key, jsonEncode(merged));
      return merged;
    }

    return localMsgs;
  }

  /// Live Stream of Private Messages between two students (Realtime + 2.5s Polling fallback)
  static Stream<List<Map<String, dynamic>>> streamPrivateMessages(String chatPartnerId, String myStudentId) {
    late StreamController<List<Map<String, dynamic>>> controller;
    Timer? timer;
    RealtimeChannel? rtChannel;

    controller = StreamController<List<Map<String, dynamic>>>.broadcast(
      onListen: () {
        getPrivateMessages(chatPartnerId, myStudentId).then((msgs) {
          if (!controller.isClosed) controller.add(msgs);
        });

        try {
          final client = SupabaseService.client;
          if (client != null) {
            rtChannel = client.channel('public:private_messages:${_chatId(myStudentId, chatPartnerId)}')
              ..onPostgresChanges(
                event: PostgresChangeEvent.all,
                schema: 'public',
                table: 'private_messages',
                callback: (_) {
                  getPrivateMessages(chatPartnerId, myStudentId).then((msgs) {
                    if (!controller.isClosed) controller.add(msgs);
                  });
                },
              )
              ..subscribe();
          }
        } catch (_) {}

        timer = Timer.periodic(const Duration(milliseconds: 2500), (_) async {
          final msgs = await getPrivateMessages(chatPartnerId, myStudentId);
          if (!controller.isClosed) controller.add(msgs);
        });
      },
      onCancel: () {
        timer?.cancel();
        try {
          final client = SupabaseService.client;
          if (client != null && rtChannel != null) {
            client.removeChannel(rtChannel!);
          }
        } catch (_) {}
        controller.close();
      },
    );

    return controller.stream;
  }

  static Future<void> sendPrivateMessage({
    required String senderId,
    required String senderName,
    required String receiverId,
    required String text,
  }) async {
    final sId = senderId.toUpperCase().trim();
    final rId = receiverId.toUpperCase().trim();

    final msg = {
      'id': 'MSG-${DateTime.now().millisecondsSinceEpoch}',
      'sender_id': sId,
      'sender_name': senderName,
      'receiver_id': rId,
      'text': text,
      'created_at': DateTime.now().toIso8601String(),
    };

    final prefs = await SharedPreferences.getInstance();
    final key = '${_localPrivateChatsKey}_${_chatId(sId, rId)}';
    final current = await getPrivateMessages(rId, sId);
    current.add(msg);
    await prefs.setString(key, jsonEncode(current));

    try {
      final client = SupabaseService.client;
      if (client != null) {
        await client.from('private_messages').insert(msg);
      }
    } catch (e) {
      debugPrint('[sendPrivateMessage remote error]: $e');
    }
  }

  /// Get list of all recent conversations with students
  static Future<List<Map<String, dynamic>>> getRecentConversations(String myStudentId) async {
    final myId = myStudentId.toUpperCase().trim();
    final requests = await getAllRequests();
    final Set<String> partnerIds = {};

    for (final r in requests) {
      final from = (r['from_id'] ?? '').toString().toUpperCase().trim();
      final to = (r['to_id'] ?? '').toString().toUpperCase().trim();
      if (from == myId && to.isNotEmpty && to != myId) partnerIds.add(to);
      if (to == myId && from.isNotEmpty && from != myId) partnerIds.add(from);
    }

    try {
      final client = SupabaseService.client;
      if (client != null) {
        final res = await client
            .from('private_messages')
            .select('sender_id, receiver_id')
            .or('sender_id.eq.$myId,receiver_id.eq.$myId')
            .limit(100);
        for (final row in res) {
          final s = (row['sender_id'] ?? '').toString().toUpperCase().trim();
          final r = (row['receiver_id'] ?? '').toString().toUpperCase().trim();
          if (s == myId && r.isNotEmpty && r != myId) partnerIds.add(r);
          if (r == myId && s.isNotEmpty && s != myId) partnerIds.add(s);
        }
      }
    } catch (_) {}

    final List<Map<String, dynamic>> conversations = [];
    for (final pid in partnerIds) {
      final msgs = await getPrivateMessages(pid, myId);
      final lastMsg = msgs.isNotEmpty ? msgs.last : null;
      conversations.add({
        'partnerId': pid,
        'partnerName': lastMsg?['sender_id'] == pid ? (lastMsg?['sender_name'] ?? 'Student $pid') : 'Student $pid',
        'lastMessage': lastMsg?['text'] ?? 'Tap to chat',
        'lastTime': lastMsg?['created_at'] ?? '',
        'messageCount': msgs.length,
      });
    }

    conversations.sort((a, b) => (b['lastTime'] ?? '').toString().compareTo((a['lastTime'] ?? '').toString()));
    return conversations;
  }

  static Stream<List<Map<String, dynamic>>> streamRecentConversations(String myStudentId) {
    late StreamController<List<Map<String, dynamic>>> controller;
    Timer? timer;

    controller = StreamController<List<Map<String, dynamic>>>.broadcast(
      onListen: () {
        getRecentConversations(myStudentId).then((c) {
          if (!controller.isClosed) controller.add(c);
        });
        timer = Timer.periodic(const Duration(seconds: 4), (_) async {
          final c = await getRecentConversations(myStudentId);
          if (!controller.isClosed) controller.add(c);
        });
      },
      onCancel: () {
        timer?.cancel();
        controller.close();
      },
    );

    return controller.stream;
  }

  static String _chatId(String a, String b) {
    final list = [a.toUpperCase().trim(), b.toUpperCase().trim()]..sort();
    return list.join('_');
  }
}
