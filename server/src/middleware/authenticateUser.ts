import { Request, Response, NextFunction } from 'express';
import CustomError from '../errors/';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

declare module "express" {
    interface Request {
        user: {
            userId: Types.ObjectId
        }
    }
}

declare module "express-serve-static-core" {
    interface Request {
        user: {
            userId: Types.ObjectId
        }
    }
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader?.startsWith('Bearer ')) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = await jwt.verify(token, process.env.JWT_SECRET as string) as { userId: Types.ObjectId };
        req.user = { userId: payload.userId };
        next()
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }

}

export default auth;