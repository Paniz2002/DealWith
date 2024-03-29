import { Request, Response, NextFunction } from "express";
import { UnautorizedException } from "../exceptions/unauthorized";
import { ErrorCode } from "../exceptions/root";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secret";
import prisma from "../../prisma/prisma_db_connection";

const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  //  1.   extract the token from header
  const token = req.headers.authorization;
  //  2.   if token is not present, throw an error of unauthorized
  if (!token) {
    throw new UnautorizedException(
      "Unauthorized: Missing JWT",
      ErrorCode.UNAUTHORIZED,
    );
  }

  try {
    //  3.   if token is present, decode the token and extract the payload
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findFirst({
      where: { id: payload.id, role: payload.role },
    });
    if (!user) {
      throw new UnautorizedException(
        "Unauthorized: Invalid JWT",
        ErrorCode.UNAUTHORIZED,
      );
    }
    next();
  } catch (error) {
    next(
      new UnautorizedException(
        "Unauthorized: Unknown error.",
        ErrorCode.UNAUTHORIZED,
      ),
    );
  }
};

export default authMiddleware;
