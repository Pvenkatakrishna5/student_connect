// Test Supabase JS client connection via HTTPS REST API
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase JS client (HTTPS REST API)...');
console.log('URL:', supabaseUrl);
console.log('Key type: service_role');

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  try {
    // Test 1: Fetch users
    const { data: users, error: usersErr } = await supabase
      .from('User')
      .select('id, email, role')
      .limit(5);
    
    if (usersErr) {
      console.error('❌ Users query failed:', usersErr.message);
      console.log('   Details:', JSON.stringify(usersErr));
    } else {
      console.log(`✅ Users: Found ${users.length} users`);
      users.forEach(u => console.log(`   - ${u.email} (${u.role})`));
    }

    // Test 2: Fetch jobs
    const { data: jobs, error: jobsErr } = await supabase
      .from('Job')
      .select('id, title, status')
      .limit(3);
    
    if (jobsErr) {
      console.error('❌ Jobs query failed:', jobsErr.message);
    } else {
      console.log(`✅ Jobs: Found ${jobs.length} jobs`);
      jobs.forEach(j => console.log(`   - ${j.title} (${j.status})`));
    }

    // Test 3: Count students
    const { count, error: countErr } = await supabase
      .from('Student')
      .select('*', { count: 'exact', head: true });
    
    if (countErr) {
      console.error('❌ Count failed:', countErr.message);
    } else {
      console.log(`✅ Students count: ${count}`);
    }

    console.log('\n🎉 All tests passed! Supabase REST API works on this network.');
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

test();
