import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Latest VU Announcements & News | HM nexora",
    description: "Stay updated with the latest news, date sheets, and academic announcements from Virtual University of Pakistan. Real-time notifications for VU students.",
    keywords: "VU announcements, Virtual University news, VU date sheet 2026, VU exam notifications, VU admission news, HM nexora VU updates",
};

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
