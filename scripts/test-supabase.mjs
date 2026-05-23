import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Simple manual dotenv loader
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
      const match = line.match(/^([^#\s][^=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim();
      }
    });
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to:', supabaseUrl);
  try {
    // A simple query to check if the database is accessible
    // We try to list the auth providers or simply check if we can query a table we created
    const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
    
    if (error) {
      console.error('Connection test failed!', error.message);
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('✅ Query to "user_profiles" successful.');
    }
  } catch (err) {
    console.error('Network or unexpected error:', err);
  }
}

testConnection();
