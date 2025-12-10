import express from "express";
import { getPaths } from "../controllers/homeController.js";

const router = express.Router();

router.get("/", getPaths);

export default router;