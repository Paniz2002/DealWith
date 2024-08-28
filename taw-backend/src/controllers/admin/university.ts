import { Request, Response } from "express";
import connectDB from "../../config/db";
import University from "../../../models/university";
import InternalException from "../../exceptions/internal-exception";
export const getUniversitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    connectDB();
    const universities = await University.find().select("-__v -city").exec();
    return res.status(200).json(universities);
  } catch (err) {
    return InternalException(
      req,
      res,
      "Unknown error while fetching universities",
    );
  }
};

export const postUniversitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    connectDB();
    const { name, cityID } = req.body;
    await University.create({ name: name, city: cityID });
    return res.sendStatus(200);
  } catch (err) {
    return InternalException(req, res, "Unknown error.");
  }
};
