import { Request, Response } from "express";
const InternalException = (req: Request, res: Response, message: string) => {
  return res.status(401).json({
    message: message,
  });
};

export default InternalException;

