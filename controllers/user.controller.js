import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
import dotenv from "dotenv";
import { generateTokens,setCookies } from "../controllers/auth.controller.js";
dotenv.config();



export const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select("-__v");
  if (!users) {
    return next(new ApiError("لا يوجد مستخدمون", 404));
  }

  res.status(200).json({ users });
});
export const createUser = asyncHandler(async (req, res, next) => {
  const { phoneNumber } = req.body;
  const user = await User.findOne({ phoneNumber });
  if (user) {
    return next(new ApiError("المستخدم موجود بالفعل", 404));
  }
  const createUser = await User.create(req.body);
  const { accessToken, refreshToken } = generateTokens(createUser._id);
  createUser.refreshToken = refreshToken;
  await createUser.save();
  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    message: "تم الاضافة بنجاح",
  });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-__v");

  if (!user) {
    return next(new ApiError("المستخدم غير موجود", 404));
  }

  res.status(200).json({ user });
});

export const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { phoneNumber, role } = req.body;
  if (req.body.password) {
    return next(
      new ApiError(
        "لا يمكن تحديث كلمة المرور بهذه النقطة النهائية. يرجى استخدام نقطة نهاية تحديث كلمة المرور.",
        400
      )
    );
  }

  const user = await User.findByIdAndUpdate(
    id,
    { phoneNumber, role },
    { new: true, runValidators: true }
  ).select("-__v");

  if (!user) {
    return next(new ApiError("المستخدم غير موجود أو فشل التحديث", 404));
  }

  res.status(200).json({ message: "تم تحديث المستخدم بنجاح", user });
});

const clearCookies = (res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

export const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return next(new ApiError("المستخدم غير موجود أو فشل الحذف", 404));
  }
  clearCookies(res)


  res.status(204).json({ message: "تم حذف المستخدم بنجاح" });
});
