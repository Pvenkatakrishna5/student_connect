const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const { buildDriver } = require('../selenium-config');

describe('Login Flow E2E (Selenium)', function() {
  this.timeout(30000); // 30 seconds for browser tests
  let driver;
  const baseUrl = 'http://localhost:3000'; // Adjust as needed for CI

  before(async function() {
    driver = await buildDriver();
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('should navigate to the login page', async function() {
    await driver.get(`${baseUrl}/login`);
    const title = await driver.getTitle();
    // Example: The title might be "Student Connect" or similar
    expect(title).to.not.be.empty;
  });

  it('should show error for invalid credentials', async function() {
    await driver.get(`${baseUrl}/login`);
    
    // Find email and password fields
    const emailField = await driver.findElement(By.css('input[type="email"]'));
    const passwordField = await driver.findElement(By.css('input[type="password"]'));
    const submitBtn = await driver.findElement(By.css('button[type="submit"]'));
    
    await emailField.sendKeys('invalid@example.com');
    await passwordField.sendKeys('wrongpassword');
    await submitBtn.click();
    
    // Wait for some error message (this selector depends on actual UI)
    // Here we use a generic class wait as an example
    try {
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Invalid credentials') or contains(text(), 'Error')]")), 5000);
        expect(true).to.be.true; // Success if found
    } catch (e) {
        // If no error message appears, this test fails
        // We catch here just to fail gracefully with a good message
        expect.fail('Error message did not appear for invalid credentials');
    }
  });

  it('should have a link to registration', async function() {
    await driver.get(`${baseUrl}/login`);
    const regLink = await driver.findElement(By.xpath("//a[contains(@href, '/register')]"));
    const isDisplayed = await regLink.isDisplayed();
    expect(isDisplayed).to.be.true;
  });
});
