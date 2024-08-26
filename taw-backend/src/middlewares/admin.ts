import {NextFunction, Request, Response} from "express";
import * as jwt from "jsonwebtoken";

import {JWT_SECRET} from "../secret";
import UnauthorizedException from "../exceptions/unauthorized";
import {getUserId} from "../utils/userID";

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const token = req.cookies.jwt;
        const payload = jwt.verify(token, JWT_SECRET) as any;
        let ret = getUserId(req, res);
        if (typeof ret !== 'string') {
            return ret;
        }
        if (payload.is_moderator) return next()
        else return UnauthorizedException(req, res, "Unauthorized");
    } catch (err) {
        return UnauthorizedException(req, res, "Unauthorized: invalid jwt.");
    }
};
