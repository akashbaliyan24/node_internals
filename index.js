import cors from "cors";
import express from "express"
import connectDB from "./db/db.js";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import userRoutes from "./routes/user.routes.js"

dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin : process.env.BASE_URL|| 5173,
    credentials : true,
    method : ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders : ["Content-type","Authorization"]
}));

// middleware to parse incoming json request 

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

// basic route to test the server 

app.use("/api/v1/users",userRoutes);

// connect to db and then start the server 

connectDB()
.then(()=>{
    app.listen(port,()=>{
        console.log(`server is running on port ${port}`);
    });
})
.catch((err)=>{
    console.log("connection failed " , err);
})
