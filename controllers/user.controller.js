import User from "../models/user.model.js";
import appError from "../utils/error.utils.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return next(new appError("All fields are required", 400));
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new appError("Email already exixts", 400));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        "https://res.cloudinary.com/dvhcu6di8/image/upload/v1691039851/lms/cuoyoiibnbb6xhldxru9.png",
    },
    // role: "USER",
  });

  if (!user) {
    return next(
      new appError("User Registration failed, please try again", 400)
    );
  }

  // console.log("file detail >", JSON.stringify(req.file));

  // TODO: file upload
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });
      console.log("result", JSON.stringify(result));
      if (result) {
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        //Remove file from server
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (e) {
      return next(
        new appError(e.message || "File not Upload, please try again", 500)
      );
    }
  }
  await user.save();

  user.password = undefined;

  const token = await user.generateJWTToken();

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    success: true,
    message: "User registerd successfully",
    user,
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new appError("All fields are required", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return next(new appError("Email or password does not match", 400));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "user login successfully",
      user,
    });
  } catch (error) {
    return next(new appError(error.message, 500));
  }
};

const logout = (req, res) => {
  try {
    res.cookie("token", null, {
      success: true,
      maxAge: 0,
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      message: "User Logged Out Successfully",
    });
  } catch (e) {
    return next(new appError(e.message, 400))
  }
};
const getProfile = async (req, res, next) => {
  try {
    const userID = req.user.id;
    const user = await User.findById(userID);
    console.log(userID);

    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    return next(new appError(error.message, 400));
  }
};
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new appError("Email is requried", 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new appError("Email not registered", 400));
  }

  const resetToken = await user.generatePasswordResetToken();

  await user.save();

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  console.log(resetPasswordURL);
  const subject = "Reset Password";
  const message = `You can reset password by clicking <a href=${resetPasswordURL} target="_blank"> Reset Your Password</a>\n If the above link does not work for some reason then copy and paste link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;
  try {
    await sendEmail(email, subject, message);

    res.status(201).json({
      success: true,
      message: `reset Password token  has been sent to ${email} successfully`,
    });
  } catch (e) {
    user.forgotPasswordExpiry = undefined; // security purpose code jab na chale
    user.forgotPasswordToken = undefined;
    return next(new appError(e.message, 500));
  }
};
const resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;

  const { password } = req.body;

  const forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new appError("Token is invalid or expired, Please try again", 400)
    );
  }
  user.password = password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordExpiry = undefined;

  user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully!",
  });
};

const changePassword = async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.user;

  if (!oldPassword || !newPassword) {
    return next(new appError("All fields are mandatory", 400));
  }
  const user = await User.findById(id).select("+password");

  if (!user) {
    return next(new appError("User doesnot exist", 400));
  }
  const isPasswordValid = await user.comparePassword(oldPassword);
  if (!isPasswordValid) {
    return next(new appError("Invalid Old Password", 400));
  }

  user.password = newPassword;

  await user.save();

  user.password = undefined;

  res.status(200).json({
    success: true,
    message: "Password changed successfully!",
  });
};

const updateUser = async (req, res, next) => {
 try{ 
  const { fullName } = req.body;
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return next(new appError("User do not exist", 400));
  }
  if (fullName) {
    user.fullName = fullName;
  }
  console.log(user.fullName)

  if (req.file) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });
        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;

          //Remove file from server
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (e) {
        return next(
          new appError(e || "File not Upload, please try again", 500)
        );
      }
    }
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: "User details uploaded successfully",
    user,
  });

}catch(e){
  return next(new appError(e.message, 500))
}
};

export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
};
