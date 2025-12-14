import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import cronRouter from "./routes/cronRouter.js"
import homeRouter from "./routes/homeRouter.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(express.json());

// Serve maps folder as static files
app.use('/maps', express.static(path.join(__dirname, 'maps')));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/cron", cronRouter);
app.use("/", homeRouter);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));