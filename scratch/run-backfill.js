fetch("http://localhost:3000/api/test/backfill").then(r=>r.text()).then(console.log).catch(console.error);
