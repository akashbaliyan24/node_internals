import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const url = process.env.DB_URL ;
const connectDB = async()=>{
    try {
        await mongoose.connect(url);
        console.log("connected to the database");
    }
    catch(error){
        console.log("connection failed", error)
    };
};

export default connectDB;