import {validatorMiddleware} from '../../middlewares/validator.middleware.js'
import { check } from 'express-validator';
export const registerValidator = [
    check('phoneNumber')
        .notEmpty()
        .withMessage('رقم الهاتف مطلوب')
        .isMobilePhone('any') // Validates if it's a mobile phone number (any locale)
        .withMessage('صيغة رقم الهاتف غير صحيحة')
        .isLength({ min: 7, max: 20 })
        .withMessage('رقم الهاتف يجب أن يكون بين 7 و 20 رقماً'),
    check('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة')
        .isLength({ min: 6 })
        .withMessage('كلمة المرور يجب ألا تقل عن 6 أحرف/أرقام'),
    validatorMiddleware, // Apply the middleware to check for errors
];

/**
 * @desc Validation rules for admin login
 */
export const loginForAdminValidator = [
    check('phoneNumber')
        .notEmpty()
        .withMessage('رقم الهاتف مطلوب')
        .isMobilePhone('any') // Validates if it's a mobile phone number (any locale)
        .withMessage('صيغة رقم الهاتف غير صحيحة'),
    check('password')
        .notEmpty()
        .withMessage('كلمة المرور مطلوبة'),
    validatorMiddleware, // Apply the middleware to check for errors
];