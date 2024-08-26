import { Request, Response } from "express";
import BadRequestException from "../exceptions/bad-request";
import UnauthorizedException from "../exceptions/unauthorized";
import { JWT_SECRET } from "../secret";
import * as jwt from "jsonwebtoken";
import User from "../../models/user";
/**
 * Computes the user _id from the request jwt cookie
 * @return user _id
 * @params req: Request request object
 * @params req: Request response object
 * @throws BadRequestException if missing jwt from request cookie.
 * @throws UnauthorizedException if invalid jwt from request cookie.
 */
export const getUserId = (req: Request, res: Response) => {
  const token = req.cookies.jwt;
  if (!token) {
    return BadRequestException(req, res, "Bad Request: Missing JWT");
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if(!User.findById(payload._id.toString())){
        return UnauthorizedException(req, res, "Unauthorized: Invalid JWT 1");
    }
    return payload._id.toString();
  } catch (e) {
    return UnauthorizedException(req, res, "Unauthorized: Invalid JWT 2");
  }
};
