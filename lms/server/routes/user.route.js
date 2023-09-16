import { Router } from "express";
import {register, login, logout, getProfile} from '../controllers/user.controller.js'
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const rout= Router();

rout.post('/register', upload.single('avatar'), register)
rout.post('/login', login)
rout.get('/logout', logout)
rout.get('/me', isLoggedIn, getProfile)
rout.post('/forgot/password', forgotPassword)
rout.post('/reset-password', resetPassword)

export default rout;