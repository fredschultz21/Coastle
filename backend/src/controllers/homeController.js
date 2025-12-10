import { pool } from "../config/db.js"; 

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