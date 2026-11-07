// api/_supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

let client = null;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
}

module.exports = { getSupabase };
