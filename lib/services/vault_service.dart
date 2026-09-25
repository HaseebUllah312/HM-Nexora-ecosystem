import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'nexora_cloud_service.dart';
import 'account_service.dart';
import 'supabase_service.dart';

class VaultItem {
  final String id;
  final String title;
  final String type;
  final String course;
  final String? url;
  final String source;
  final DateTime createdAt;
  VaultItem({required this.id, required this.title, required this.type, required this.course, this.url, required this.source, required this.createdAt});
  Map<String,dynamic> toJson()=>{'id':id,'title':title,'type':type,'course':course,'url':url,'source':source,'createdAt':createdAt.toIso8601String()};
  factory VaultItem.fromJson(Map<String,dynamic> j)=>VaultItem(id:(j['id']??'').toString(),title:(j['title']??j['type']??'Saved item').toString(),type:(j['type']??'item').toString(),course:(j['course']??j['course_code']??'').toString(),url:j['url']?.toString(),source:(j['source']??'local').toString(),createdAt:DateTime.tryParse((j['createdAt']??j['created_at']??'').toString())??DateTime.now());
}

class VaultService {
  VaultService._();
  static final VaultService instance=VaultService._();
  static const key='hmn_vault_items_v2';

  Future<List<VaultItem>> load() async {
    final p=await SharedPreferences.getInstance();
    final items=<VaultItem>[];
    final raw=p.getString(key);
    if(raw!=null){try{items.addAll((jsonDecode(raw) as List).map((e)=>VaultItem.fromJson(Map<String,dynamic>.from(e))));}catch(_){}}
    final nxRaw=p.getString('nxSaved');
    if(nxRaw!=null){try{items.addAll((jsonDecode(nxRaw) as List).map((e)=>VaultItem.fromJson(Map<String,dynamic>.from(e))));}catch(_){}}
    try{
      final cloudService=NexoraCloudService();
      final profile=await AccountService.instance.loadProfile();
      final sid=(profile['studentId']??'').toString().trim();
      final uid=SupabaseService.client?.auth.currentUser?.id??'local';
      final cloudId=sid.isNotEmpty?sid:'APP-${uid.substring(0,uid.length>18?18:uid.length)}';
      await cloudService.ensureSession(studentId:cloudId,displayName:(profile['name']??'Student').toString());
      final cloud=await cloudService.saved();
      for(final e in cloud){if(e is Map) items.add(VaultItem.fromJson({...Map<String,dynamic>.from(e),'source':'cloud'}));}
    }catch(_){}
    final seen=<String>{};
    return items.where((e)=>seen.add(e.id.isNotEmpty?e.id:'${e.title}|${e.url}|${e.course}')).toList()..sort((a,b)=>b.createdAt.compareTo(a.createdAt));
  }

  Future<void> save(VaultItem item) async {
    final p=await SharedPreferences.getInstance();
    final current=await load();
    final local=current.where((e)=>e.source!='cloud').toList();
    local.removeWhere((e)=>e.id==item.id);
    local.insert(0,item);
    await p.setString(key,jsonEncode(local.map((e)=>e.toJson()).toList()));
  }

  Future<void> remove(String id) async {
    final p=await SharedPreferences.getInstance();
    final current=await load();
    final local=current.where((e)=>e.source!='cloud'&&e.id!=id).toList();
    await p.setString(key,jsonEncode(local.map((e)=>e.toJson()).toList()));
  }
}
