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
import http from "http"
import {Server} from "socket.io"
import {getUserId} from "./utils/userID";
import * as jwt from "jsonwebtoken";
import {JWT_SECRET} from "./secret";
import User from "../models/user";

dotenv.config();

const app: Express = express();
const httpServer = http.createServer(app);

connectDB();

const port = process.env.PORT || 3000;

export const io = new Server(3001, {
  cors:{
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    allowedHeaders:["jwt"],
    credentials: true,
  }
});

io.on("connection", (socket)=>{
  const query = socket.handshake.query;
  const roomName = query.roomName;
  console.log("Connection established")
  if(!roomName){
    console.log("No room name provided");
    return;
  }
  socket.join(roomName);
  console.log("Joined room: ", roomName);

  socket.to(roomName).emit("hello", "Hello from server, this is our private room");
})




const corsOptions = {
  origin: ["http://localhost:4200", "http://localhost:3000", "http://localhost:3001"],
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

export function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Schedule cron job to check auctions every 1 minute
const job = cron.schedule("*/1 * * * *", () => {
  console.log("Checking auctions...");
  checkAuctionsEnd().then(r => console.log("Auctions checked"));
});

job.start();

