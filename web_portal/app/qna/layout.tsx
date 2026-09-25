import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VU Student Q&A Forum – Ask Questions & Get Help | HM nexora",
    description: "Join the HM nexora Q&A forum for Virtual University students. Ask questions about your courses, share knowledge, and get help from the VU community and experts.",
    keywords: "VU forum, Virtual University Q&A, VU student community, ask VU questions, specialized VU help, VU course discussion, Virtual University Pakistani students",
};

export default function QNALayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
