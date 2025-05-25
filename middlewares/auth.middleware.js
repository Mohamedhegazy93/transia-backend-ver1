import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";


export const protectedRoute = async (req, res, next) => {
 
  try {
    const token = req.cookies.accessToken;
    // if (!token) {
    //   return res.json({ message: "you cant perform this action" });
    // }

    // const token = authorization.split(" ")[0].slice(0, -1).split("=")[1];
    if (!token) {
      return next(new ApiError("لا يمكنك تنفيذ هذا الطلب", 404));
    }
    console.log(token);
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    if(!decoded){
      return next(new ApiError("لا يمكنك تنفيذ هذا الطلب", 404));

    }

    // console.log(req.user.userId);
    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new ApiError("لا يمكنك تنفيذ هذا الطلب", 401));
    }
  } catch (error) {
    console.log(error);
    return res.json({ message: error.message });
  }
  next();
  } 

  export const adminRoute = async (req, res, next) => {
    if(req.user){
      const user = await User.findById(req.user.userId);
      if (user.role !== "admin") {
        return next(new ApiError("غير مسموح لك بالوصول الي هذا الرابط(admins only)", 401));
      }
    }
  
  
    next();
  };
 
