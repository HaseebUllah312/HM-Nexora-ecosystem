import 'package:flutter/material.dart';
import '../navigation.dart';
import '../theme.dart';

class _Suggestion {
  final String icon;
  final String text;
  final String type;
  const _Suggestion(this.icon, this.text, this.type);
}

const List<_Suggestion> _suggestions = [
  _Suggestion('📐', 'Linear Algebra — Chapter 5', 'Note'),
  _Suggestion('🎬', 'Data Structures Lecture 8', 'Lecture'),
  _Suggestion('📝', 'Algorithms Quiz 3', 'Quiz'),
  _Suggestion('📚', 'Calculus II', 'Subject'),
  _Suggestion('🤖', 'Ask AI: explain recursion', 'AI'),
];

class SearchOverlay extends StatefulWidget {
  final VoidCallback onClose;
  final NavigateFn navigate;
  const SearchOverlay({super.key, required this.onClose, required this.navigate});

  @override
  State<SearchOverlay> createState() => _SearchOverlayState();
}

class _SearchOverlayState extends State<SearchOverlay> {
  String query = '';

  @override
  Widget build(BuildContext context) {
    final filtered = query.isEmpty
        ? _suggestions
        : _suggestions.where((s) => s.text.toLowerCase().contains(query.toLowerCase())).toList();

    return Stack(
      children: [
        GestureDetector(
          onTap: widget.onClose,
          child: Container(color: AppColors.foreground.withAlphaFrac(0.6)),
        ),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              clipBehavior: Clip.antiAlias,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                    decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: AppColors.border))),
                    child: Row(
                      children: [
                        const Icon(Icons.search, size: 20, color: AppColors.primary),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextField(
                            autofocus: true,
                            onChanged: (v) => setState(() => query = v),
                            decoration: const InputDecoration(
                              hintText: 'Search subjects, notes, lectures...',
                              border: InputBorder.none,
                              isDense: true,
                            ),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.foreground),
                          ),
                        ),
                        IconButton(
                          onPressed: widget.onClose,
                          icon: const Icon(Icons.close, size: 20, color: AppColors.subtitle),
                        ),
                      ],
                    ),
                  ),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxHeight: 340),
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (query.isEmpty)
                            const Padding(
                              padding: EdgeInsets.fromLTRB(16, 12, 16, 4),
                              child: Text('SUGGESTIONS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.subtitle, letterSpacing: 0.5)),
                            ),
                          ...filtered.map((item) {
                            return InkWell(
                              onTap: () {
                                widget.onClose();
                                if (item.type == 'Subject') {
                                  widget.navigate('subjectDetail', {'subject': 'Calculus II'});
                                } else if (item.type == 'AI') {
                                  widget.navigate('aiMentor');
                                }
                              },
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                child: Row(
                                  children: [
                                    Text(item.icon, style: const TextStyle(fontSize: 20)),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(item.text, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.foreground)),
                                          Text(item.type, style: const TextStyle(fontSize: 11, color: AppColors.subtitle)),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.mic, size: 16, color: AppColors.primary),
                        SizedBox(width: 8),
                        Text('Voice Search', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
