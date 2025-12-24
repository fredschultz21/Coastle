import { pool } from "../config/db.js";

export async function getDaily(req, res) {
  try {
    // Get the current day's location ID from location_of_the_day table
    const { rows: dayRows } = await pool.query(
      "SELECT location_id FROM location_of_the_day LIMIT 1"
    );

    if (dayRows.length === 0) {
      return res.status(404).json({ error: "No location of the day set" });
    }

    const locationId = dayRows[0].location_id;

    // Get the full location data from locations table
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

    res.json(locationRows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}