import { User } from "../models/user.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import bcrypt from "bcrypt";

dotenv.config();


const register = async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "please fill all the required fields" });
    };

    try {
        const user = await User.findOne({ email });

        if (user) {
            res.status(400).json({ message: "User already exists" })
        }
        const newUser = new User({
            username,
            email,
            password,
            role,
        });
        const gnerateVerificationToken = crypto.randomBytes(32).toString("hex");
        newUser.verificationToken = gnerateVerificationToken;
        await newUser.save();
        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: newUser.email,
            subject: "verification link form Akash",
            text: "hello please verify your email",
            html: `<b>click here </b>
            <br/>
            ${process.env.BASE_URL}/api/v1/users/verify/${gnerateVerificationToken}`,
        };
        const result = await transport.sendMail(mailOptions);

        console.log("email sent ", result)
        return res.status(200).json({ message: "User created successfully" })
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Server error ", err })
    }
};

const verifyUser = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ message: "Invalif token" })
    }
    try {
        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: "Invalid token " })
        };
        // mark user as verified and clear the token
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        res.status(200).json({ message: "Email verified successfully" })
    }
    catch (err) {
        return res.status(400).json({ message: "something went wrong during verification " })
    }
};