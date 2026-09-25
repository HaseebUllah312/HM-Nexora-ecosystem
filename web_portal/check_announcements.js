const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAnnouncementsTable() {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error("Error fetching announcements:", error);
  } else {
    console.log("Announcements table check succeeded! Data:", data);
  }
}

checkAnnouncementsTable();
