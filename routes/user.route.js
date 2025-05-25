import express from 'express';
import { getAllUsers,createUser,updateUser,deleteUser} from '../controllers/user.controller.js';
import {protectedRoute,adminRoute} from '../middlewares/auth.middleware.js'

const router = express.Router();
router.use(protectedRoute,adminRoute)
router.get('/' ,getAllUsers)
router.post('/' ,createUser)
router.put('/:id' ,updateUser)
router.delete('/:id' ,deleteUser)


export default router;