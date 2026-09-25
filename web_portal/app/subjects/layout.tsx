import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Subject Library",
    description: "Browse the most comprehensive library of Virtual University subjects. Download VU handouts, midterm & final term past papers, and solved files for all courses including CS, Management, Mathematics, and more.",
    keywords: "VU subject library, VU handouts download, VU past papers, Virtual University course materials, CS101 handouts, MGT101 handouts, VU study files",
};

export default function SubjectsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
