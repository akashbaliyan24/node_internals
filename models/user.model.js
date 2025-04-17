import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
    {
        username : {
            type : String,
    } ,
    email : {
        type : String ,
        unique : true ,
    } , 
    password : {
        type : String,
    },
    role : {
        type : String ,
        enum : ["user" , "admin"] , 
        default : "user" ,
        required : true,
    },
    idverified : {
        type : Boolean,
    },
    passwordResetToken :{
        type : String ,
    },
    passwordResetExpires : {
        type : Date,
    },
    verificationToken : {
        type : String,
    }
},
{
    Timestamp : true , 
} , 
);

userSchema.pre("save",async function(next){
    try {
        if(this.isModified("password")) {
            const hasedPassword = await bcrypt.hash(this.password,10);
            this.password = hasedPassword;
        }
        next();
    }
    catch(err){}
});

export const User = mongoose.model("User",userSchema);