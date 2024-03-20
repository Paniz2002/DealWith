import { NextFunction, Request, Response } from 'express';
import { SelectAllFromDB }  from '../../prisma/test';
import prisma from '../../prisma/prisma_db_connection';
import { hashSync, compareSync } from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../schema/secret';
import { BadRequestException } from '../exceptions/bad-request';
import { ErrorCode } from '../exceptions/root';

export const loginController = async (req:Request , res:Response, next:NextFunction) => {
    // await SelectAllFromDB();

    const {username,password} = req.body;

    
    let user = await prisma.user.findFirst({where:{username}});
    if (!user){
        return next( new BadRequestException("User does not exists", ErrorCode.USER_NOT_EXISTS) );        
        // return res.status(400).send({ message: "User does not exists" });
    }
    if(!compareSync(password,user.password)){
        return next( new BadRequestException("Invalid Password", ErrorCode.INCORRECT_PASSWORD) );
        // return res.status(400).send({ message: "Invalid password" });
    }

    const token = jwt.sign({
        id:user.id,
    },JWT_SECRET);

    res.json({user,token});    
}