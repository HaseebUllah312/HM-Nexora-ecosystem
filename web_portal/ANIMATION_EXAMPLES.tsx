// ============================================================================
// EXAMPLE: How to Add Modern Animations to Your Existing Pages
// ============================================================================

'use client';

import { useState } from 'react';
import { AnimatedSection, PageTransition } from '@/components/PageTransition';
import { ModernCard } from '@/components/ModernCard';
import { ModernButton } from '@/components/ModernButton';

// ============================================================================
// EXAMPLE 1: Dashboard with Modern Cards and Buttons
// ============================================================================

export function DashboardExample() {
  const stats = [
    { title: 'Active Quizzes', value: '5', icon: '📝' },
    { title: 'Courses Enrolled', value: '12', icon: '📚' },
    { title: 'Progress', value: '75%', icon: '📊' },
  ];

  return (
    <PageTransition type="slideUp">
      <div className="container py-20">
        <h1 className="text-4xl font-bold text-glow-primary mb-4">
          Welcome Back!
        </h1>
        <p className="text-text-secondary mb-12 animation-fadeInDown">
          Continue your learning journey
        </p>

        {/* Animated Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <AnimatedSection key={stat.title} delay={index * 0.1}>
              <ModernCard variant="glass" hoverEffect="lift">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <h3 className="text-xl font-bold">{stat.title}</h3>
                <p className="text-3xl font-bold text-glow mt-2">
                  {stat.value}
                </p>
              </ModernCard>
            </AnimatedSection>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 flex-wrap">
          <ModernButton variant="primary" size="lg">
            Take Quiz
          </ModernButton>
          <ModernButton variant="secondary" size="lg">
            View Courses
          </ModernButton>
          <ModernButton variant="outline" size="lg">
            Download Notes
          </ModernButton>
        </div>
      </div>
    </PageTransition>
  );
}

// ============================================================================
// EXAMPLE 2: Quiz Page with Animated Questions
// ============================================================================

export function QuizPageExample() {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      question: 'What is React?',
      options: [
        'JavaScript library for building UIs',
        'CSS framework',
        'Database tool',
        'Backend framework',
      ],
      correct: 0,
    },
  ];

  return (
    <PageTransition type="fade">
      <div className="container py-20">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
            <div
              className="progress-bar-animated h-full rounded-full"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <AnimatedSection type="slideUp" delay={0.1}>
          <ModernCard variant="gradient" hoverEffect="glow">
            <h2 className="text-2xl font-bold mb-8">
              {questions[currentQuestion].question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, idx) => (
                <div key={idx} className="list-item-stagger">
                  <ModernButton
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <span className="mr-3 font-bold">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </ModernButton>
                </div>
              ))}
            </div>
          </ModernCard>
        </AnimatedSection>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <ModernButton variant="secondary">Previous</ModernButton>
          <ModernButton variant="primary" size="lg">
            Submit Answer
          </ModernButton>
        </div>
      </div>
    </PageTransition>
  );
}

// ============================================================================
// EXAMPLE 4: Leaderboard with Staggered List Animation
// ============================================================================

export function LeaderboardExample() {
  const users: { rank: number; name: string; medal: string; score: number }[] = [
    { rank: 1, name: 'Ahmed Hassan', medal: '🥇', score: 9850 },
    { rank: 2, name: 'Fatima Khan', medal: '🥈', score: 9720 },
    { rank: 3, name: 'Ali Raza', medal: '🥉', score: 9640 },
  ];

  return (
    <PageTransition type="slideUp">
      <div className="container py-20">
        <h1 className="text-4xl font-bold mb-8 text-glow-primary">
          Top Performers
        </h1>

        <div className="space-y-3">
          {users.map((user) => (
            <ModernCard
              key={user.rank}
              variant="glass"
              hoverEffect="scale"
              className="list-item-stagger"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{user.medal}</span>
                  <div>
                    <h3 className="font-bold">{user.name}</h3>
                    <p className="text-text-secondary">Rank #{user.rank}</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-glow">
                  {user.score}
                </span>
              </div>
            </ModernCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

// ============================================================================
// Key Animation Classes Available
// ============================================================================

/*
  CLASS NAMES YOU CAN USE:

  Page Transitions:
  - animation-fadeIn
  - animation-slideUp
  - animation-scaleUp
  - animation-blurIn
  - animation-fadeInDown
  - animation-fadeInRight

  Card Effects:
  - glass-card
  - card-hover-lift
  - card-hover-scale
  - card-hover-glow

  Text Effects:
  - text-glow
  - text-glow-primary
  - underline-animate

  Background:
  - gradient-animated
  - float-animation
  - float-animation-slow
  - float-animation-fast

  Interactive:
  - button-gradient-hover
  - button-press
  - input-animated
  - animated-border
  - list-item-stagger

  Status:
  - success-pulse
  - error-shake
  - loader-spin
  - skeleton-pulse

  Other:
  - backdrop-blur
  - backdrop-blur-heavy
  - ripple
*/

// ============================================================================
// Implementation Checklist
// ============================================================================

/*
  ✅ Completed Setup:
  - animations.css created with comprehensive animation library
  - Modern components created (PageTransition, ModernButton, ModernCard)
  - AnimatedBackground component for visual appeal
  - globals.css updated to import animations
  - Layout.tsx updated with page transitions
  - All animations are CSS-based for optimal performance

  📋 Next Steps to Modernize Your Pages:

  1. Dashboard Page (app/dashboard/page.tsx)
     [ ] Wrap with PageTransition
     [ ] Replace cards with ModernCard
     [ ] Add animation-slideUp to sections

  2. Quiz Pages
     [ ] Add progress bar animations
     [ ] Animate questions with fadeInDown
     [ ] Use ModernButton for options

  3. Upload Page
     [ ] Enhance drag-drop zone with animations
     [ ] Add file list animations
     [ ] Use animated progress bar

  4. Leaderboard
     [ ] Add list-item-stagger to user items
     [ ] Add medal animations with float-animation

  5. Profile Page
     [ ] Add glass-card effects
     [ ] Animate profile sections
     [ ] Add text-glow to important stats

  6. Other Pages
     [ ] About: Add animation-slideUp to sections
     [ ] Contact: Animate form with input-animated
     [ ] Resources: Grid animation with glass-cards
     [ ] QNA: Staggered list animation
     [ ] Subjects: Card hover effects
*/
