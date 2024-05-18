// src/index.js
import express, { Express } from "express";
import dotenv from "dotenv";
import apiRouter from "./routes";
import cors from "cors";
import bodyParser from "body-parser";
import { whitelistMiddleware } from "./middlewares/whitelist";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:4200", "http://localhost:3000"],
};

// Whitelist
app.use(cors(corsOptions));
// Automatically parses JSON
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", whitelistMiddleware, apiRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
