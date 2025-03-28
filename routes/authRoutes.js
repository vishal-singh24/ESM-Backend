const express=require('express');
const {register,loginAdmin,loginEmployee,resetPassword}=require('../controllers/authController')
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();
router.post('/register',authMiddleware('admin'),register)
router.post('/login-employee',loginEmployee);
router.post('/login-admin',loginAdmin);
router.post('/resetPassword',authMiddleware('admin'),resetPassword);

module.exports=router;