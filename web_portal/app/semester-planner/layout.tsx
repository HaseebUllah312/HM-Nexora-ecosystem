import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VU Semester Planner & Study Scheduler | HM nexora",
    description: "Organize your Virtual University studies with our intelligent semester planner. Create custom study schedules, track lecture progress, and prepare for exams efficiently.",
    keywords: "VU study planner, Virtual University schedule, VU semester planning, VU lecture tracker, exam preparation, VU study manager",
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
