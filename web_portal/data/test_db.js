const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('--- Checking Database Consistency ---');
    
    // 1. Check a few subjects from the user's screenshot
    const testCodes = ['ZOO502', 'ZOO401', 'ZOO504'];
    
    for (const code of testCodes) {
        console.log(`\nTesting Subject: ${code}`);
        
        // Check in subjects table
        const { data: subj } = await supabase.from('subjects').select('*').ilike('code', code).single();
        console.log(`- In 'subjects' table: ${subj ? 'YES (' + subj.name + ')' : 'NO'}`);
        
        // Check in approved_materials table
        const { data: materials } = await supabase.from('approved_materials').select('*').ilike('code', code);
        console.log(`- In 'approved_materials' table: ${materials?.length || 0} files found`);
        if (materials && materials.length > 0) {
            console.log(`  Sample materials codes in DB: "${materials[0].code}"`);
        }
    }

    // 2. Check total counts
    const { count: totalSubjects } = await supabase.from('subjects').select('*', { count: 'exact', head: true });
    const { count: totalMaterials } = await supabase.from('approved_materials').select('*', { count: 'exact', head: true });
    
    console.log(`\nTotal Subjects in DB: ${totalSubjects}`);
    console.log(`Total Approved Materials in DB: ${totalMaterials}`);

    // 3. Test the bulk aggregation logic on a small scale
    const { data: sampleMaterials } = await supabase.from('approved_materials').select('code').limit(10);
    console.log('\nSample raw codes from materials:');
    sampleMaterials.forEach(m => console.log(`- "${m.code}"`));
}

checkDatabase();
