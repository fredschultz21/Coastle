import express from "express";
import { getDaily } from "../controllers/dataController.js";

const router = express.Router();

// Test route that doesn't need database
router.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

router.get("/daily", getDaily);

export default router;