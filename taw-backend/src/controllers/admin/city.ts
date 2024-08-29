import { Request, Response } from "express";
import connectDB from "../../config/db";
import City from "../../../models/city";
import InternalException from "../../exceptions/internal-exception";
export const getCitiesController = async (req: Request, res: Response) => {
  try {
    connectDB();
    const cities = await City.find().select("-__v").exec();
    return res.status(200).json(cities);
  } catch (err) {
    return InternalException(req, res, "Unknown error while fetching cities.");
  }
};
