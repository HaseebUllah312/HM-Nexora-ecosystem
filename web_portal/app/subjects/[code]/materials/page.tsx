import { supabase } from '@/app/lib/supabase';
import MaterialsClient from './MaterialsClient';

interface Props {
    params: Promise<{ code: string }>;
}

export default async function SubjectMaterialsPage({ params }: Props) {
    const { code } = await params;
    const upperCode = code.toUpperCase();

    // Fetch subject info (Server Side)
    const { data: sub } = await supabase
        .from('subjects')
        .select('*')
        .ilike('code', upperCode)
        .single();
    
    const finalSubject = sub || {
        code: upperCode,
        name: `${upperCode} - Subject`,
        difficulty: 'TBD'
    };

    // Fetch approved files for this subject (Server Side)
    const { data: materialFiles } = await supabase
        .from('approved_materials')
        .select('*')
        .ilike('code', upperCode)
        .order('created_at', { ascending: false });
    
    return (
        <MaterialsClient 
            subject={finalSubject} 
            files={materialFiles || []} 
        />
    );
}
