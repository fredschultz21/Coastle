import { pool } from "../config/db.js";

export async function getDaily(req, res) {
  try {
    const { rows: dayRows } = await pool.query(
      "SELECT location_id FROM location_of_the_day LIMIT 1"
    );

    if (dayRows.length === 0) {
      return res.status(404).json({ error: "No location of the day set" });
    }

    const locationId = dayRows[0].location_id;

    const { rows: locationRows } = await pool.query(
      "SELECT * FROM locations WHERE id = $1",
      [locationId]
    );

    if (locationRows.length === 0) {
      return res.status(404).json({ 
        error: "Location not found",
        locationId: locationId 
      });
    }

    const location = locationRows[0];
    
    res.json({
      ...location,
      latitude: parseFloat(location.latitude),
      longitude: parseFloat(location.longitude)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}