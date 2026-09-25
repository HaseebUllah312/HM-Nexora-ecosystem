import 'package:flutter/material.dart';
import '../../navigation.dart';
import '../../theme.dart';

class _Slide {
  final String emoji;
  final Gradient bg;
  final String title;
  final String desc;
  const _Slide({required this.emoji, required this.bg, required this.title, required this.desc});
}

final List<_Slide> _slides = [
  _Slide(
    emoji: '📚',
    bg: const LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [AppColors.primary, Color(0xFF6366F1)],
    ),
    title: 'All Your Subjects, One Place',
    desc:
        'Access notes, lectures, quizzes, and assignments for every subject — organized and always up to date.',
  ),
  _Slide(
    emoji: '🤖',
    bg: const LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF0891B2), AppColors.cyan],
    ),
    title: 'AI Mentor at Your Side',
    desc: 'Get instant answers, summaries, and study help from your personal AI mentor — available 24/7.',
  ),
  _Slide(
    emoji: '🌐',
    bg: const LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [Color(0xFF059669), AppColors.green],
    ),
    title: 'Learn Together, Grow Together',
    desc: 'Connect with classmates, join discussions, share ideas, and build a stronger academic community.',
  ),
];

class OnboardingScreen extends StatefulWidget {
  final NavigateFn navigate;
  const OnboardingScreen({super.key, required this.navigate});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  int current = 0;
  late final PageController _controller = PageController();

  void _goTo(int i) {
    setState(() => current = i);
    _controller.animateToPage(i, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
  }

  void _next() {
    if (current < _slides.length - 1) {
      _goTo(current + 1);
    } else {
      widget.navigate('login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final slide = _slides[current];
    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      decoration: BoxDecoration(gradient: slide.bg),
      child: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.topRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 24, top: 4),
                child: TextButton(
                  onPressed: () => widget.navigate('login'),
                  child: Text('Skip', style: TextStyle(color: Colors.white.withAlphaFrac(0.6), fontWeight: FontWeight.w600)),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => current = i),
                itemBuilder: (context, i) {
                  final s = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 192,
                          height: 192,
                          decoration: BoxDecoration(
                            color: Colors.white.withAlphaFrac(0.15),
                            borderRadius: BorderRadius.circular(40),
                            border: Border.all(color: Colors.white.withAlphaFrac(0.2)),
                          ),
                          child: Center(child: Text(s.emoji, style: const TextStyle(fontSize: 80))),
                        ),
                        const SizedBox(height: 32),
                        Text(
                          s.title,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold, height: 1.25),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          s.desc,
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white.withAlphaFrac(0.7), fontSize: 14, height: 1.5),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(32, 0, 32, 24),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_slides.length, (i) {
                      return GestureDetector(
                        onTap: () => _goTo(i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: i == current ? 28 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: i == current ? Colors.white : Colors.white.withAlphaFrac(0.3),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _next,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        elevation: 6,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            current == _slides.length - 1 ? 'Get Started' : 'Next',
                            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.chevron_right, size: 20),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
