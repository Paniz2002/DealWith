// src/index.js
import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import rootRouter from "./routes";
import cors from "cors";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

const whitelist = ["localhost", "127.0.0.1", "::1", "::ffff:127.0.0.1"];
const corsOptions = {
  origin: "localhost",
};

function whitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  const remoteAddr = req.socket.remoteAddress;
  console.log(remoteAddr);
  if (whitelist.includes(remoteAddr!)) {
    next();
  }
}
app.use(cors(corsOptions));
app.use("/api", whitelistMiddleware, rootRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
