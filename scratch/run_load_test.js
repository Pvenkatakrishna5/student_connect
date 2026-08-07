const { spawn } = require('child_process');
const http = require('http');

console.log('Installing autocannon...');
const install = spawn('npm', ['install', 'autocannon', '--no-save'], { shell: true });

install.on('close', () => {
  const autocannon = require('autocannon');
  
  console.log('Building the Next.js app for accurate production load testing...');
  const build = spawn('npm', ['run', 'build'], { shell: true, stdio: 'inherit' });

  build.on('close', (code) => {
    if (code !== 0) {
      console.error('Build failed');
      return;
    }
    
    console.log('\nStarting the production server...');
    const server = spawn('npm', ['run', 'start'], { shell: true });
    
    server.stdout.on('data', (data) => console.log(`[Server]: ${data.toString().trim()}`));
    server.stderr.on('data', (data) => console.error(`[Server Error]: ${data.toString().trim()}`));
    
    // Wait a few seconds for the server to fully start
    console.log('Waiting 5 seconds for server to be fully ready...');
    setTimeout(() => {
      console.log('\n--- SERVER READY. STARTING LOAD TEST ---');
      console.log('Target: http://localhost:3000/api/jobs');
      console.log('Virtual Users: 100');
      console.log('Duration: 60 seconds');
      console.log('Sending thousands of requests...\n');
      
      const instance = autocannon({
        url: 'http://localhost:3000/api/jobs', // Testing an API route
        connections: 100,
        duration: 60,
      }, (err, result) => {
        if (err) {
          console.error('Load test error:', err);
        } else {
          console.log('\n========================================');
          console.log('          LOAD TEST RESULTS             ');
          console.log('========================================\n');
          
          console.log('Requests per second (RPS):');
          console.log(`${result.requests.average} req/sec`);
          console.log(`Total Requests Sent: ${result.requests.total}`);
          
          console.log('\nResponse Time:');
          console.log(`Average: ${result.latency.average}ms`);
          console.log(`Min: ${result.latency.min}ms`);
          console.log(`Max: ${result.latency.max}ms`);
          
          console.log('\n----------------------------------------');
          console.log('Detailed Autocannon Output:');
          console.log(autocannon.printResult(result));
        }
        
        console.log('Shutting down server...');
        server.kill();
        process.exit(0);
      });
      
      autocannon.track(instance, { renderProgressBar: false });
    }, 5000); // 5 seconds wait
  });
});
