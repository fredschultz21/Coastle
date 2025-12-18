import express from "express";

import { updateCountry, getPaths } from "../controllers/cronController.js";

const router = express.Router();

router.post("/", updateCountry);
router.get("/images", getPaths);

//router.get("/", getImages);

export default router;