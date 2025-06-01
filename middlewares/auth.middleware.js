import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.model.js";
import ApiError from "../utils/apiError.js";

export const protectedRoute = async (req, res, next) => {
 
    const token = req.cookies.accessToken;
    if (!token) {
      return next(new ApiError("لا يمكنك تنفيذ هذا الطلب", 404));
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
      return next(new ApiError("لا يمكنك تنفيذ هذا الطلب", 404));
    }
    req.user = decoded;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return next(new ApiError("لا يمكنك تنفيذ هذا الطلب", 401));
    }
  
  
  next();
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role !== "admin") {
    return next(
      new ApiError("غير مسموح لك بالوصول الي هذا الرابط(admins only)", 401)
    );
  }

  next();
};
