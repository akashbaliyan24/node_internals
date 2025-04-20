import jwt, { decode } from "jsonwebtoken"
import dotenv from "dotenv"
import { User } from "../models/user.model.js"

dotenv.config();

const authMiddleware = async(req,resizeBy,next)=>{
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(400).json({message : "Unauthorized : No token Found"})
        }

        const decoded = jwt.verify(token,process.env.JWT_SECERET)

        req.user = await User.findById(decoded.id).select("-password");
        next(); // move to the next route / controller
    } catch(err){
        return res.status(400).json({message :"Unauthorized :invalid token "})
    }
}

export default authMiddleware;