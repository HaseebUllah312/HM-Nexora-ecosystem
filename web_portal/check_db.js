import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { count: reviewsCount } = await supabase.from('subject_reviews').select('*', { count: 'exact', head: true });
    const { count: papersCount } = await supabase.from('shared_papers').select('*', { count: 'exact', head: true });
    console.log(`subject_reviews count: ${reviewsCount}`);
    console.log(`shared_papers count: ${papersCount}`);
}

main();
