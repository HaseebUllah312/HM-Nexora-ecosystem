import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VU Student Leaderboard – Top Contributors & Scholars | HM nexora",
    description: "See the top contributing students at HM nexora. Track points, badges, and recognition for students helping the Virtual University community with study materials.",
    keywords: "VU leaderboard, top VU students, Virtual University academic ranking, HM nexora contributors, VU student rewards, VU scholar leaderboard",
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
