import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
// Generate Tokens
// Generate Tokens
export const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Set tokens in cookie
export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents CSRF attack
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
//Register Controller
export const register = async (req, res,next) => {
	const { phoneNumber,password} = req.body;

    const userExists = await User.findOne({ phoneNumber });
    // if(req.body.role){
    //   return next(new ApiError("لا تستطيع تحديد دورك", 401));

    // }
    if (userExists&&(await userExists.comparePassword(password))) {
      const { accessToken, refreshToken } = generateTokens(userExists._id);
      userExists.refreshToken=refreshToken
      await userExists.save()
      setCookies(res, accessToken, refreshToken);  
     return res.status(201).json({
       message:'تم التسجيل مرة اخري بنجاح'
       
      }); 
      
    }
    const user = await User.create(req.body);
//Generate Token For User and Store In Cookies
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken=refreshToken
    await user.save()
    setCookies(res, accessToken, refreshToken);  

    res.status(201).json({
      accessToken,
      refreshToken
  
     
    });
  } 


// Generate new access token function
const generateNewAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });
};
// @desc    Refresh token
// @route   POST /auth/refresh-token
export const refreshToken = asyncHandler(async (req, res, next) => {
  // 1. استخراج الـ Refresh Token من الكوكيز
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
      // asyncHandler سيلتقط هذا الخطأ ويُمرره للـ error handling middleware
      return next(new ApiError("Refresh token not found in cookies", 401));
  }

  // 2. التحقق من صلاحية الـ Refresh Token المستلم
  // إذا كان التوكن غير صالح (Invalid signature, expired, etc.)، فإن jwt.verify() سيُلقي (throw) خطأ.
  // و asyncHandler سيلتقط هذا الخطأ تلقائياً ويمرره إلى الـ error handling middleware.
  const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const userId = decoded.userId;

  // 3. البحث عن المستخدم في قاعدة البيانات والتحقق من مطابقة الـ refreshToken
  const user = await User.findById(userId);

  if (!user || user.refreshToken !== incomingRefreshToken) {
      // إذا لم يتم العثور على المستخدم أو كان الـ refreshToken لا يتطابق
      // هذا الخطأ أيضاً سيلتقطه asyncHandler
      return next(new ApiError("Invalid or mismatched refresh token in database", 401));
  }

  // 4. توليد Access Token جديد
  const newAccessToken = generateNewAccessToken(userId);

  // 5. تعيين Access Token الجديد في الكوكيز
  res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
  });

  // 6. إرسال الاستجابة بنجاح
  res.status(200).json({ accessToken: newAccessToken, message: "Access token refreshed successfully" });
});

