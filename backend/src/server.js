const PORT = process.env.PORT || 3001;

import express from "express";
import cors from "cors";
import cronRouter from "./routes/cronRouter.js"
import homeRouter from "./routes/homeRouter.js"

const app = express();

app.use(cors());
app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use("/cron", cronRouter);
app.use("/", homeRouter);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));