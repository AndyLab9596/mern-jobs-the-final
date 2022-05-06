import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import CustomError from '../errors';
import User from '../models/User';

const register = async (req: Request, res: Response) => {
    const { body: { name, email, password } } = req;

    if (!name || !email || !password) {
        throw new CustomError.BadRequestError('Please provide all values !');
    }

    const isEmailExist = await User.findOne({ email });
    if (isEmailExist) {
        throw new CustomError.BadRequestError('Email is already exist !')
    }

    const user = await User.create(req.body);
    const token = user.createJWT();

    res.status(StatusCodes.CREATED).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            name: user.name,
            location: user.location
        },
        token,
        location: user.location
    })
}

const login = async (req: Request, res: Response) => {
    const { body: { email, password } } = req;

    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide all values !');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid credential')
    }

    const isPasswordCorrect = user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid credential')
    }
    const token = user.createJWT();

    res.status(StatusCodes.OK).json({
        user: {
            email: user.email,
            lastName: user.lastName,
            name: user.name,
            location: user.location
        },
        token,
        location: user.location
    })
}

const updateUser = async (req: Request, res: Response) => {
    const { email, name, lastName, location } = req.body;
    if (!email || !name || !lastName || !location) {
        throw new CustomError.BadRequestError('Please provide all values !')
    }

    const user = await User.findOne({ _id: req.user.userId });
    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid credential');
    }

    user.email = email;
    user.name = name;
    user.lastName = lastName;
    user.location = location;
    await user.save();
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({
        user,
        token,
        location: user.location
    })
}

export {
    register,
    login,
    updateUser
};

