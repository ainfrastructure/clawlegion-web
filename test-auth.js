const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to login page...');
    await page.goto('http://localhost:3001/login');
    
    console.log('Filling in credentials...');
    await page.type('[placeholder="admin"]', 'admin');
    await page.type('[placeholder="••••••••"]', 'ONXFd/qKY8o/5DufAHpUahsQc0kI3Vtd');
    
    console.log('Submitting form...');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for navigation...');
    await page.waitForNavigation();
    
    console.log('Taking dashboard screenshot...');
    await page.screenshot({ path: '/tmp/dashboard-branded.png', fullPage: true });
    
    console.log('Success! Dashboard screenshot saved.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();