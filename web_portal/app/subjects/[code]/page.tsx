import { Metadata } from 'next';
import { supabase } from '@/app/lib/supabase';
import { getSubjectByCode } from '@/data/subjects';
import SubjectDetailClient from './SubjectDetailClient';
import allSubjects from '@/data/subjects.json';

export async function generateStaticParams() {
    return allSubjects.map((code) => ({
        code: code.toLowerCase(),
    }));
}

interface Props {
    params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { code } = await params;
    const upperCode = code.toUpperCase();

    // Try to get dynamic data from DB first
    const { data: subjectData } = await supabase
        .from('subjects')
        .select('name, description')
        .ilike('code', upperCode)
        .single();

    // Fallback to static data
    const staticSubject = getSubjectByCode(upperCode);

    const name = subjectData?.name || staticSubject?.name || `${upperCode} - Virtual University Subject`;
    const description = subjectData?.description || staticSubject?.description ||
        `Download ${upperCode} handouts, past papers, solved assignments, and prepared files for Virtual University midterm and final term exams.`;

    return {
        title: `${upperCode} - ${name} | Handouts & Past Papers | HM nexora`,
        description: description,
        keywords: `${upperCode}, ${name}, VU ${upperCode} handouts, ${upperCode} past papers, solved assignments, VU study materials, HM nexora`,
        openGraph: {
            title: `${upperCode} - ${name} Resources`,
            description: description,
            url: `https://hmnexora.tech/subjects/${code.toLowerCase()}`,
            type: 'website',
            images: [{ url: 'https://hmnexora.tech/logo.png' }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${upperCode} Resources - HM nexora`,
            description: description,
            images: ['https://hmnexora.tech/logo.png'],
        },
    };
}

export default async function SubjectDetailPage({ params }: Props) {
    const { code } = await params;
    const upperCode = code.toUpperCase();

    // Fetch initial data for the subject
    const { data: subjectData } = await supabase
        .from('subjects')
        .select('*')
        .ilike('code', upperCode)
        .single();

    // Fetch initial resources from approved materials
    const { data: resourcesData } = await supabase
        .from('approved_materials')
        .select('*')
        .ilike('code', upperCode);

    // Get static fallback if DB entry missing
    const staticSubject = getSubjectByCode(upperCode);
    const finalSubject = subjectData || staticSubject;

    if (!finalSubject) {
        return (
            <div className="page">
                <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
                    <h1>Subject Not Found</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>The subject code &quot;{upperCode}&quot; was not found in our database.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <SubjectDetailClient
                    code={upperCode}
                    initialSubject={finalSubject}
                    initialResources={resourcesData || []}
                />
            </div>
        </div>
    );
}
