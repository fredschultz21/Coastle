import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });
console.log('DATABASE_URL loaded?', process.env.DATABASE_URL ? 'YES ✓' : 'NO ✗');

import express from "express";
import cors from "cors";

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/maps', express.static(path.join(__dirname, 'maps')));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get('/ping', (req, res) => res.status(200).json({ status: 'ok' }));

const { default: dataRouter } = await import("./routes/dataRouter.js");

app.use("/data", dataRouter);
// app.use("/", homeRouter);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));