import { NextFunction, Request, Response } from 'express';

export const loggedUserController = async (req: any, res: Response) => {
    res.json(req.user);
};