import express from "express";

import { updateCountry } from "../controllers/cronController.js";

const router = express.Router();

router.post("/", updateCountry);

export default router;