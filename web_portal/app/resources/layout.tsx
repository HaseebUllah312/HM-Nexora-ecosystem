import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VU Study Resources – Handouts, Midterm & Final Term Files | HM nexora",
    description: "Explore comprehensive VU study resources. Download Virtual University handouts, midterm files, final term papers, and solved assignments for academic success.",
    keywords: "VU resources, Virtual University study materials, VU handouts download, VU midterm files, VU final term papers, academic success VU",
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
