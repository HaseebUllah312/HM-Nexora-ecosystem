import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../navigation.dart';
import '../../services/nexora_api_service.dart';

class CppCompilerScreen extends StatefulWidget {
  final NavigateFn? navigate;
  const CppCompilerScreen({super.key, this.navigate});

  @override
  State<CppCompilerScreen> createState() => _CppCompilerScreenState();
}

class _CppCompilerScreenState extends State<CppCompilerScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _codeController = TextEditingController();
  final TextEditingController _stdinController = TextEditingController();

  bool _isCompiling = false;
  bool _isAiDiagnosing = false;
  bool _offlineMode = false;
  String _terminalOutput = 'Click "Run Code" to compile and run your C++ program.';
  bool _lastRunSuccess = true;
  String _executionTime = '0ms';
  String _memoryUsage = '0 MB';
  Map<String, dynamic>? _aiReport;

  final List<String> _quickSymbols = [
    '{', '}', '(', ')', ';', '<', '>', '"', "'", '=', '+', '-', '*', '/',
    '&', 'cout', 'cin', '<<', '>>', 'endl', 'int', 'return 0;',
  ];

  static const String _defaultCppCode = '''#include <iostream>
using namespace std;

int main() {
    cout << "⚡ Hello from HM Nexora C++20 Cloud Studio!" << endl;
    cout << "Virtual University of Pakistan" << endl;
    
    int a = 15, b = 25;
    cout << "Result: " << a << " + " << b << " = " << (a + b) << endl;
    
    return 0;
}
''';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _codeController.text = _defaultCppCode;
  }

  @override
  void dispose() {
    _tabController.dispose();
    _codeController.dispose();
    _stdinController.dispose();
    super.dispose();
  }

  void _insertSymbol(String sym) {
    final text = _codeController.text;
    final selection = _codeController.selection;
    final start = selection.start >= 0 ? selection.start : text.length;
    final end = selection.end >= 0 ? selection.end : text.length;
    final newText = text.replaceRange(start, end, sym);
    _codeController.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: start + sym.length),
    );
  }

  Future<void> _runCode() async {
    final code = _codeController.text.trim();
    if (code.isEmpty) return;

    setState(() {
      _isCompiling = true;
      _terminalOutput = _offlineMode
          ? 'Compiling in Local Embedded Offline Engine...\n'
          : 'Compiling C++20 code in Cloud Sandbox...\n';
    });
    _tabController.animateTo(1); // Switch to Terminal Tab

    try {
      final res = await NexoraApiService.compileCpp(
        code: code,
        stdin: _stdinController.text,
        forceOffline: _offlineMode,
      );

      final success = res['success'] == true;
      final out = (res['output'] ?? res['stdout'] ?? res['stderr'] ?? '').toString();

      setState(() {
        _isCompiling = false;
        _lastRunSuccess = success;
        _terminalOutput = out.isNotEmpty ? out : '[Program finished with exit code 0]';
        _executionTime = res['time'] ?? 'N/A';
        _memoryUsage = res['memory'] ?? 'N/A';
      });

      if (!success) {
        _runAiAssist(code, out);
      }
    } catch (e) {
      setState(() {
        _isCompiling = false;
        _lastRunSuccess = false;
        _terminalOutput = 'Execution Exception:\n$e';
      });
    }
  }

  Future<void> _runAiAssist([String? codeOverride, String? errOverride]) async {
    final code = codeOverride ?? _codeController.text;
    final err = errOverride ?? _terminalOutput;

    setState(() => _isAiDiagnosing = true);

    try {
      final report = await NexoraApiService.aiCodeAssist(
        code: code,
        error: err,
      );
      if (mounted) {
        setState(() {
          _isAiDiagnosing = false;
          _aiReport = report;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isAiDiagnosing = false);
      }
    }
  }

  void _applyAiFix() {
    if (_aiReport != null && _aiReport!['fixedCode'] != null) {
      setState(() {
        _codeController.text = _aiReport!['fixedCode'];
      });
      _tabController.animateTo(0);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          backgroundColor: Color(0xFF10B981),
          content: Text('AI Fix Applied! Tap "Run Code" to compile.'),
        ),
      );
    }
  }

  void _formatCode() {
    final lines = _codeController.text.split('\n');
    int indent = 0;
    final formatted = lines.map((line) {
      var trimmed = line.trim();
      if (trimmed.startsWith('}')) indent = (indent - 1).clamp(0, 10);
      final indented = ('    ' * indent) + trimmed;
      if (trimmed.endsWith('{')) indent++;
      return indented;
    }).join('\n');

    setState(() => _codeController.text = formatted);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Code Cleaned & Formatted')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(48),
        child: Container(
          color: const Color(0xFF1E293B),
          child: TabBar(
            controller: _tabController,
            indicatorColor: const Color(0xFF6366F1),
            indicatorWeight: 3,
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white60,
            tabs: const [
              Tab(icon: Icon(Icons.code, size: 18), text: 'Source Code'),
              Tab(icon: Icon(Icons.terminal, size: 18), text: 'Terminal'),
              Tab(icon: Icon(Icons.auto_awesome, size: 18), text: 'AI Auto-Fix'),
            ],
          ),
        ),
      ),
      body: Column(
        children: [
          // Quick Action Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            color: const Color(0xFF0F172A),
            child: Row(
              children: [
                const Icon(Icons.computer, color: Color(0xFF38BDF8), size: 18),
                const SizedBox(width: 8),
                Text(
                  _offlineMode ? 'C++ (Offline Engine)' : 'C++20 (GCC 13)',
                  style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13),
                ),
                const Spacer(),
                // Offline / Cloud Mode Toggle
                InkWell(
                  onTap: () {
                    setState(() => _offlineMode = !_offlineMode);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(_offlineMode
                            ? 'Switched to Offline Engine (Zero Internet Required)'
                            : 'Switched to Online Cloud GCC 13 Engine'),
                      ),
                    );
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _offlineMode
                          ? const Color(0xFFF59E0B).withOpacity(0.2)
                          : const Color(0xFF10B981).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _offlineMode
                            ? const Color(0xFFF59E0B)
                            : const Color(0xFF10B981),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _offlineMode ? Icons.cloud_off : Icons.cloud_done,
                          size: 14,
                          color: _offlineMode
                              ? const Color(0xFFF59E0B)
                              : const Color(0xFF10B981),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          _offlineMode ? 'Offline' : 'Online',
                          style: TextStyle(
                            color: _offlineMode
                                ? const Color(0xFFF59E0B)
                                : const Color(0xFF10B981),
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.format_align_left,
                      color: Colors.white70, size: 20),
                  tooltip: 'Format Code',
                  onPressed: _formatCode,
                ),
                IconButton(
                  icon: const Icon(Icons.copy, color: Colors.white70, size: 20),
                  tooltip: 'Copy Code',
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: _codeController.text));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Code copied to clipboard!')),
                    );
                  },
                ),
                const SizedBox(width: 4),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    padding:
                        const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: _isCompiling ? null : _runCode,
                  icon: _isCompiling
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.play_arrow,
                          color: Colors.white, size: 18),
                  label: Text(
                    _isCompiling ? 'Running...' : 'Run Code',
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildEditorTab(),
                _buildTerminalTab(),
                _buildAiFixTab(),
              ],
            ),
          ),
          _buildQuickSymbolBar(),
        ],
      ),
    );
  }

  Widget _buildEditorTab() {
    return Container(
      color: const Color(0xFF0F172A),
      padding: const EdgeInsets.all(8),
      child: TextField(
        controller: _codeController,
        maxLines: null,
        expands: true,
        style: const TextStyle(
          fontFamily: 'monospace',
          fontSize: 13,
          height: 1.4,
          color: Color(0xFFE2E8F0),
        ),
        decoration: InputDecoration(
          filled: true,
          fillColor: const Color(0xFF1E293B),
          hintText: 'Write C++ code here...',
          hintStyle: const TextStyle(color: Colors.white30),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildTerminalTab() {
    return Container(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _lastRunSuccess ? 'Status: Success' : 'Status: Execution Error',
                style: TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  color: _lastRunSuccess
                      ? const Color(0xFF10B981)
                      : const Color(0xFFEF4444),
                ),
              ),
              Text(
                'Time: $_executionTime | Mem: $_memoryUsage',
                style: const TextStyle(color: Colors.white60, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0B0F19),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFF334155)),
              ),
              child: SingleChildScrollView(
                child: SelectableText(
                  _terminalOutput,
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: _lastRunSuccess
                        ? const Color(0xFF38BDF8)
                        : const Color(0xFFFCA5A5),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _stdinController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              filled: true,
              fillColor: const Color(0xFF1E293B),
              hintText: 'Interactive STDIN input (for cin >>)',
              hintStyle: const TextStyle(color: Colors.white30),
              prefixIcon:
                  const Icon(Icons.keyboard, color: Colors.white60, size: 18),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiFixTab() {
    if (_isAiDiagnosing) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: Color(0xFF8B5CF6)),
            SizedBox(height: 16),
            Text('AI Diagnostic Engine is analyzing code...',
                style: TextStyle(color: Colors.white70)),
          ],
        ),
      );
    }

    if (_aiReport == null || _aiReport!['hasError'] != true) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: const [
            Icon(Icons.check_circle_outline, size: 56, color: Color(0xFF10B981)),
            SizedBox(height: 12),
            Text('No Compiler Errors Detected',
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold)),
            SizedBox(height: 6),
            Text('Your C++ code is valid and ready to run.',
                style: TextStyle(color: Colors.white60)),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF450A0A),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFDC2626)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.error, color: Color(0xFFEF4444), size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _aiReport!['errorType'] ?? 'Compiler Error',
                        style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  _aiReport!['diagnosis'] ?? '',
                  style: const TextStyle(color: Color(0xFFFECACA), fontSize: 13),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFF475569)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Why It Happened & Solution',
                    style: TextStyle(
                        color: Color(0xFFA5B4FC),
                        fontWeight: FontWeight.bold,
                        fontSize: 13)),
                const SizedBox(height: 6),
                Text(_aiReport!['whyItHappened'] ?? '',
                    style: const TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 8),
                Text('Fix: ${_aiReport!['howToFix'] ?? ''}',
                    style:
                        const TextStyle(color: Color(0xFF38BDF8), fontSize: 13)),
              ],
            ),
          ),
          const SizedBox(height: 14),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: _applyAiFix,
            icon: const Icon(Icons.auto_fix_high, color: Colors.white),
            label: const Text('1-Click Apply AI Fix',
                style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 14)),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickSymbolBar() {
    return Container(
      height: 44,
      color: const Color(0xFF1E293B),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
        itemCount: _quickSymbols.length,
        itemBuilder: (context, i) {
          final sym = _quickSymbols[i];
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 3),
            child: OutlinedButton(
              style: OutlinedButton.styleFrom(
                backgroundColor: const Color(0xFF334155),
                padding: const EdgeInsets.symmetric(horizontal: 10),
                minimumSize: const Size(36, 36),
                side: BorderSide.none,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6)),
              ),
              onPressed: () => _insertSymbol(sym),
              child: Text(
                sym,
                style: const TextStyle(
                    color: Colors.white,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w600,
                    fontSize: 13),
              ),
            ),
          );
        },
      ),
    );
  }
}
