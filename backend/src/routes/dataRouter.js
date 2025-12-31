import express from "express";
import { getDaily, getInfinite } from "../controllers/dataController.js";

const router = express.Router();

// Test route that doesn't need database
router.get("/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

router.get("/daily", getDaily);
router.get("/infinite", getInfinite);

export default router;