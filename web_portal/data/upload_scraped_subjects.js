const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing Supabase credentials in environment variables.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const scrapedSubjects = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped_subjects.json'), 'utf8'));

const CATEGORY_MAP = {
    "ACC": "Management", "BIF": "Science", "BIO": "Science", "BNK": "Management", "BT": "Science", "CHE": "Science",
    "CS": "Computer Science", "ECO": "Management", "EDU": "General", "ENG": "English", "FIN": "Management",
    "HRM": "Management", "ISL": "General", "MCM": "General", "MGMT": "Management", "MGT": "Management", "MKT": "Management",
    "MTH": "Mathematics", "PAK": "General", "PHY": "Science", "PSY": "General", "SOC": "General", "STA": "Mathematics",
    "URD": "General", "URU": "General", "VU": "General", "ZOO": "Science"
};

function getCategory(code) {
    const prefix = code.replace(/[0-9]/g, '');
    return CATEGORY_MAP[prefix] || "General";
}

async function uploadSubjects() {
    console.log(`Preparing to upload ${Object.keys(scrapedSubjects).length} subjects to Supabase...`);
    
    const records = Object.entries(scrapedSubjects).map(([code, name]) => {
        return {
            code: code.toUpperCase(),
            name: name,
            description: `Comprehensive study materials, past papers, handouts, and solved assignments for ${name} (${code}) at Virtual University of Pakistan.`,
            category: getCategory(code),
            difficulty: 'Medium',
            credit_hours: 3
        };
    });

    const BATCH_SIZE = 100;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('subjects').upsert(batch, { onConflict: 'code' });
        
        if (error) {
            console.error(`Error in batch ${i/BATCH_SIZE + 1}:`, error);
        } else {
            console.log(`✓ Uploaded batch ${i/BATCH_SIZE + 1} (${batch.length} items).`);
        }
    }
    
    console.log('Database upload complete!');
}

uploadSubjects().catch(err => {
    console.error('Upload failed:', err);
});
