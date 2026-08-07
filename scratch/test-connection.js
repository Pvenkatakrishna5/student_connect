// Quick test to verify Supabase connection on port 443
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection...');
console.log('URL port:', connectionString?.match(/:(\d+)\//)?.[1] || 'unknown');

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

async function test() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ Connection successful!');
    console.log('   Server time:', result.rows[0].time);
    console.log('   Database:', result.rows[0].db);
    client.release();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.message.includes('timeout')) {
      console.log('\n💡 This looks like a port blocking issue.');
      console.log('   Your network may be blocking outbound connections on this port.');
    }
  } finally {
    await pool.end();
  }
}

test();
