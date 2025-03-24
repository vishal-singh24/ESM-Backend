const express=require('express');
const {register,login,resetPassword}=require('../controllers/authController')
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();
router.post('/register',authMiddleware('admin'),register)
router.post('/login',login);
router.post('/resetPassword',authMiddleware('admin'),resetPassword);

module.exports=router;