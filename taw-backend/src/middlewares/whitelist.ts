import { NextFunction, Request, Response } from "express";

const whitelist = ["localhost", "127.0.0.1", "::1", "::ffff:172.77.0.1"];
export const whitelistMiddleware = function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // If something doesn't work, check here to see if your IP is in the whitelist
  const remoteAddr = req.socket.remoteAddress;
  if (whitelist.includes(remoteAddr!)) {
    next();
  } else {
    //console.log(req.socket.remoteAddress);
    console.error("ERROR: you are not in the whitelist your IP: " + remoteAddr);
  }
};
