import express, { Application, Request, Response } from 'express';
import "express-async-errors";
import dotenv from 'dotenv';
dotenv.config()
import notFoundMiddleware from './middleware/not-found';
import errorHandlerMiddleware from './middleware/error-handler';
import authenticateUser from './middleware/authenticateUser';
import morgan from 'morgan';
import cors from "cors";
import authRouter from './routes/authRoutes';
import jobRouter from './routes/jobRoutes';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import connectDb from './db/connectDb';
import helmet from 'helmet'
import xss from 'xss-clean'
import mongoSanitize from 'express-mongo-sanitize'
import rateLimiter from 'express-rate-limit'

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many requests from this IP, please try again after 15 minutes',
})

const app: Application = express();


// Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}
// const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(apiLimiter);
// app.use(express.static(path.resolve(__dirname, '.././client/build')));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobRouter);
// app.get('*', (req: Request, res: Response) => {
//     res.sendFile(path.resolve(__dirname, '.././client/build', 'index.html'))
// })

// Custom Middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
const start = async () => {
    try {
        await connectDb(process.env.MONGO_URL as string);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`)
        }).on('error', function (err) {
            process.kill(process.pid)
        })
    }
    catch (error) {
        console.log(error)
    }
}

start();
