// Test if Supabase REST API works over HTTPS (port 443)
const url = 'https://ezqvckqgbchishlgatew.supabase.co/rest/v1/User?select=count&limit=1';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6cXZja3FnYmNoaXNobGdhdGV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDExNTgsImV4cCI6MjA5Mzg3NzE1OH0.kMGhbP4vyJN0Ige3qBOmtI_lPkDxS5o6P2btCEeeiLg';

console.log('Testing Supabase REST API (HTTPS)...');
fetch(url, {
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
  }
})
  .then(res => {
    console.log('Status:', res.status, res.statusText);
    return res.text();
  })
  .then(body => {
    console.log('✅ Supabase REST API works! Response:', body);
  })
  .catch(e => {
    console.error('❌ Supabase REST API FAILED:', e.message);
  });
