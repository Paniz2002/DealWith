import express, { Express } from "express";
import dotenv from "dotenv";
import apiRouter from "./routes";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { whitelistMiddleware } from "./middlewares/whitelist";
import connectDB from "./config/db";
import { checkAuctionsEnd } from "./utils/notifications";

dotenv.config();

const app: Express = express();

connectDB();

const port = process.env.PORT || 3000;

const corsOptions = {
  origin: ["http://localhost:4200", "http://localhost:3000"],
  credentials: true, // Allows credentials (cookies) to be sent
};

// Whitelist
app.use(cors(corsOptions));

// Automatically parses JSON
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api", whitelistMiddleware, apiRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Schedule cron job to check auctions every 1 minute
const job = cron.schedule("*/1 * * * *", () => {
  console.log("Checking auctions...");
  checkAuctionsEnd().then(r => console.log("Auctions checked"));
});

job.start();