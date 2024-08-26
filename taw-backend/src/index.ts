import express, {Express} from "express";
import dotenv from "dotenv";
import apiRouter from "./routes";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import {whitelistMiddleware} from "./middlewares/whitelist";
import connectDB from "./config/db";
import {checkAuctionsEnd} from "./utils/notifications";
import http from "http";
import {Server} from "socket.io";
import {sendNotification} from "./utils/notifications";
import Auction from "../models/auction";
import User from "../models/user";

dotenv.config();

connectDB();
const app: Express = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
export const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200", // Angular app's URL
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("New client connected (no room yet)");

    // When a user joins a room
    socket.on("joinRoom", (room) => {
        //REMEMBER: room is the user id so be careful when you use ._id (it could be type ObjectId), make sure to convert it to string
        User.exists({_id: room}).then((exists) => {
            if (!exists) {
                console.log("User " + room + " does not exist");
                return;
            }
            socket.join(room);
            console.log(`User joined user room: ${room}`);
        }).catch((err) => {
            console.error("Error while joining user room:", err)
        });

        sendNotification(room);
    });

    socket.on("joinCommentRoom", (room) => {
        console.log("Joining comment room");
        //check if auction exists
        Auction.exists({_id: room.toString().replace('auction_', '')}).then((exists) => {
            if (!exists) {
                console.log("Auction " + room + " does not exist");
                return;
            }
            socket.join(room);
            console.log(`User joined auction room: ${room}`);
        }).catch((err) => {
                console.error("Error while joining auction room:", err)
            }
        )
    });

    // Handle a custom event
    socket.on("sendMessage", (data) => {
        const {room, message} = data;
        io.to(room).emit("receiveMessage", message);
    });

    // When a user disconnects
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

server.listen(3001, () =>
    console.log("[socketIo] Server is running on port 3001"),
);

const corsOptions = {
    origin: [
        "http://localhost:4200",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    credentials: true, // Allows credentials (cookies) to be sent
};

// Whitelist
app.use(cors(corsOptions));

// Automatically parses JSON
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

app.use("/api", whitelistMiddleware, apiRouter);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Schedule cron job to check auctions every 1 minute
cron
    .schedule("*/1 * * * *", () => {
        checkAuctionsEnd()
            .then((r) => {
                console.log("Auction checked");
            })
            .catch((e) => {
                console.error("Auction checking Error", e);
            });
    })
    .start();
