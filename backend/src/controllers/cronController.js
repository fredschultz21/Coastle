import { pool } from "../config/db.js"; 
import { createClient } from '@supabase/supabase-js';
import puppeteer from 'puppeteer';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function updateCountry(req, res) {
  try {
    const lat = 40.7128;
    const lon = -74.0060;
    const width = 2560;
    const height = 1440;

    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

    if (!MAPBOX_ACCESS_TOKEN) {
      return res.status(500).json({ error: "Mapbox token missing" });
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: "Supabase env vars missing" });
    }

    console.log('Clearing old images from daily folder...');
    const { data: existingFiles, error: listError } = await supabase
      .storage
      .from('map-images')
      .list('daily');

    if (listError) {
      console.error('Error listing files:', listError);
    } else if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(file => `daily/${file.name}`);
      
      const { error: deleteError } = await supabase
        .storage
        .from('map-images')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error deleting files:', deleteError);
      } else {
        console.log(`Deleted ${filesToDelete.length} old images`);
      }
    }

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const saved = [];

    for (let i = 1; i <= 10; i++) {
      console.log(`Generating zoom ${i}...`);

      const page = await browser.newPage();
      await page.setViewport({ width, height });

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js'></script>
  <link href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css' rel='stylesheet' />
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    mapboxgl.accessToken = '${MAPBOX_ACCESS_TOKEN}';
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [${lon}, ${lat}],
      zoom: ${i},
      interactive: false,
      attributionControl: false
    });
  </script>
</body>
</html>
      `;

      await page.setContent(html);
      await page.waitForTimeout(3000);

      const screenshot = await page.screenshot({ type: 'png' });
      await page.close();

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `zoom_${i}_${timestamp}.png`;
      const storagePath = `daily/${fileName}`;

      const { error: uploadError } = await supabase
        .storage
        .from('map-images')
        .upload(storagePath, screenshot, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        await browser.close();
        return res.status(500).json({
          error: "Supabase upload failed",
          details: uploadError.message,
        });
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('map-images')
        .getPublicUrl(storagePath);

      await pool.query(
        `INSERT INTO image_links (id, link) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET link = $2`,
        [i, publicUrl]
      );

      saved.push(publicUrl);
    }

    await browser.close();

    res.json({
      message: "High-res images generated with Puppeteer",
      files: saved,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}

export async function getPaths(req, res) {
  try {
    const { rows } = await pool.query("SELECT * FROM image_links");
    if (rows.length === 0) {
      return res.status(404).json({ message: "Links not found" });
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}