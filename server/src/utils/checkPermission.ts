import { Types } from "mongoose";
import CustomError from '../errors';

const checkPermission = (userId: Types.ObjectId, resourceUserId: Types.ObjectId) => {
    if (resourceUserId.equals(userId)) return;
    throw new CustomError.UnauthorizedError('Not authorized to access this route !!!')
}

export {
    checkPermission
}