import { Router } from "express";
import {register, login, logout, getProfile} from '../controllers/user.controller.js'
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const rout= Router();

rout.post('/register', register)
rout.post('/login', login)
rout.get('/logout', logout)
rout.get('/me', isLoggedIn, getProfile)


export default rout;