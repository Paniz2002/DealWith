import mongoose, {ConnectOptions} from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export default function connectDB(){
    const url = process.env.MONGODB_URI as string;

    // initial try catch to handle mongoDB errors
    try {
        mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }as ConnectOptions);
    } catch (err) {
        console.error((err as Error).message);
        process.exit(1);
    }

    const dbConnection = mongoose.connection;

    // event listeners for mongoDB connection
    dbConnection.once("open", (_) => {
        console.log("Database connected to " + url);
    });

    dbConnection.on("error", (err) => {
        console.error("Database connection error: " + err);
    });

    return;
}