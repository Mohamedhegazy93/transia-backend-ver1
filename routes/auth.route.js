import express from 'express';
import { register,refreshToken} from '../controllers/auth.controller.js';
import {registerValidator,loginForAdminValidator} from '../utils/validators/auth.validator.js'
import {protectedRoute,adminRoute} from '../middlewares/auth.middleware.js'

const router = express.Router();
router.post('/register' ,registerValidator,register)
router.post('/refresh-token',protectedRoute,refreshToken)


export default router;