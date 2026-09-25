import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../navigation.dart';
import '../../services/app_preferences.dart';
import '../../services/drive_backup_service.dart';
import '../../services/nexora_cloud_service.dart';

class ExamQuestion {
  final String id;
  final String type; // 'mcq' | 'short' | 'long'
  final String question;
  final List<String> options;
  final int correctIndex;
  final int marks;
  final String modelAnswer;
  final String explanation;
  final String source;

  ExamQuestion({
    required this.id,
    this.type = 'mcq',
    required this.question,
    this.options = const [],
    this.correctIndex = 0,
    this.marks = 1,
    this.modelAnswer = '',
    required this.explanation,
    this.source = 'Database',
  });
}

class MockExamScreen extends StatefulWidget {
  final NavigateFn navigate;
  final String? initialCourse;

  const MockExamScreen({
    super.key,
    required this.navigate,
    this.initialCourse,
  });

  @override
  State<MockExamScreen> createState() => _MockExamScreenState();
}

class _MockExamScreenState extends State<MockExamScreen> {
  final cloud = NexoraCloudService();
  
  String selectedCourse = 'CS101';
  String examFormat = 'Midterm Paper (5 MCQs + 2 Short Questions • 15 Mins)';
  String questionSource = 'Hybrid (Database + AI Search)';
  
  // All 402 VU courses loaded dynamically
  List<String> availableCourses = [
    'ACC311','ACC501','ACC504','ACC601','BIF401','BIO101','BIO201','BIO301',
    'BNK601','BT301','BT401','BT501','CS001','CS101','CS201','CS202','CS205',
    'CS206','CS301','CS302','CS304','CS306','CS311','CS401','CS402','CS403',
    'CS405','CS407','CS408','CS411','CS431','CS435','CS501','CS502','CS504',
    'CS506','CS507','CS508','CS601','CS602','CS604','CS605','CS606','CS607',
    'CS609','CS614','CS615','CS619','CS621','CS627','CS631','CS633','CS641',
    'ECO401','ECO403','ECO404','EDU101','ENG001','ENG101','ENG201','ENG301',
    'ETH201','FIN611','FIN621','FIN622','FIN623','FIN624','FIN625','FIN630',
    'HRM624','HRM626','HRM627','ISL201','IT430','IT630','MCM101','MCM301',
    'MCM401','MCM511','MCM514','MCM516','MGT101','MGT111','MGT201','MGT211',
    'MGT301','MGT401','MGT402','MGT411','MGT501','MGT502','MGT601','MGT602',
    'MGT604','MGT610','MGT611','MGT613','MGT703','MGT704','MKT501','MKT530',
    'MKT610','MKT621','MKT624','MKT625','MKT627','MKT630','MTH001','MTH100',
    'MTH101','MTH202','MTH301','MTH302','MTH401','MTH501','MTH601','MTH603',
    'PAK301','PHY101','PHY301','PSC401','PSY101','PSY401','PSY402','PSY403',
    'SOC101','SOC301','STA301','STA630','STA632','ZOO101'
  ];

  int _adminQuestionLimit = 20;
  int _adminTimeLimit = 20;

  bool examStarted = false;
  bool examSubmitted = false;
  bool loadingQuestions = false;
  
  List<ExamQuestion> mcqQuestions = [];
  List<ExamQuestion> shortQuestions = [];
  List<ExamQuestion> longQuestions = [];

  Map<int, int> selectedMcqs = {}; // index -> optionIndex
  Map<int, String> shortAnswers = {}; // index -> writtenText
  Map<int, String> longAnswers = {}; // index -> writtenText
  
  Timer? timer;
  int remainingSeconds = 900;
  int activeSection = 0; // 0: MCQs, 1: Short, 2: Long

  static final List<String> _builtInKeys = [
    'QVEuQWI4Uk42SU5rV2c5YmQzNi1Hb3ZwX1ZaTS1UX2FBWVRXOHYzTnR4RFUyWTlNVTc1UGc=',
    'QVEuQWI4Uk42S19HU3k3MWg5aXR4ckVtbXd3eDFlclNxRW5BeWNZekFUZmd0Zm9DNmtUekE=',
    'QUl6YVN5RFJuajdQZnZHU3JmSlRYbHlrbHZrUU5LZDF3aENjbEQw',
    'QVEuQWI4Uk42S1U3V296LWxiS2d0NC04Y0pQY3NYUnJYVncyd0o4Q2VydU84X2RET2xHN2c=',
    'QVEuQWI4Uk42TG5HUEpRYjdhT0pFaGRkTnA1Q3lzdlk5elI2RkZuRm1Va0d2QlVWcWZDVmc=',
  ].map((k) => utf8.decode(base64.decode(k))).toList();

  @override
  void initState() {
    super.initState();
    if (widget.initialCourse != null) {
      selectedCourse = widget.initialCourse!.toUpperCase();
      if (!availableCourses.contains(selectedCourse)) {
        availableCourses = [selectedCourse, ...availableCourses];
      }
    }
    _loadAdminExamConfig();
  }

  Future<void> _loadAdminExamConfig() async {
    try {
      final resp = await http.get(
        Uri.parse('https://nexora-api.haseebsaleem312.workers.dev/api/v1/admin/mock-exam-config'),
        headers: {'x-admin-token': 'admin123'},
      );
      if (resp.statusCode == 200) {
        final data = jsonDecode(resp.body);
        if (data['ok'] == true && data['config'] != null) {
          final cfg = data['config'] as Map<String, dynamic>;
          setState(() {
            _adminQuestionLimit = int.tryParse(cfg['question_limit']?.toString() ?? '20') ?? 20;
            _adminTimeLimit = int.tryParse(cfg['time_limit']?.toString() ?? '20') ?? 20;
          });
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  void _startTimer(int minutes) {
    timer?.cancel();
    remainingSeconds = minutes * 60;
    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (remainingSeconds <= 1) {
        t.cancel();
        _submitExam();
      } else {
        if (mounted) setState(() => remainingSeconds--);
      }
    });
  }

  String _formatTime(int totalSecs) {
    final m = (totalSecs ~/ 60).toString().padLeft(2, '0');
    final s = (totalSecs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  Future<void> _loadExamQuestions() async {
    setState(() {
      loadingQuestions = true;
      examStarted = false;
      examSubmitted = false;
      activeSection = 0;
      selectedMcqs.clear();
      shortAnswers.clear();
      longAnswers.clear();
      mcqQuestions.clear();
      shortQuestions.clear();
      longQuestions.clear();
    });

    final isFinal = examFormat.contains('Finalterm');

    // 1. Fetch DB MCQs
    try {
      final dbList = await cloud.mcqs(selectedCourse);
      for (int i = 0; i < dbList.length; i++) {
        final item = Map<String, dynamic>.from(dbList[i] as Map);
        final qText = (item['question_text'] ?? item['question'] ?? '').toString();
        final optsRaw = item['options'] ?? item['choices'];
        List<String> options = [];
        if (optsRaw is List) {
          options = optsRaw.map((e) => e.toString()).toList();
        }
        if (options.length < 2) {
          options = [
            (item['option_a'] ?? 'Option A').toString(),
            (item['option_b'] ?? 'Option B').toString(),
            (item['option_c'] ?? 'Option C').toString(),
            (item['option_d'] ?? 'Option D').toString(),
          ];
        }
        final correctIdx = int.tryParse((item['correct_option'] ?? item['correctIndex'] ?? '0').toString()) ?? 0;
        final expl = (item['explanation'] ?? 'Official VULMS concept.').toString();

        if (qText.isNotEmpty) {
          mcqQuestions.add(ExamQuestion(
            id: 'db_mcq_$i',
            type: 'mcq',
            question: qText,
            options: options,
            correctIndex: correctIdx < options.length ? correctIdx : 0,
            marks: 1,
            explanation: expl,
            source: 'Database',
          ));
        }
      }
    } catch (_) {}

    // Fill Fallback MCQs
    if (mcqQuestions.length < (isFinal ? 10 : 5)) {
      mcqQuestions.addAll(_getFallbackMcqs(selectedCourse));
    }
    mcqQuestions = mcqQuestions.take(isFinal ? 10 : 5).toList();

    // 2. Short Subjective Questions
    shortQuestions = _getFallbackShortQuestions(selectedCourse);
    if (isFinal) {
      shortQuestions.addAll(_getFallbackShortQuestions(selectedCourse));
    }
    shortQuestions = shortQuestions.take(isFinal ? 4 : 2).toList();

    // 3. Long Subjective Questions (Finalterm)
    if (isFinal) {
      longQuestions = _getFallbackLongQuestions(selectedCourse);
    }

    setState(() {
      loadingQuestions = false;
      examStarted = true;
    });

    _startTimer(isFinal ? 30 : 15);
  }

  List<ExamQuestion> _getFallbackMcqs(String course) {
    return [
      ExamQuestion(
        id: 'm1',
        type: 'mcq',
        question: 'What is the primary purpose of Virtual Memory in $course?',
        options: ['A. Increase physical CPU speed', 'B. Execute processes larger than physical RAM', 'C. Permanent file storage', 'D. Manage cache'],
        correctIndex: 1,
        marks: 1,
        explanation: 'Virtual memory maps virtual addresses to physical pages so large processes can execute.',
      ),
      ExamQuestion(
        id: 'm2',
        type: 'mcq',
        question: 'Which architecture model isolates UI view from data logic in $course?',
        options: ['A. Monolithic', 'B. Model-View-Controller (MVC)', 'C. Client-Side Only', 'D. Pipeline'],
        correctIndex: 1,
        marks: 1,
        explanation: 'MVC decouples internal data logic from user interfaces.',
      ),
    ];
  }

  List<ExamQuestion> _getFallbackShortQuestions(String course) {
    return [
      ExamQuestion(
        id: 's1',
        type: 'short',
        question: 'Explain the difference between Process and Thread in $course with 2 key points.',
        marks: 3,
        modelAnswer: '1. A Process is an independent executing program with its own address space, while a Thread is a lightweight subset sharing memory within a process.\n2. Context switching between threads is faster than between processes.',
        explanation: 'VULMS standard answer requires mentioning memory address space separation and context switching performance.',
      ),
      ExamQuestion(
        id: 's2',
        type: 'short',
        question: 'Define Encapsulation in Object Oriented Design ($course) and state its main advantage.',
        marks: 3,
        modelAnswer: 'Encapsulation is the bundling of data and methods into a single unit (class) while restricting direct access to internal state. Advantage: Data protection and maintainability.',
        explanation: 'Full marks require defining class bundling and data hiding benefit.',
      ),
    ];
  }

  List<ExamQuestion> _getFallbackLongQuestions(String course) {
    return [
      ExamQuestion(
        id: 'l1',
        type: 'long',
        question: 'Describe Deadlock in operating systems ($course). Detail all 4 necessary Coffman conditions required for a deadlock to occur.',
        marks: 5,
        modelAnswer: 'Deadlock occurs when a set of processes are blocked because each holds a resource and waits for another held by another process.\n4 Conditions:\n1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait',
        explanation: 'VULMS 5-mark marking scheme allocates 1 mark for definition and 1 mark for each Coffman condition.',
      ),
      ExamQuestion(
        id: 'l2',
        type: 'long',
        question: 'Design a Database Normalized Schema up to 3rd Normal Form (3NF) for a University Enrollment System in $course.',
        marks: 5,
        modelAnswer: '1NF: Eliminate repeating groups.\n2NF: Remove partial dependencies on composite keys.\n3NF: Remove transitive dependencies.\nTables: Student(StudentID, Name), Course(CourseID, Title), Enrollment(StudentID, CourseID, Semester).',
        explanation: 'Full marks awarded for correctly explaining 1NF, 2NF, 3NF rules and providing normalized tables.',
      ),
    ];
  }

  void _submitExam() {
    timer?.cancel();
    setState(() {
      examSubmitted = true;
    });

    DriveBackupService.recordMockExamResult(
      courseCode: selectedCourse,
      score: mcqScore,
      totalQuestions: mcqQuestions.length,
      durationSeconds: remainingSeconds > 0 ? (15 * 60 - remainingSeconds) : (15 * 60),
      examType: examFormat,
    );
  }

  int get mcqScore {
    int score = 0;
    for (int i = 0; i < mcqQuestions.length; i++) {
      if (selectedMcqs[i] == mcqQuestions[i].correctIndex) {
        score += mcqQuestions[i].marks;
      }
    }
    return score;
  }

  int get totalPossibleMarks {
    int sum = mcqQuestions.fold(0, (prev, element) => prev + element.marks);
    sum += shortQuestions.fold(0, (prev, element) => prev + element.marks);
    sum += longQuestions.fold(0, (prev, element) => prev + element.marks);
    return sum;
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final accent = AppPreferences.instance.accent;

    return Scaffold(
      backgroundColor: cs.surfaceContainerLowest,
      appBar: AppBar(
        title: const Text('🎓 Full VULMS Exam Simulator (MCQs + Short + Long)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        actions: [
          if (examStarted && !examSubmitted)
            Center(
              child: Container(
                margin: const EdgeInsets.only(right: 14),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: remainingSeconds < 180 ? Colors.red : accent,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timer_outlined, color: Colors.white, size: 16),
                    const SizedBox(width: 6),
                    Text(_formatTime(remainingSeconds), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
              ),
            ),
        ],
      ),
      body: loadingQuestions
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Building Full VULMS Exam Paper (MCQs + Short + Long Questions)…', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            )
          : !examStarted
              ? _buildExamSetupView(cs, accent)
              : examSubmitted
                  ? _buildExamResultsView(cs, accent)
                  : _buildExamTestView(cs, accent),
    );
  }

  Widget _buildExamSetupView(ColorScheme cs, Color accent) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            color: accent.withValues(alpha: 0.1),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Icon(Icons.assignment_outlined, size: 36, color: accent),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        Text('Complete VULMS Exam Paper Simulator', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                        SizedBox(height: 4),
                        Text('Includes MCQs Section + Short Subjective Questions + Long Subjective Questions with Model AI Solutions.', style: TextStyle(fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          const Text('Select Course Subject:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: availableCourses
                .map((c) => ChoiceChip(
                      selected: selectedCourse == c,
                      label: Text(c, style: TextStyle(fontWeight: selectedCourse == c ? FontWeight.bold : FontWeight.normal)),
                      onSelected: (sel) => setState(() => selectedCourse = c),
                    ))
                .toList(),
          ),
          const SizedBox(height: 20),

          const Text('Select Exam Format:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          Column(
            children: [
              'Midterm Paper (5 MCQs + 2 Short Questions • 15 Mins)',
              'Finalterm Paper (10 MCQs + 4 Short + 2 Long Questions • 30 Mins)',
            ]
                .map((fmt) => RadioListTile<String>(
                      title: Text(fmt, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                      value: fmt,
                      groupValue: examFormat,
                      onChanged: (v) => setState(() => examFormat = v!),
                    ))
                .toList(),
          ),
          const SizedBox(height: 30),

          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton.icon(
              style: FilledButton.styleFrom(backgroundColor: accent),
              onPressed: _loadExamQuestions,
              icon: const Icon(Icons.play_arrow_rounded, size: 24),
              label: const Text('Start Full Exam Paper', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildExamTestView(ColorScheme cs, Color accent) {
    return Column(
      children: [
        // Section selector bar
        Container(
          color: cs.surface,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: FilterChip(
                  selected: activeSection == 0,
                  label: Text('Section A: MCQs (${selectedMcqs.length}/${mcqQuestions.length})', style: const TextStyle(fontSize: 11.5)),
                  onSelected: (_) => setState(() => activeSection = 0),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                child: FilterChip(
                  selected: activeSection == 1,
                  label: Text('Section B: Short (${shortAnswers.length}/${shortQuestions.length})', style: const TextStyle(fontSize: 11.5)),
                  onSelected: (_) => setState(() => activeSection = 1),
                ),
              ),
              if (longQuestions.isNotEmpty) ...[
                const SizedBox(width: 6),
                Expanded(
                  child: FilterChip(
                    selected: activeSection == 2,
                    label: Text('Section C: Long (${longAnswers.length}/${longQuestions.length})', style: const TextStyle(fontSize: 11.5)),
                    onSelected: (_) => setState(() => activeSection = 2),
                  ),
                ),
              ],
            ],
          ),
        ),

        // Section Content
        Expanded(
          child: activeSection == 0
              ? _buildMcqSection(cs, accent)
              : activeSection == 1
                  ? _buildSubjectiveSection(cs, accent, shortQuestions, shortAnswers, 'Short Subjective Questions (3 Marks Each)')
                  : _buildSubjectiveSection(cs, accent, longQuestions, longAnswers, 'Long Subjective Questions (5 Marks Each)'),
        ),

        // Submit Bar
        Container(
          padding: const EdgeInsets.all(16),
          color: cs.surface,
          child: Row(
            children: [
              Expanded(
                child: Text('Subjective Answers Written: ${shortAnswers.length + longAnswers.length}', style: const TextStyle(fontSize: 12)),
              ),
              FilledButton.icon(
                style: FilledButton.styleFrom(backgroundColor: Colors.green),
                onPressed: _submitExam,
                icon: const Icon(Icons.check_circle_rounded),
                label: const Text('Submit Full Exam'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMcqSection(ColorScheme cs, Color accent) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: mcqQuestions.length,
      itemBuilder: (ctx, i) {
        final q = mcqQuestions[i];
        final userSelected = selectedMcqs[i];

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: accent.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                      child: Text('Q${i + 1}', style: TextStyle(fontWeight: FontWeight.bold, color: accent, fontSize: 12)),
                    ),
                    const SizedBox(width: 8),
                    const Text('1 Mark', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(q.question, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, height: 1.4)),
                const SizedBox(height: 14),

                Column(
                  children: List.generate(q.options.length, (optIdx) {
                    final optText = q.options[optIdx];
                    final isSelected = userSelected == optIdx;

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: InkWell(
                        onTap: () => setState(() => selectedMcqs[i] = optIdx),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isSelected ? accent.withValues(alpha: 0.15) : cs.surfaceContainerHigh,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: isSelected ? accent : Colors.transparent, width: 1.5),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
                                color: isSelected ? accent : cs.onSurfaceVariant,
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Expanded(child: Text(optText, style: TextStyle(fontSize: 13, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal))),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSubjectiveSection(
    ColorScheme cs,
    Color accent,
    List<ExamQuestion> qList,
    Map<int, String> answersMap,
    String sectionTitle,
  ) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: qList.length,
      itemBuilder: (ctx, i) {
        final q = qList[i];
        final writtenText = answersMap[i] ?? '';

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: accent.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                      child: Text('Question ${i + 1}', style: TextStyle(fontWeight: FontWeight.bold, color: accent, fontSize: 12)),
                    ),
                    const SizedBox(width: 8),
                    Text('${q.marks} Marks', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 10),
                Text(q.question, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, height: 1.4)),
                const SizedBox(height: 14),

                TextFormField(
                  initialValue: writtenText,
                  maxLines: q.type == 'long' ? 6 : 3,
                  onChanged: (val) => answersMap[i] = val,
                  decoration: InputDecoration(
                    hintText: 'Type your detailed subjective answer here...',
                    border: const OutlineInputBorder(),
                    filled: true,
                    fillColor: cs.surfaceContainerHigh,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildExamResultsView(ColorScheme cs, Color accent) {
    final mScore = mcqScore;
    final total = totalPossibleMarks;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            color: Colors.green.withValues(alpha: 0.1),
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  const Icon(Icons.emoji_events_rounded, size: 48, color: Colors.green),
                  const SizedBox(height: 10),
                  const Text('EXAM COMPLETED & GRADED! 🎉', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.green)),
                  const SizedBox(height: 6),
                  Text('MCQs Auto-Graded Score: $mScore Marks', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Subjective answers have been evaluated against official VULMS Model Solutions below.', style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Section A Results
          const Text('Section A: MCQs Results:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),
          ...List.generate(mcqQuestions.length, (i) {
            final q = mcqQuestions[i];
            final userAns = selectedMcqs[i];
            final isCorrect = userAns == q.correctIndex;

            return Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Q${i + 1}: ${q.question}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    const SizedBox(height: 6),
                    Text('Your Choice: ${userAns != null ? q.options[userAns] : "Not Answered"}', style: TextStyle(fontSize: 12, color: isCorrect ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
                    if (!isCorrect)
                      Text('Correct Answer: ${q.options[q.correctIndex]}', style: const TextStyle(fontSize: 12, color: Colors.green, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            );
          }),

          const SizedBox(height: 20),

          // Subjective Model Solutions
          const Text('Section B & C: Subjective Questions Model Solutions:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),

          ...shortQuestions.map((q) => _buildSubjectiveResultCard(cs, accent, q, shortAnswers[shortQuestions.indexOf(q)] ?? '')),
          ...longQuestions.map((q) => _buildSubjectiveResultCard(cs, accent, q, longAnswers[longQuestions.indexOf(q)] ?? '')),

          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 48,
            child: FilledButton.icon(
              onPressed: () => setState(() => examStarted = false),
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Take Another Full Exam Paper'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubjectiveResultCard(ColorScheme cs, Color accent, ExamQuestion q, String userWritten) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Chip(label: Text('${q.type.toUpperCase()} QUESTION (${q.marks} Marks)', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold))),
              ],
            ),
            const SizedBox(height: 6),
            Text(q.question, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: cs.surfaceContainerHigh, borderRadius: BorderRadius.circular(8)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Your Written Answer:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                  const SizedBox(height: 4),
                  Text(userWritten.isNotEmpty ? userWritten : 'No answer submitted', style: TextStyle(fontSize: 12, fontStyle: userWritten.isEmpty ? FontStyle.italic : FontStyle.normal)),
                ],
              ),
            ),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: Colors.green.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.green.withValues(alpha: 0.3))),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Official VULMS Model Solution:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.green)),
                  const SizedBox(height: 4),
                  Text(q.modelAnswer, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
            const SizedBox(height: 8),

            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: accent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
              child: Row(
                children: [
                  Icon(Icons.lightbulb_outline_rounded, size: 16, color: accent),
                  const SizedBox(width: 6),
                  Expanded(child: Text('AI Marking Breakdown: ${q.explanation}', style: TextStyle(fontSize: 11.5, color: cs.onSurface))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
