import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
let conn: typeof mongoose | null = null;
export default async function connectDB() {
  if (conn) {
    return conn;
  }

  const url = process.env.MONGODB_URI as string;

  try {
    await mongoose.connect(url);
    conn = mongoose;
    Object.freeze(conn);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;

  dbConnection.once("open", () => {
    console.log("Database connected to " + url);
  });

  dbConnection.on("error", (err) => {
    console.error("Database connection error: " + err);
  });

  return conn;
}
