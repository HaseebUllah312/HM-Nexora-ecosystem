import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubject() {
    const code = 'ZOO502';
    console.log(`Checking subject: ${code}`);

    const { data: materials, error: mError } = await supabase
        .from('approved_materials')
        .select('*')
        .ilike('code', code);

    if (mError) {
        console.error('Error fetching materials:', mError);
    } else {
        console.log(`Found ${materials.length} approved materials for ${code}`);
        materials.forEach(m => {
            console.log(`- Code: "${m.code}", Type: "${m.type}", Title: "${m.title}"`);
        });
    }

    const { data: allMaterials, error: aError } = await supabase
        .from('approved_materials')
        .select('code, type')
        .limit(10);

    if (aError) {
        console.error('Error fetching bulk materials:', aError);
    } else {
        console.log('Sample of bulk materials:');
        allMaterials.forEach(m => {
            console.log(`- Code: "${m.code}", Type: "${m.type}"`);
        });
    }
}

checkSubject();
