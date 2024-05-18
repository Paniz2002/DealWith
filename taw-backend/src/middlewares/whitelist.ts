import { NextFunction, Request, Response } from "express";
import UnautorizedException from "../exceptions/unauthorized";

const whitelist = ["localhost", "127.0.0.1", "::1", "::ffff:172.77.0.1"];
export const whitelistMiddleware = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // If something doesn't work, check here to see if your IP is in the whitelist
  const remoteAddr = req.socket.remoteAddress;
  if (!whitelist.includes(remoteAddr!)) {
    return UnautorizedException(
      req,
      res,
      "Unauthorized: your IP address is not in the whitelist.",
    );
  }
  next();
};
