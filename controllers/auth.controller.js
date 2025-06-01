import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();
// Generate Tokens
export const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "40m",
    }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "60d",
    }
  );

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
export const register = async (req, res, next) => {
  const { phoneNumber, password } = req.body;

  const userExists = await User.findOne({ phoneNumber });
  if(req.body.role){
    return next(new ApiError("لا تستطيع تحديد دورك", 401));

  }
  if (userExists && (await userExists.comparePassword(password))) {
    const { accessToken, refreshToken } = generateTokens(
      userExists._id,
      userExists.role
    );
    userExists.refreshToken = refreshToken;
    await userExists.save();
    setCookies(res, accessToken, refreshToken);
    return res.status(201).json({
      message: "تم التسجيل مرة اخري بنجاح",
      role: userExists.role,
      accessToken,
      refreshToken
    });
  }
  const user = await User.create(req.body);
  //Generate Token For User and Store In Cookies
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  user.refreshToken = refreshToken;
  await user.save();
  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    accessToken,
    refreshToken,
    role: user.role,
  });
};

// Generate new access token function
const generateNewAccessToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });
};
// @desc    Refresh token
// @route   POST /auth/refresh-token
export const refreshToken = asyncHandler(async (req, res, next) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  if (!incomingRefreshToken) {
    return next(new ApiError("Refresh token not found in cookies", 401));
  }

  const decoded = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const userId = decoded.userId;
  const role = decoded.role;

  const user = await User.findById(userId);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    return next(
      new ApiError("Invalid or mismatched refresh token in database", 401)
    );
  }

  const newAccessToken = generateNewAccessToken(userId, role);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res
    .status(200)
    .json({
      accessToken: newAccessToken,
      message: "Access token refreshed successfully",
    });
});
