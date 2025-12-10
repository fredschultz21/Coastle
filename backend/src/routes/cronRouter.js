import express from "express";

import { updateCountry } from "../controllers/cronController.js";

const router = express.Router();

router.post("/cron", updateCountry);

export default router;