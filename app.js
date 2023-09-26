import express from 'express';
import cors from 'cors';
import cookieParser from'cookie-parser'; 
import morgan from 'morgan';
// import rout from './routes/user.route.js';
import errorMiddleware from './middlewares/error.Middleware.js';
import userRoute from './routes/user.route.js';
import courseRoute from './routes/course.route.js'
import paymentRoute from './routes/payment.route.js'
import misRoutes from './routes/miscellaneous.route.js'

const app= express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(cookieParser());

app.use(morgan('dev'));

app.use('/ping', function(req, res){
    res.send('pong')
})

app.use('/api/vi/user', userRoute);
app.use('/api/vi/courses', courseRoute);
app.use('/api/vi/payment', paymentRoute);
app.use('/api/vi', misRoutes);

app.all('*', (req, res)=>{
    res.status(404).send('OOPS!! Page not found')
})

app.use(errorMiddleware);

export default app;