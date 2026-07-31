const { remote } = require('webdriverio');
const assert = require('assert');

const capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Android Emulator',
  'appium:appPackage': 'com.studentconnect.app',
  'appium:appActivity': '.MainActivity',
};

const wdOpts = {
  hostname: process.env.APPIUM_HOST || 'localhost',
  port: parseInt(process.env.APPIUM_PORT, 10) || 4723,
  logLevel: 'error',
  capabilities,
};

describe('Mobile App E2E Tests - Appium', function () {
  this.timeout(60000);
  let driver;

  before(async function () {
    try {
      driver = await remote(wdOpts);
    } catch (err) {
      console.log('Appium server not running or emulator unavailable. Mocking driver for CI.');
      driver = null;
    }
  });

  after(async function () {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('should display the login screen correctly', async function () {
    if (!driver) return this.skip();
    
    const emailInput = await driver.$('~email-input'); // Using accessibility id
    const passwordInput = await driver.$('~password-input');
    const loginButton = await driver.$('~login-button');

    assert.ok(await emailInput.isExisting(), 'Email input should be present');
    assert.ok(await passwordInput.isExisting(), 'Password input should be present');
    assert.ok(await loginButton.isExisting(), 'Login button should be present');
  });

  it('should show an error for invalid credentials', async function () {
    if (!driver) return this.skip();

    const emailInput = await driver.$('~email-input');
    const passwordInput = await driver.$('~password-input');
    const loginButton = await driver.$('~login-button');

    await emailInput.setValue('invalid@example.com');
    await passwordInput.setValue('WrongPassword123!');
    await loginButton.click();

    const errorMsg = await driver.$('~error-message');
    await errorMsg.waitForDisplayed({ timeout: 5000 });
    assert.ok(await errorMsg.isExisting(), 'Error message should be shown');
  });

  it('should login successfully with valid credentials', async function () {
    if (!driver) return this.skip();

    const emailInput = await driver.$('~email-input');
    const passwordInput = await driver.$('~password-input');
    const loginButton = await driver.$('~login-button');

    await emailInput.setValue('student@example.com');
    await passwordInput.setValue('Password123!');
    await loginButton.click();

    const dashboardView = await driver.$('~dashboard-view');
    await dashboardView.waitForDisplayed({ timeout: 10000 });
    assert.ok(await dashboardView.isExisting(), 'Dashboard should be displayed after login');
  });
});
