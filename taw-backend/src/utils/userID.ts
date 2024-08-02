import { Request, Response } from "express";
import BadRequestException from "../exceptions/bad-request";
import UnauthorizedException from "../exceptions/unauthorized";
import { JWT_SECRET } from "../secret";
import * as jwt from "jsonwebtoken";
export const getUserId = (req: Request, res: Response) => {
  const token = req.cookies.jwt;
  if (!token) {
    return BadRequestException(req, res, "Bad Request: Missing JWT");
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload._id;
  } catch (e) {
    return UnauthorizedException(req, res, "Unauthorized: Invalid JWT");
  }
};
