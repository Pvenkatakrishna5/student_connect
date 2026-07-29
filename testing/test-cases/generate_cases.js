const fs = require('fs');
const path = require('path');

const categories = ['UI/UX', 'Functional', 'Unit', 'Validation', 'Deployment'];
const features = ['Login', 'Signup', 'Profile', 'Dashboard', 'Settings', 'Payment', 'Messaging', 'Search', 'Notifications', 'AdminPanel'];
const actions = ['Verify', 'Validate', 'Test', 'Check', 'Assert', 'Simulate'];
const contexts = ['Positive', 'Negative', 'Boundary', 'Integration'];

let testCases = [];
let idCounter = 1;

for (let category of categories) {
    for (let feature of features) {
        for (let action of actions) {
            for (let context of contexts) {
                if (testCases.length >= 350) break;
                
                testCases.push({
                    id: `TC-${String(idCounter).padStart(3, '0')}`,
                    category: category,
                    feature: feature,
                    description: `${action} ${context} flow for ${feature} (${category})`,
                    status: 'Pending',
                    executionTimeMs: 0
                });
                idCounter++;
            }
        }
    }
}

const outputPath = path.join(__dirname, 'cases.json');
fs.writeFileSync(outputPath, JSON.stringify(testCases, null, 2));

console.log(`Successfully generated ${testCases.length} unique test cases at ${outputPath}`);
