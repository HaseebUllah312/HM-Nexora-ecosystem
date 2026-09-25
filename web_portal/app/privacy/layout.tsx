import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Privacy Policy | HM nexora - Your Data & Security",
    description: "Read the HM nexora privacy policy. Learn how we handle student data, cookies, and protect the privacy of the Virtual University community.",
    robots: { index: false, follow: true }, // Don't rank privacy policy too high
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
