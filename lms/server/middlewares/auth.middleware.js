import appError from "../utils/error.utils.js";
import jwt from "jsonwebtoken";

const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new appError("Unauthenticated", "please login again", 401));
  }

  const userDetails = await jwt.verify(token, process.env.JWT_SECRET);

  if (!userDetails) {
    return next(new appError("Unauthorized, please login to continue", 401));
  }
  // console.log(userDetails)

  req.user = userDetails;

  next();
};

const authorizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRole = req.user.role;
    // console.log(currentUserRole)
    if (!roles.includes(currentUserRole)) {
      return next(new appError("You do not have permission to access", 400));
    }

    next();
  };

  const authSubscriber= async(req, res,next)=>{
    const subscription=  req.user.subscription;
    const currentUserRole=  req.user.role;
    if(currentUserRole !== 'ADMIN' && subscription.status !=='active'){
      return next(new appError("Please subscribe to access this <route></route>", 500))
    }
  }
    export { isLoggedIn, authorizedRoles, authSubscriber };
