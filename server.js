const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.get('/scrape', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new', // Render環境で安定する設定
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Renderで必要なオプション
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

const PORT = process.env.PORT || 10000; // Renderでは10000番ポートが推奨
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
