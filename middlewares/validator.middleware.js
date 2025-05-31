import { validationResult } from "express-validator";
import ApiError from "../utils/apiError.js";

export const validatorMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return next(new ApiError({errors: errors.array()}));
    
  }
  next();
};

