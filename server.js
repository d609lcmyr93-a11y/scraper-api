const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const app = express();

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    // Chrome のパスを自動取得
    const chromeBasePath = '/opt/render/.cache/puppeteer/chrome';
    const chromeDir = fs.readdirSync(chromeBasePath).find(name => name.startsWith('linux-'));
    const executablePath = path.join(chromeBasePath, chromeDir, 'chrome');

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const html = await page.content();
    await browser.close();

    res.json({ html });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/', (req, res) => res.send('Scraper API is running'));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
