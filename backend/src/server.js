const PORT = process.env.PORT || 3001;

import express from "express";
import cors from "cors";

const app = express();

//const allowedOrigin = process.env.FRONTEND_URL;

//app.use(cors({ origin: allowedOrigin })); 

app.use(cors());

app.use(express.json());

//app.use("/", homeRouter);

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));