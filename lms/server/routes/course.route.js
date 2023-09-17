import { Router } from "express";
import { createCourses, getAllCourses, getLecturesbyCourseId, removeCourses, updateCourses } from '../controllers/course.controllers.js';
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from '../middlewares/multer.middleware.js'

const router= Router();

router.route('/')
    .get(getAllCourses)
    .post(isLoggedIn, upload.single('thumbnail'),
        createCourses)
    
    router.route('/:id')
    .get(isLoggedIn, getLecturesbyCourseId)
    .put(isLoggedIn, updateCourses)
    .delete(isLoggedIn, removeCourses);

export default router;