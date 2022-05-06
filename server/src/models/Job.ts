import mongoose, { Schema, SchemaTypes, Types } from "mongoose";

interface IJobSchema {
    company: string,
    position: string,
    status: 'interview' | 'declined' | 'pending',
    jobType: 'full-time' | 'part-time' | 'remote' | 'internship',
    jobLocation: string,
    createdBy: Types.ObjectId,
    _id: Types.ObjectId
}

const JobSchema = new mongoose.Schema<IJobSchema>({
    company: {
        type: String,
        required: [true, 'Please provide company !!!'],
        maxlength: 50
    },
    position: {
        type: String,
        required: [true, 'Please provide position !!!'],
        maxlength: 100
    },
    status: {
        type: String,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending'
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'remote', 'internship'],
        default: 'full-time'
    },
    jobLocation: {
        type: String,
        default: 'my city',
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide user']
    }
}, { timestamps: true })

export default mongoose.model('Job', JobSchema)