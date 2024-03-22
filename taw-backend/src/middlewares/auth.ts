import { Request, Response, NextFunction } from 'express';
import { UnautorizedException } from '../exceptions/unauthorized';
import { ErrorCode } from '../exceptions/root';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../secret';
import prisma from '../../prisma/prisma_db_connection';

const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
    //  1.   extract the token from header
    const token = req.headers.authorization;    
    //  2.   if token is not present, throw an error of unauthorized 
    if(!token) {
        throw new UnautorizedException("Unauthorized", ErrorCode.UNAUTHORIZED) ;
    }

    try{
        //  3.   if token is present, decode the token and extract the payload
        const payload = jwt.verify(token, JWT_SECRET) as any;
        //          a. to get the user from the payload
        const user = await prisma.user.findFirst({where:{id:payload.id}});
        if(!user){
            throw new UnautorizedException("Unauthorized", ErrorCode.UNAUTHORIZED) ;
        }
        //          b. to attach the user to the current request object
        req.user = user;
        next();

    }catch(error){
        next( new UnautorizedException("Unauthorized", ErrorCode.UNAUTHORIZED) );
    }
    
};

export default authMiddleware;