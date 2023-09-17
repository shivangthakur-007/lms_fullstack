import Course from "../models/course.model.js"
import appError from "../utils/error.utils.js";
import cloudinary from 'cloudinary';
import fs from 'fs/promises';

const getAllCourses= async function(req, res, next){
    try {
        const courses= await Course.find({}).select('-lectures');
        res.status(200).json({
            success: true,
            message: 'All Courses',
            courses,
        })
    } catch (error) {
        return next(new appError(error.message, 500))
    }
}

const getLecturesbyCourseId=async(req, res, next)=>{
    try {
        const {id}= req.params;
        const course= await Course.findById(id);
        if(!course){
            return next(new appError('Invalid course Id', 400))
        }
        
        res.status(200).json({
            success: true,
            message: 'Course lectures fetched sucessfully',
            lectures: course.lectures,
        })
    } catch (e) {
        
    }
}
const createCourses=async(req, res, next)=>{
    const {title, description, category, createdBy}= req.body;

    if(!title || !description || !category || !createdBy){
        return next(new appError('All fields are required', 400))
    }
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail :{
            public_id: 'Dummy',
            secure_url: 'Dummy'
        }
    });

    if(!course){
        return next(new appError('Could not be created, please try again', 500))
    }
    try {
     if(req.file){
        const result= await cloudinary.v2.uploader.upload(req.file.path, {
            folder: 'lms/server',
        });
        if(result){
            course.thumbnail.public_id= result.public_id;
            course.thumbnail.secure_url= result.secure_url;
        }
        // delete the file 
        fs.rm(`uploads/${req.file.filename}`);

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course created successfully',
            course,
        })
    }   
    } catch (e) {
        return next (new appError(e.message, 400));
    }
    
}

const updateCourses= async (req, res, next)=> {
    try {
        const {id}= req.params;
        const course= await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body,
            },
            {
                runValidators: true,
            }
        );

        if(!course){
            return next(new appError('Course with given id does not exist'))
        }
        res.status(200).json({
            success: true,
            meessage: 'Course Updated successfully',
            course,
        })
    } catch (e) {
        return next(new appError(e.message, 400))
    }
}

const removeCourses= async (req, res, next)=>{
    try {
        const {id}= req.params;
        const course = await Course.findById(id);

        if(!course){
                return next(new appError('Course with given id does not exist', 500))
        }

        await Course.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
            course,
        })
    } catch (e) {
        return next(new appError(e.message, 400))
    }
}

export {
    getAllCourses,
    getLecturesbyCourseId,
    createCourses,
    updateCourses,
    removeCourses,
}