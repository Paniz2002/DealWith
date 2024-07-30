import connectDB from "../config/db";
import express, { Express } from "express";
import dotenv from "dotenv";
import apiRouter from "./routes";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { whitelistMiddleware } from "./middlewares/whitelist";
import {Model, Schema} from "mongoose";

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


// Function to get all string paths from a schema
function getStringPaths(schema: Schema<any>) {
    return Object.keys(schema.paths).filter(path => schema.paths[path].instance === 'String');
}

// Function to search across all string fields of a model
export function fullTextSearch(model: Model<any>, searchText: string) {
    // Get all string paths from the model's schema
    const stringPaths = getStringPaths(model.schema);

    // Build the search conditions
    const searchConditions = stringPaths.map(path => ({
        [path]: { $regex: searchText, $options: 'i' }
    }));

    // Perform the search with $or
    return model.find({ $or: searchConditions });
}
