import mongoose, {ConnectOptions} from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default function connectDB() {
    const url = process.env.MONGODB_URI as string;

    // initial try catch to handle mongoDB errors

    mongoose.connect(url).then(() => {
        const dbConnection = mongoose.connection;

        // event listeners for mongoDB connection
        dbConnection.once("open", () => {
            console.log("Database connected to " + url);
        });

        dbConnection.on("error", (err) => {
            console.error("Database connection error: " + err);
            process.exit(1);
        });

    }).catch((err) => {
        console.error("MongoDB connection error: " + err);
        process.exit(1);
    });
}
