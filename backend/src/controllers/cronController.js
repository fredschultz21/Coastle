import { pool } from "../config/db.js"; 
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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


    const saved = [];

    for (let i = 1; i <= 10; i++) {
      const imageUrl = `https://api.mapbox.com/styles/v1/${MAPBOX_USERNAME}/${MAPBOX_STYLE_ID}/static/${lon},${lat},${i}/${width}x${height}@2x?logo=false&attribution=false&access_token=${MAPBOX_ACCESS_TOKEN}`;


      const response = await fetch(imageUrl);
      if (!response.ok) {
        return res.status(500).json({
          error: "Mapbox request failed",
          details: await response.text(),
        });
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      console.log(`Zoom ${i} - Buffer size:`, buffer.length, 'bytes'); // ADD THIS

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `zoom_${i}_${timestamp}.png`;
      const storagePath = `daily/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('map-images') // Your bucket name - create this in Supabase dashboard
        .upload(storagePath, buffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        return res.status(500).json({
          error: "Supabase upload failed",
          details: uploadError.message,
        });
      }

      const { data: { publicUrl } } = supabase
        .storage
        .from('map-images')
        .getPublicUrl(storagePath);

      // Store the public URL in your database
      await pool.query(
        `INSERT INTO image_links (id, link) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET link = $2`,
        [i, publicUrl]
      );

      saved.push(publicUrl);
    }

    res.json({
      message: "Images generated and uploaded to Supabase",
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
    };
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}