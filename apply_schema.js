const fs = require('fs');
const { Client } = require('pg');
require('dotenv').config({path:'.env.local'});

const sql = fs.readFileSync('schema.sql', 'utf8');
// Split by semicolon that is at the end of a line
const stmts = sql.split(/;$/m).filter(s => s.trim() !== '');

const client = new Client({connectionString: process.env.DIRECT_URL});

(async () => {
  await client.connect();
  for (let s of stmts) {
    if (s.trim() === '') continue;
    try {
      await client.query(s);
    } catch(e) {
      console.error('Error on:\n', s.trim(), '\n', e.message);
      process.exit(1);
    }
  }
  console.log('✅ Schema applied successfully!');
  client.end();
})();
