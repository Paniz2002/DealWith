// src/index.js
import express, {Express, NextFunction, Request, Response} from "express";
import dotenv from "dotenv";
import apiRouter from "./routes";
import cors from "cors";
import bodyParser from "body-parser";
import {errorMiddleware} from "./middlewares/errors";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const whitelist = [
    "localhost",
    "127.0.0.1",
    "::1",
    "::ffff:172.77.0.1"
];
const corsOptions = {
    origin: ["http://localhost:4200", "http://localhost:3000"],
};

const whitelistMiddleware = function (
    req: Request,
    res: Response,
    next: NextFunction,
) {
    // If something doesn't work, check here to see if your IP is in the whitelist
    const remoteAddr = req.socket.remoteAddress;
    if (whitelist.includes(remoteAddr!)) {
        next();
    } else {
        //console.log(req.socket.remoteAddress);
        console.error("ERROR: you are not in the whitelist your IP: " + remoteAddr);
    }
};
// Whitelist
app.use(cors(corsOptions));
// Automatically parses JSON
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

app.use("/api", whitelistMiddleware, apiRouter);

app.use(errorMiddleware);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
