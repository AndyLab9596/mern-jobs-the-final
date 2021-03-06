import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import CustomError from '../errors';
import Job from '../models/Job';
import { checkPermission } from '../utils/checkPermission';
import moment from 'moment';
import { IJobSchema } from '../models/Job';


const createJob = async (req: Request, res: Response) => {
    const { body: { position, company }, user: { userId } } = req;
    if (!position || !company) {
        throw new CustomError.BadRequestError('Please provide all values !!!')
    }
    req.body.createdBy = userId;
    const job = await Job.create(req.body)
    res.status(StatusCodes.CREATED).json({ job })
}

const deleteJob = async (req: Request, res: Response) => {
    const { params: { id: jobId }, user: { userId } } = req;
    const job = await Job.findOne({ _id: jobId });
    if (!job) throw new CustomError.NotFoundError(`No job with id: ${jobId}`);
    checkPermission(userId, job.createdBy);
    await Job.findOneAndDelete({ _id: jobId });
    res.status(StatusCodes.OK).json({ msg: 'Delete job successfully !!!' })
}

const updateJob = async (req: Request, res: Response) => {
    const { body: { company, position }, params: { id: jobId }, user: { userId } } = req;
    if (!company || !position) {
        throw new CustomError.BadRequestError('Please provide all values')
    }
    const job = await Job.findOne({ _id: jobId });
    if (!job) {
        throw new CustomError.NotFoundError(`No job with id: ${jobId}`)
    }
    checkPermission(userId, job.createdBy);

    const updateJob = await Job.findOneAndUpdate({ _id: jobId, createdBy: userId }, req.body, {
        runValidators: true,
        new: true
    })

    res.status(StatusCodes.OK).json({ updateJob })
}

const getAllJobs = async (req: Request, res: Response) => {
    const {status, jobType, search, sort} = req.query;

    const queryObject: {[x: string]: any} = {
        createdBy: req.user.userId,
       
    }

    if(status && status !== 'all') {
        queryObject.status = status;
    }

    if(jobType && jobType !== 'all') {
        queryObject.jobType = jobType;
    }
    
    if(search) {
        queryObject.position = {$regex: search, $options: 'i'}
    }

    let result = Job.find(queryObject);

    if(sort === 'latest') {
        result = result.sort('-createdAt')
    }

    if(sort === 'oldest') {
        result = result.sort('createdAt')
    }

    if(sort === 'a-z') {
        result = result.sort('position')
    }

    if(sort === 'z-a') {
        result = result.sort('-position')
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * 10;

    result = result.skip(skip).limit(limit);

    const jobs = await result;
    
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);

    res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages })
}

const showStats = async (req: Request, res: Response) => {
    let defaultStats = await Job.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ])
    const finalState = defaultStats.reduce((acc, curr) => {
        const { _id: title, count } = curr
        acc[title] = count
        return acc
    }, {})

    const stats = {
        pending: finalState.pending || 0,
        interview: finalState.interview || 0,
        declined: finalState.declined || 0,
    }
    const aggregateMonthlyApplications = await Job.aggregate([
        { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
        {
            $group: {
                _id: {
                    year: {
                        $year: '$createdAt'
                    },
                    month: {
                        $month: '$createdAt'
                    }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 6 },
    ]);

    const monthlyApplications = aggregateMonthlyApplications.map((item) => {
        const { _id: { year, month }, count } = item;
        const date = moment().month(month - 1).year(year).format('MMM Y');
        return { date, count }
    }).reverse();
    
    res.status(StatusCodes.OK).json({
        stats,
        monthlyApplications
    })
}

export {
    createJob,
    deleteJob,
    updateJob,
    getAllJobs,
    showStats
}