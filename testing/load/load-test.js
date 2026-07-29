const axios = require('axios');

// Configuration based on prompt
const VIRTUAL_USERS = 100;
const DURATION_MS = 60000; // 1 minute
const TARGET_URL = 'http://localhost:3000/api/profile'; // Example API endpoint to test

// Metrics
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
let responseTimes = [];

async function simulateUser(endTime) {
    while (Date.now() < endTime) {
        const startTime = Date.now();
        try {
            // Using a simple GET request. In a real scenario, this might need auth headers.
            await axios.get(TARGET_URL);
            successfulRequests++;
        } catch (error) {
            failedRequests++;
        } finally {
            const timeTaken = Date.now() - startTime;
            responseTimes.push(timeTaken);
            totalRequests++;
        }
    }
}

async function runLoadTest() {
    console.log(`Starting Baseline/Load Testing...`);
    console.log(`• ${VIRTUAL_USERS} virtual users`);
    console.log(`• Running continuously for 1 minute`);
    console.log(`• Target: ${TARGET_URL}\n`);

    const startTime = Date.now();
    const endTime = startTime + DURATION_MS;

    const userPromises = [];
    for (let i = 0; i < VIRTUAL_USERS; i++) {
        userPromises.push(simulateUser(endTime));
    }

    // Interval to show live RPS (every second)
    const rpsInterval = setInterval(() => {
        const elapsedSeconds = (Date.now() - startTime) / 1000;
        const currentRps = Math.floor(totalRequests / elapsedSeconds);
        console.log(`Current RPS: ${currentRps} req/sec`);
    }, 5000); // Log every 5s to avoid terminal spam

    // Wait for all users to finish
    await Promise.all(userPromises);
    clearInterval(rpsInterval);

    const actualDurationSeconds = (Date.now() - startTime) / 1000;

    // Calculate Metrics
    const rps = Math.floor(totalRequests / actualDurationSeconds);
    const minResponse = Math.min(...responseTimes);
    const maxResponse = Math.max(...responseTimes);
    const avgResponse = Math.floor(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) || 0;

    console.log(`\n--- Load Testing Report ---`);
    console.log(`Total Requests: ${totalRequests}`);
    console.log(`Successful: ${successfulRequests}, Failed: ${failedRequests}`);
    console.log(`\nWhat you will see`);
    console.log(`Requests per second (RPS)`);
    console.log(`Example:`);
    console.log(`${rps} req/sec`);
    console.log(`Meaning your API is handling about ${rps} requests every second.\n`);
    
    console.log(`Response Time`);
    console.log(`Example:`);
    console.log(`Average: ${avgResponse}ms`);
    console.log(`Min: ${minResponse === Infinity ? 0 : minResponse}ms`);
    console.log(`Max: ${maxResponse === -Infinity ? 0 : maxResponse}ms`);
    
    console.log(`Meaning:`);
    console.log(`• Fastest response = ${minResponse === Infinity ? 0 : minResponse}ms`);
    console.log(`• Average = ${avgResponse}ms`);
    console.log(`• Slowest = ${maxResponse === -Infinity ? 0 : maxResponse}ms`);
}

runLoadTest();
