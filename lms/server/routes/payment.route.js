import {Router} from 'express';
// import router from './course.route.js';
import { allPayments, buySubscription, cancelSubscription, getRazorpayKey, verifySubscription } from '../controllers/payment.controller.js';
import { authorizedRoles, isLoggedIn } from '../middlewares/auth.middleware.js';

const router= Router();

router
    .route('/razorpay_key')
    .get(
        isLoggedIn,
        getRazorpayKey
        );

router
    .route('/subscribe')
    .post(isLoggedIn, buySubscription)

router
    .route('/verify')
    .post(isLoggedIn, verifySubscription)

router
    .route('/unsubscribed')
    .post(isLoggedIn, cancelSubscription)

router
    .route('/')
    .get(isLoggedIn, authorizedRoles('ADMIN'), allPayments)

export default router;