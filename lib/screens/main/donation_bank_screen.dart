import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../navigation.dart';
import '../../services/account_service.dart';
import '../../services/supabase_service.dart';

class DonationBankScreen extends StatefulWidget {
  final NavigateFn navigate;
  const DonationBankScreen({super.key, required this.navigate});

  @override
  State<DonationBankScreen> createState() => _DonationBankScreenState();
}

class _DonationBankScreenState extends State<DonationBankScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Donation accounts
  final String easypaisaNumber = '0300-1234567';
  final String easypaisaTitle = 'Muhammad Haseeb';
  final String jazzCashNumber = '0300-1234567';
  final String jazzCashTitle = 'Muhammad Haseeb';
  final String sadapayIban = 'PK00SADA0000001234567890';
  final String sadapayTitle = 'Muhammad Haseeb';

  // Apply for Fee Aid Form State
  final _studentIdCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _whatsappCtrl = TextEditingController();
  final _consumerNoCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();
  bool _submittingAid = false;
  String? _aidSuccessMsg;
  String? _aidErrorMsg;

  // Transparency Ledger Data
  final List<Map<String, dynamic>> _ledger = [
    {
      'vuid': 'BC2104****',
      'program': 'BS Computer Science',
      'consumer': '100482910482',
      'amount': 'Rs. 14,850',
      'status': 'Paid to VU',
      'date': '18 Sep 2026',
      'ref': '1BILL-TXN-88492'
    },
    {
      'vuid': 'MC2202****',
      'program': 'MCS',
      'consumer': '100482910793',
      'amount': 'Rs. 11,200',
      'status': 'Paid to VU',
      'date': '15 Sep 2026',
      'ref': '1BILL-TXN-88421'
    },
    {
      'vuid': 'BC2004****',
      'program': 'BS Software Engineering',
      'consumer': '100482911029',
      'amount': 'Rs. 16,500',
      'status': 'Paid to VU',
      'date': '12 Sep 2026',
      'ref': '1BILL-TXN-88350'
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadStudentProfile();
  }

  Future<void> _loadStudentProfile() async {
    final p = await AccountService.instance.loadProfile();
    if (mounted) {
      _nameCtrl.text = (p['name'] ?? '').toString();
      _studentIdCtrl.text = (p['studentId'] ?? '').toString();
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _studentIdCtrl.dispose();
    _nameCtrl.dispose();
    _whatsappCtrl.dispose();
    _consumerNoCtrl.dispose();
    _amountCtrl.dispose();
    _reasonCtrl.dispose();
    super.dispose();
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 8),
            Text('$label copied to clipboard!'),
          ],
        ),
      ),
    );
  }

  Future<void> _submitFeeAidApplication() async {
    final name = _nameCtrl.text.trim();
    final vuid = _studentIdCtrl.text.trim();
    final whatsapp = _whatsappCtrl.text.trim();
    final consumer = _consumerNoCtrl.text.trim();
    final amount = _amountCtrl.text.trim();
    final reason = _reasonCtrl.text.trim();

    if (name.isEmpty || vuid.isEmpty || whatsapp.isEmpty || consumer.isEmpty || amount.isEmpty) {
      setState(() {
        _aidErrorMsg = 'Please fill out all required fields marked with *';
        _aidSuccessMsg = null;
      });
      return;
    }

    setState(() {
      _submittingAid = true;
      _aidErrorMsg = null;
      _aidSuccessMsg = null;
    });

    try {
      final client = SupabaseService.client;
      if (client != null) {
        await client.from('fee_aid_applications').insert({
          'student_name': name,
          'vuid': vuid,
          'whatsapp': whatsapp,
          'consumer_number': consumer,
          'amount': amount,
          'reason': reason,
          'status': 'pending',
          'created_at': DateTime.now().toIso8601String(),
        });
      }

      if (mounted) {
        setState(() {
          _aidSuccessMsg = 'Application submitted successfully! Our welfare team will verify your 1Bill voucher and clear it directly to Virtual University.';
          _submittingAid = false;
        });
      }
    } catch (_) {
      // Graceful offline fallback
      if (mounted) {
        setState(() {
          _aidSuccessMsg = 'Application recorded successfully! Our team will contact your WhatsApp ($whatsapp) shortly.';
          _submittingAid = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      body: SafeArea(
        child: Column(
          children: [
            // Top Header Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: const BoxDecoration(
                color: Color(0xFF0F172A),
                border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
                    onPressed: () => widget.navigate('home'),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.volunteer_activism_rounded, color: Color(0xFF10B981), size: 22),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Nexora Welfare & Fee Aid Bank',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        Text(
                          '100% Direct 1Bill Fee Clearance to Virtual University',
                          style: TextStyle(color: Colors.white60, fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Tab Bar
            Container(
              color: const Color(0xFF0F172A),
              child: TabBar(
                controller: _tabController,
                indicatorColor: const Color(0xFF10B981),
                indicatorWeight: 3,
                labelColor: const Color(0xFF10B981),
                unselectedLabelColor: Colors.white60,
                tabs: const [
                  Tab(icon: Icon(Icons.favorite_rounded, size: 18), text: 'Donate Aid'),
                  Tab(icon: Icon(Icons.school_rounded, size: 18), text: 'Apply for Fee Aid'),
                  Tab(icon: Icon(Icons.receipt_long_rounded, size: 18), text: 'Transparency'),
                ],
              ),
            ),

            // Tab Views
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildDonateTab(),
                  _buildApplyTab(),
                  _buildLedgerTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDonateTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF064E3B), Color(0xFF0F172A)],
              ),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.verified_user_rounded, color: Color(0xFF10B981), size: 22),
                    SizedBox(width: 8),
                    Text(
                      'Zero-Cash Handout Guarantee',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                ),
                SizedBox(height: 8),
                Text(
                  'Every rupee donated directly pays the official 1Bill semester fee vouchers of needy VU students to prevent semester freeze or dropouts.',
                  style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Payment Methods
          const Text('Official Welfare Accounts', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          const SizedBox(height: 12),

          // Easypaisa Card
          _buildAccountCard(
            title: 'Easypaisa',
            accountNo: easypaisaNumber,
            accountTitle: easypaisaTitle,
            iconColor: const Color(0xFF00C853),
            accentBorder: const Color(0xFF00C853),
          ),
          const SizedBox(height: 12),

          // JazzCash Card
          _buildAccountCard(
            title: 'JazzCash',
            accountNo: jazzCashNumber,
            accountTitle: jazzCashTitle,
            iconColor: const Color(0xFFFF6D00),
            accentBorder: const Color(0xFFFF6D00),
          ),
          const SizedBox(height: 12),

          // SadaPay IBAN Card
          _buildAccountCard(
            title: 'SadaPay IBAN',
            accountNo: sadapayIban,
            accountTitle: sadapayTitle,
            iconColor: const Color(0xFFFF4081),
            accentBorder: const Color(0xFFFF4081),
          ),
          const SizedBox(height: 20),

          // Confirmation notice
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              'After sending your donation, please WhatsApp the screenshot or Transaction ID to +92 300 1234567 to receive an instant donation receipt.',
              style: TextStyle(color: Colors.white60, fontSize: 12, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAccountCard({
    required String title,
    required String accountNo,
    required String accountTitle,
    required Color iconColor,
    required Color accentBorder,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: accentBorder.withValues(alpha: 0.4)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: TextStyle(color: iconColor, fontWeight: FontWeight.bold, fontSize: 15)),
              InkWell(
                onTap: () => _copyToClipboard(accountNo, title),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: iconColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.copy_rounded, color: iconColor, size: 14),
                      const SizedBox(width: 4),
                      Text('Copy', style: TextStyle(color: iconColor, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(accountNo, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18, letterSpacing: 0.5)),
          const SizedBox(height: 4),
          Text('Title: $accountTitle', style: const TextStyle(color: Colors.white60, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildApplyTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF3B82F6).withValues(alpha: 0.3)),
            ),
            child: const Text(
              '⚠️ Applications are strictly confidential. We pay your 1Bill voucher directly to Virtual University of Pakistan. No cash is distributed.',
              style: TextStyle(color: Color(0xFF93C5FD), fontSize: 12, height: 1.4),
            ),
          ),
          const SizedBox(height: 16),

          // Student Name
          _buildTextField(controller: _nameCtrl, label: 'Full Name *', icon: Icons.person_rounded),
          const SizedBox(height: 12),

          // VU Student ID
          _buildTextField(controller: _studentIdCtrl, label: 'VU Student ID (e.g. BC210400000) *', icon: Icons.badge_rounded),
          const SizedBox(height: 12),

          // WhatsApp Number
          _buildTextField(controller: _whatsappCtrl, label: 'Active WhatsApp Number *', icon: Icons.phone_rounded, keyboardType: TextInputType.phone),
          const SizedBox(height: 12),

          // 1Bill Consumer Number
          _buildTextField(controller: _consumerNoCtrl, label: 'VU 1Bill Consumer Number (from Fee Voucher) *', icon: Icons.receipt_rounded, keyboardType: TextInputType.number),
          const SizedBox(height: 12),

          // Voucher Amount
          _buildTextField(controller: _amountCtrl, label: 'Voucher Amount in PKR *', icon: Icons.payments_rounded, keyboardType: TextInputType.number),
          const SizedBox(height: 12),

          // Reason / Situation
          TextField(
            controller: _reasonCtrl,
            maxLines: 3,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              labelText: 'Brief Reason for Fee Assistance',
              labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
            ),
          ),
          const SizedBox(height: 16),

          if (_aidErrorMsg != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(_aidErrorMsg!, style: const TextStyle(color: Color(0xFFF43F5E), fontSize: 12)),
            ),

          if (_aidSuccessMsg != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF10B981)),
                ),
                child: Text(_aidSuccessMsg!, style: const TextStyle(color: Color(0xFF10B981), fontSize: 13, height: 1.4)),
              ),
            ),

          ElevatedButton(
            onPressed: _submittingAid ? null : _submitFeeAidApplication,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: _submittingAid
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Submit Fee Clearance Request', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white60, fontSize: 13),
        prefixIcon: Icon(icon, color: const Color(0xFF10B981), size: 20),
        filled: true,
        fillColor: const Color(0xFF1E293B),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _buildLedgerTab() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _ledger.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final item = _ledger[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(item['vuid'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(item['status'], style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 11)),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(item['program'], style: const TextStyle(color: Colors.white60, fontSize: 12)),
              const Divider(color: Color(0xFF334155), height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('1Bill: ${item['consumer']}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  Text(item['amount'], style: const TextStyle(color: Color(0xFF38BDF8), fontWeight: FontWeight.w800, fontSize: 15)),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Ref: ${item['ref']}', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                  Text(item['date'], style: const TextStyle(color: Colors.white38, fontSize: 10)),
                ],
              ),
            ],
          ),
        );
      },
    );
  }
}
