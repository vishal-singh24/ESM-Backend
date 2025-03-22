const express=require('express');
const {login,changePassword,resetPassword}=require('../controllers/authController')
const authMiddleware=require('../middlewares/authMiddleware');

const router=express.Router();
router.post('/login',login);
router.post('/changePassword',authMiddleware('admin'),changePassword);
router.post('/resetPassword',authMiddleware('admin'),resetPassword);

module.exports=router;