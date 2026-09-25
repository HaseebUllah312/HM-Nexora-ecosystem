import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Nexora Expert Services – Professional Academic Help for VU Students | HM nexora",
    description: "Access professional academic services for VU assignments, GDBs, quiz concepts, and complex subject topics. 24/7 intelligent study assistance.",
    keywords: "VU academic services, Virtual University expert hub, VU assignment help, VU GDB help, quiz assistance, study AI, HM nexora services, VU solved quiz files, academic help",
};

export default function AIAssistantLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
