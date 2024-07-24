import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";

import { JWT_SECRET } from "../secret";
import UnauthorizedException from "../exceptions/unauthorized";
export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.jwt;
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (payload.is_moderator) return next();
  } catch (err) {}
  return UnauthorizedException(req, res, "Unauthorized: invalid jwt.");
};
