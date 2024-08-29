import { Request, Response } from "express";
import connectDB from "../../config/db";
import University from "../../../models/university";
import InternalException from "../../exceptions/internal-exception";
import City from "../../../models/city";
import BadRequestException from "../../exceptions/bad-request";
import { z } from "zod";
import { validateForm } from "../../utils/validate";
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
    const valid = validateForm(
      req,
      res,
      req.body,
      z.object({ name: z.string().min(1), cityID: z.string().min(1) }),
    );
    if (!valid) {
      return BadRequestException(req, res, "Bad request: invalid input");
    }
    const alreadyExistsUni = await University.exists({ name: name }).exec();
    const cityExists = await City.exists({ _id: cityID }).exec();
    if (alreadyExistsUni || !cityExists) {
      return BadRequestException(req, res, "Bad request: invalid parameters.");
    }
    await University.create({ name: name, city: cityID });
    return res.sendStatus(200);
  } catch (err) {
    return InternalException(req, res, "Unknown error.");
  }
};
