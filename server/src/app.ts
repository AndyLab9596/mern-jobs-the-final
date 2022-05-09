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


const app: Application = express();


// Middleware
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'))
}
// const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
// app.use(express.static(path.resolve(__dirname, '.././client/build')));
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobRouter);
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '.././client/build', 'index.html'))
})

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
