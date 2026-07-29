const { Builder } = require('selenium-webdriver');

async function buildDriver() {
  // Can be configured to run headless in CI
  let driver = await new Builder()
      .forBrowser('chrome')
      .build();
  
  // Set implicit wait
  await driver.manage().setTimeouts({ implicit: 5000 });
  
  return driver;
}

module.exports = { buildDriver };
