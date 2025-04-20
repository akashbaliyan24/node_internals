import express from "express"
import authMiddleware from "../middleware/user.middleware.js"
const Router = express.Router();

import {register, login, verifyUser, getUser, logoutUser, forgotPassword, resetPassword} from "../controllers/user.controller.js"

Router.post("/register",register);
Router.get("/verify/:token",verifyUser);
Router.post("/login",login);
Router.get("/profile",authMiddleware,getUser);
Router.post("/forgot-password",forgotPassword);
Router.post("/reset-password/:token",resetPassword);
Router.get("/logout",logoutUser)
Router.get("/test",(req,res)=>{
    res.send("user route is working ");
})
export default Router;