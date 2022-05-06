import mongoose, { Types } from "mongoose";
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface IUserSchema {
    name: string;
    email: string;
    password: string;
    lastName: string;
    location: string;
    _id: Types.ObjectId;
    createJWT: () => void;
    comparePassword: (candidatePassword: string) => boolean;
}

const UserSchema = new mongoose.Schema<IUserSchema>({
    name: {
        type: String,
        minlength: 3,
        maxlength: 20,
        required: [true, 'Please provide name'],
        trim: true
    },
    email: {
        type: String,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email!'
        },
        required: [true, 'Please provide email!'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password!'],
        minlength: 6,
        select: false,
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 20,
        default: 'last name'
    },
    location: {
        type: String,
        trim: true,
        maxlength: 20,
        default: 'my city'
    }
})

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.createJWT = function () {
    return jwt.sign({userId: this._id}, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_LIFETIME
    })
}

UserSchema.methods.comparePassword = async function (candidatePassword: string) {
    const isPasswordCorrect = await bcrypt.compare(candidatePassword, this.password);
    return isPasswordCorrect;
}

export default mongoose.model('User', UserSchema)