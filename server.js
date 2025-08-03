import express, { json } from 'express';
import cors from 'cors';
import { chromium } from 'playwright';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(json());

app.post('/download', async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith('https://www.instagram.com/')) {
    return res.status(400).json({ success: false, message: 'Invalid Instagram URL' });
  }

  try {
    const browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/115 Safari/537.36',
    });

    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000); // give some time for video to load

    const videoUrl = await page.evaluate(() => {
      const video = document.querySelector('video');
      return video ? video.src : null;
    });

    await browser.close();

    if (videoUrl) {
      res.json({ success: true, downloadUrl: videoUrl });
    } else {
      res.json({ success: false, message: 'Video URL not found' });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

app.get('/', (req, res) => {
  res.send('Instagram Reel Downloader Backend is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
