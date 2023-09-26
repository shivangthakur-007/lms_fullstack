import { Router } from "express";
import {
  addLectureToCourseById,
  createCourses,
  getAllCourses,
  getLecturesbyCourseId,
  removeCourses,
  updateCourses,
} from "../controllers/course.controllers.js";
import { authSubscriber, authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .get(getAllCourses)
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("thumbnail"),
    createCourses
  );
    
router
  .route("/:id")
  .get(isLoggedIn, getLecturesbyCourseId)
  .put(isLoggedIn, authorizedRoles("ADMIN"), updateCourses)
  .delete(isLoggedIn, authorizedRoles("ADMIN"), removeCourses)
  .post(
    isLoggedIn,
    authorizedRoles("ADMIN"),
    upload.single("lecture"),
    addLectureToCourseById
  );

export default router;

