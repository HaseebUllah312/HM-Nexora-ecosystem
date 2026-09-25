import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "VU Study Vault – Handouts, Past Papers & Solved Files | HM nexora",
    description: "Access the ultimate collection of Virtual University handouts, solved midterm and final term past papers, and academic resources for all VU subjects.",
    keywords: "VU vault, Virtual University handouts, VU past papers, VU solved files, VU academic resources, study vault HM nexora",
};

export default function VaultLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
