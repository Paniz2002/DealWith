import { Response } from "express";
const RequestNotFoundResponse = (res: Response) => {
  return res.sendStatus(404);
};

export default RequestNotFoundResponse;
