import { Request, Response, NextFunction } from "express";
import UnautorizedException from "../exceptions/unauthorized";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
// import prisma from "../../prisma/prisma_db_connection";
import BadRequestException from "../exceptions/bad-request";
import UserModel from "../../models/user";
import connectDB from "../../config/db";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  connectDB();
  //  1.   extract the token from header
  const token = req.headers.authorization;
  //  2.   if token is not present, throw a bad request exception.
  if (!token) {
    // Next prints to console ... because reasons.
    // So i modified it accordingly
    return BadRequestException(req, res, "Bad Request: Missing JWT");
  }

  try {
    //  3.   if token is present, decode the token and extract the payload
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await UserModel.findOne({
      'username': payload.username
    });
    if (!user) {
      return UnautorizedException(req, res, "Unauthorized: Invalid JWT");
    }
    next();
  } catch (error) {
    return UnautorizedException(req, res, "Unauthorized: Unknown error.");
  }
};

export default authMiddleware;
