import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Professional Academic Services – VU LMS Handling, Assignments & Quiz Help | HM nexora",
    description: "Get professional academic support for Virtual University. We offer LMS handling, solved assignments, GDB solutions, and quiz help. Authentic guidance and 24/7 support for VU students by HM nexora.",
    keywords: "VU LMS handling, VU assignment help, VU quiz help, GDB solutions, VU project help, academic services for VU, Virtual University guider, VU student help",
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
