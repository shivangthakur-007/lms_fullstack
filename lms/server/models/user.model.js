import { Schema, model } from "mongoose";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

const  userSchema= new Schema({
    fullName: {
        type: 'String',
        required: [true, 'Name is required'],
        minLength: [5, 'Name should be atleast 5 characters'],
        maxLength: [50, 'Name should be less than 50 characters'],
        lowerCase: true,
        trim: true,
    },
    email: {
        type: 'String',
        required: [true, 'Name is required'],
        lowercase: true,
        trim: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill in a valid email address'],
    },
    password:{
        type: 'String',
        required: [true, 'Password is required'],
        minLength: [8, 'Password should be atleast 8 characters.'],
        select: false,
    },
    avatar:{
        public_id: {
            type: 'String',
        },
        secure_url: {
            type: 'String'
        }
    },
    role: {
        type: 'String', 
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    },
    fogotPasswordToken: String,
    forgotPasswordExpiry: Date
},{
    timestamps: true
});
userSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password=await bcrypt.hash(this.password, 10)
})

userSchema.methods={
        generateJWTToken: async function(){
            return await jwt.sign(
                {id: this._id, email: this._email, subscription: this._subscription, role:this._role 
            },
            process.env.JWT_SECRET,{
                expiresIn: process.env.JWT_EXPIRY,
            })
        },
        comparePassword: async function(plainTextPassword){
                return await bcrypt.compare(plainTextPassword, this.password)
        }
}
const User= model('User', userSchema);

export default User;