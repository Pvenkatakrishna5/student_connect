const { By, until } = require('selenium-webdriver');
const { expect } = require('chai');
const { buildDriver } = require('../selenium-config');

describe('Registration Flow E2E (Selenium)', function() {
  this.timeout(30000); 
  let driver;
  const baseUrl = 'http://localhost:3000';

  before(async function() {
    driver = await buildDriver();
  });

  after(async function() {
    if (driver) {
      await driver.quit();
    }
  });

  it('should navigate to the registration page', async function() {
    await driver.get(`${baseUrl}/register`);
    // Some basic check to verify page load
    const body = await driver.findElement(By.css('body'));
    expect(body).to.exist;
  });

  it('should have required fields for registration', async function() {
    await driver.get(`${baseUrl}/register`);
    
    // Check if standard registration fields are present
    const emailField = await driver.findElements(By.css('input[type="email"]'));
    const passwordFields = await driver.findElements(By.css('input[type="password"]'));
    
    expect(emailField.length).to.be.greaterThan(0);
    expect(passwordFields.length).to.be.greaterThan(0);
  });
});
