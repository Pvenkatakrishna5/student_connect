const path = require('path');
const ExcelReporter = require('./utils/excel-reporter');

exports.config = {
    //
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    port: 4723, // Default Appium port

    //
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        './specs/**/*.js'
    ],
    exclude: [
        // 'path/to/excluded/files'
    ],

    //
    // ============
    // Capabilities
    // ============
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'UiAutomator2',
        // TODO: Replace with the actual path to your APK
        'appium:app': path.join(process.cwd(), 'app-release.apk'), 
        'appium:appWaitActivity': '*', // Wait for any activity to load
    }],

    //
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: [
        [ExcelReporter, {
            outputDir: path.join(__dirname, '..', '..', 'test-results'),
            filename: 'Mobile_Test_Report.xlsx'
        }]
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    },
}
