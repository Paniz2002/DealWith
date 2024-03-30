import { Request, Response } from "express";
const NotFoundException = (req: Request, res: Response, message: string) => {
  return res.status(404).json({
    message: message,
  });
};

export default NotFoundException;

