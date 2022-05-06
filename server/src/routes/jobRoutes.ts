import { Router } from "express";
import {
    createJob,
    deleteJob,
    updateJob,
    getAllJobs,
    showStats
} from '../controllers/jobController';

const router = Router();
router.route('/').post(createJob).get(getAllJobs);
router.route('/stats').get(showStats);
router.route('/:id').delete(deleteJob).patch(updateJob);

export default router;