import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VU Student Tools – CGPA Calculator, GPA & LMS Tools | HM nexora",
    description: "Access essential tools for Virtual University students, including VU CGPA calculators, semester GPA tools, and student utilities. All-in-one academic utility suite by HM nexora.",
    keywords: "VU tools, VU CGPA calculator, Virtual University GPA calculator, VU study planner, VU student utilities, HM nexora academic tools, VU LMS tools, result calculation",
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
