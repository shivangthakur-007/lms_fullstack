import express from 'express';
import cors from 'cors';
import cookieParser from'cookie-parser'; 
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.Middleware.js';
import rout from './routes/user.route.js';

const app= express();

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', function(req, res){
    res.send('pong')
})

app.use('/api/v1/user', rout);

app.all('*', (req, res)=>{
    res.status(404).send('OOPS!! Page not found')
})

app.use(errorMiddleware);

export default app;