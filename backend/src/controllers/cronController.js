import { pool } from "../config/db.js"; 
import fs from "fs"; 
import path from "path"; 

export async function updateCountry(req, res) {
  try {
    const lat = 40.7128;
    const lon = -74.0060;
    const width = 1280;
    const height = 720;

    const MAPBOX_USERNAME = process.env.MAPBOX_USERNAME;
    const MAPBOX_STYLE_ID = process.env.MAPBOX_STYLE_ID;
    const MAPBOX_ACCESS_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

    if (!MAPBOX_STYLE_ID || !MAPBOX_ACCESS_TOKEN || !MAPBOX_USERNAME) {
      return res.status(500).json({ error: "Mapbox env vars missing" });
    }

    const mapsDir = path.join(process.cwd(), "src", "maps");
    await fs.promises.mkdir(mapsDir, { recursive: true });

    const saved = [];

    for (let i = 1; i <= 10; i++) {
      const imageUrl = `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/static/${lon},${lat},${i}/${width}x${height}?access_token=${MAPBOX_ACCESS_TOKEN}`;

      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(500).json({
          error: "Mapbox request failed",
          details: await response.text(),
        });
      }

      const buffer = Buffer.from(await response.arrayBuffer());

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePath = path.join(process.cwd(), "src", "maps", `zoom_${i}_${timestamp}.png`);
      const publicPath = path.join("maps", `zoom_${i}_${timestamp}.png`);

      await fs.promises.writeFile(filePath, buffer);

      // CHANGED: Using INSERT ... ON CONFLICT instead of UPDATE
      await pool.query(
        `INSERT INTO image_links (id, link) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET link = $2`,
        [i, publicPath]
      );

      saved.push(publicPath);
    }

    res.json({
      message: "Images generated",
      files: saved,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}