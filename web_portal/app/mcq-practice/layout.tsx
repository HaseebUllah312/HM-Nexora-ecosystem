import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VU MCQ Practice – Midterm & Final Term Quiz Preparation | HM nexora",
    description: "Practice Virtual University MCQs with our AI-powered portal. Prepare for VU midterms and final terms with real-time feedback, VU-style exam simulations, and conceptual explanations.",
    keywords: "VU MCQ practice, Virtual University quizzes, VU midterm MCQs, VU final term MCQs, VU exam simulation, CS101 MCQs, MGT101 MCQs, VU online quiz preparation",
};

export default function MCQLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
