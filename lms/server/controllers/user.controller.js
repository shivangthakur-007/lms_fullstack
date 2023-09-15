import errorMiddleware from "../middlewares/error.Middleware.js";
import User from "../models/user.model.js";
import appError from "../utils/error.utils.js";

const cookieOptions ={
    maxAge: 7*24*60*60*1000,
    httpOnly: true,
    secure: true
}

const register = async (req, res) => {
    const {fullName, email, password}= req.body;
    if(!fullName || !email || !password){
        return next(new appError('All fields are required', 400));
    }
    const userExists= await User.findOne({email});
    if(userExists){
        return next(new appError('Email already exixts', 400))
    }

    const user= await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://img.freepik.com/free-photo/tall-lighthouse-north-sea-cloudy-sky_181624-49637.jpg?size=626&ext=jpg',
        },

    });

    if(!user){
        return next(new appError('User Registration failed, please try again', 400))
    }
    // TODO: file upload
    await user.save();

    user.password= undefined;

    const token= await user.generateJWTToken();

    res.cookie('token', token, cookieOptions)

    res.status(201).json({
        success: true,
        message: 'User registerd successfully',
        user,
    })
};

const login =async (req, res)=> {
    try {
    const {email, password}= req.body;

    if(!email || !password){
        return next(new appError('All fields are required', 400))
    }
    const user= await user.findOne({
        email, 
        password,
    }).select('+password');

    if(!user || !user.comparePassword(password)){
        return next(new appError('Email or password does not match', 400));
    }

    const token= await user.generateJWTToken();
    user.password= undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        message: 'user login successfully',
        user
    })} catch (error) {
        return next(new appError(e.message, 500));
    }
}

const logout = (req, res)=> {
    res.cookie('token', null,{
        success: true,
        maxAge: 0,
        httpOnly: true,
    });
    res.status(200).json({
        success: true,
        message: 'User Logged Out Successfully'
    })
}
const getProfile = async(req, res)=> {
    try {
     const userID= req.user.id;
    const user= await User.findById(userID)
    
    res.status(200).json({
        success: true,
        message: 'User details',
        user
    })
    } catch (error) {
            return next(new appError('Failed to fetch profile ', 400))
    }


}

export {
    register,
    login,
    logout,
    getProfile
}