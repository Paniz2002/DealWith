import { Request, Response, NextFunction } from "express";
import UnauthorizedException from "../exceptions/unauthorized";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import BadRequestException from "../exceptions/bad-request";
import UserModel from "../../models/user";
import connectDB from "../config/db";
import { getUserId } from "../utils/userID";

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await connectDB();
  //  1.   extract the token from header

  const token = req.cookies.jwt;

  //  2.   if token is not present, throw a bad request exception.
  if (!token) {
    return BadRequestException(req, res, "Bad Request: Missing JWT");
  }
  try {
    //  3.   if token is present, decode the token check for user existence
    let ret = getUserId(req, res);
    if (typeof ret !== "string") {
      return ret;
    }
    return next();
  } catch (error) {
    return UnauthorizedException(req, res, "Unauthorized: Unknown error.");
  }
};
export default authMiddleware;
