import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Terms of Service | HM nexora",
    description: "Rules and terms for using the HM nexora platform. Guidelines for Virtual University students using our handouts, past papers, and services.",
    robots: { index: false, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
