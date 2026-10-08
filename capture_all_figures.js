const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE_URL = 'http://localhost:3000';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function clearAuth(page) {
  try {
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
    });
    const cookies = await page.cookies();
    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }
    await delay(300);
  } catch (err) {}
}

async function loginUser(page, email, password) {
  console.log(`\n🔑 Authenticating as ${email}...`);
  await clearAuth(page);
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle2', timeout: 30000 });
  await page.waitForSelector('input[type="email"]', { visible: true, timeout: 15000 });

  await page.click('input[type="email"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="email"]', email, { delay: 15 });

  await page.click('input[type="password"]', { clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.type('input[type="password"]', password, { delay: 15 });

  await page.click('button[type="submit"]');
  await delay(3000);
}

async function capture() {
  console.log('🚀 Enhancing Figures 11.9 and 11.10 with active deals & chats...');
  const screenshotDir = path.join(__dirname, 'screenshots');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox', 
      '--disable-dev-shm-usage',
      '--disable-web-security'
    ],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    try { await dialog.dismiss(); } catch(e) {}
  });

  try {
    // Authenticate as Creator Manav Patel
    await loginUser(page, 'dhameliyamanav@gmail.com', 'Creator@12345');

    // ----------------------------------------------------
    // Figure 11.9: Applications Management
    // ----------------------------------------------------
    console.log('📸 [9/13] Capturing Figure 11.9: Applications Management with active deals...');
    await page.goto(`${BASE_URL}/dashboard/applications`, { waitUntil: 'networkidle2' });
    await delay(3500);
    await page.screenshot({ path: path.join(screenshotDir, 'fig_11_9_applications_management.png') });
    console.log('  -> Updated fig_11_9_applications_management.png');

    // ----------------------------------------------------
    // Figure 11.10: Real-time Chat
    // ----------------------------------------------------
    console.log('📸 [10/13] Capturing Figure 11.10: Real-time Chat with open conversation...');
    await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle2' });
    await delay(3500);

    // Click on the conversation card to open the thread
    try {
      const conv = await page.$('.cursor-pointer, .glass.rounded-2xl.p-4');
      if (conv) {
        await conv.click();
        await delay(2000);
      }
    } catch(e) {
      console.log('Conversation card click error:', e.message);
    }
    await page.screenshot({ path: path.join(screenshotDir, 'fig_11_10_real_time_chat.png') });
    console.log('  -> Updated fig_11_10_real_time_chat.png');

    console.log('✨ All figures updated with rich live interactive data!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

capture();
