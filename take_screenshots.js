const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

async function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

async function login(page, email, password) {
  console.log(`🔑 Logging in as ${email}...`);
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'load' });
  
  await page.waitForSelector('input[type="email"]', { visible: true });
  
  // Clear any existing values
  await page.click('input[type="email"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="email"]', email);
  
  await page.click('input[type="password"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="password"]', password);
  
  await page.click('button[type="submit"]');
  await delay(4000);
  console.log('✅ Logged in successfully.');
}

async function logout(page) {
  console.log('🚪 Logging out (clearing local storage & cookies)...');
  const cookies = await page.cookies();
  if (cookies.length > 0) {
    await page.deleteCookie(...cookies);
  }
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await delay(1000);
}

async function run() {
  console.log('🚀 Launching Edge...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  
  // Ensure the screenshots directory exists
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
  }

  try {
    // 1. Login Page (used as cover illustration since root redirects to login)
    console.log('📸 Capturing Login Page for Cover...');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'load' });
    await page.waitForSelector('input[type="email"]', { visible: true });
    await delay(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'cover_illustration.png') });

    // 2. BRAND WORKFLOW
    await login(page, 'brand@demo.com', 'MD123456');
    
    // Brand Dashboard
    console.log('📸 Capturing Brand Dashboard...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'load' });
    await delay(3000);
    await page.screenshot({ path: path.join(screenshotDir, 'brand_dashboard.png') });

    // Find Creators
    console.log('📸 Capturing Find Creators Page...');
    await page.goto(`${BASE_URL}/creators`, { waitUntil: 'load' });
    await delay(3000);
    await page.screenshot({ path: path.join(screenshotDir, 'creator_search.png') });

    // Campaign Creation Form
    console.log('📸 Capturing Campaign Creation Form...');
    await page.goto(`${BASE_URL}/campaigns/create`, { waitUntil: 'load' });
    await delay(2000);
    await page.screenshot({ path: path.join(screenshotDir, 'campaign_creation.png') });

    // Direct Messaging (Brand side)
    console.log('📸 Capturing Brand Messages Page...');
    await page.goto(`${BASE_URL}/messages`, { waitUntil: 'load' });
    await delay(2000);
    // If there is a conversation, select it to show actual chat
    try {
      await page.click('.glass.rounded-2xl.p-4'); // try clicking a conversation card
      await delay(1000);
    } catch(e) {}
    await page.screenshot({ path: path.join(screenshotDir, 'chat_interface.png') });

    await logout(page);

    // 3. CREATOR WORKFLOW
    await login(page, 'md@demo.com', 'MD123456');

    // Creator Dashboard
    console.log('📸 Capturing Creator Dashboard...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'load' });
    await delay(3000);
    await page.screenshot({ path: path.join(screenshotDir, 'creator_dashboard.png') });

    await logout(page);

    // 4. ADMIN WORKFLOW
    await login(page, 'admin@demo.com', 'MD123456');

    // Admin Panel (User list or dashboard stats)
    console.log('📸 Capturing Admin Panel...');
    await page.goto(`${BASE_URL}/admin/users`, { waitUntil: 'load' });
    await delay(3000);
    await page.screenshot({ path: path.join(screenshotDir, 'admin_panel.png') });

    console.log('🎉 All screenshots captured successfully!');
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

run();
