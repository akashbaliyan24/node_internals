import cors from "cors";
import express from "express"
import connectDB from "./db/db.js";
import dotenv from "dotenv"
import cookieParser from "cookie-parser"


dotenv.config()

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin : process.env.BASE_URL,
    credentials : true,
    method : ["GET","POST","PUT","DELETE","OPTIONS"],
    allowedHeaders : ["Content-type","Authorization"]
}));

// middleware to parse incoming json request 

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookieParser());

// basic route to test the server 

app.get('/',(req,res)=>{
    res.send('API is running');
});

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
