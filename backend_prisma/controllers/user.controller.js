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

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "plesase fill the required fields" });
    }
    try {
        const user = await User.findOne({ email })
        if (!user) {
            res.status(400).json({ message: "invalid crrdentials" })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            res.status(400).json({ message: "Invalid Password" });
        }
        if (!user.isVerified) {
            res.status(400).json({ message: "please verify your account first" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        // set token in cookie 
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            maxAge: process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000, // 1 day
        };
        res.cookie("token", token, cookieOptions);
        res.status(200).json({ message: "USer logged in successfully" });
    }
    catch (err) {
        console.log(err);
        return res.status(400).json({ message: "there is something error in logging in user", err })
    }
};

const getUser = (req, res) => {
    try {
        res.status(200).json({
            user: req.user,
            success: true,
            message: "User fetched successfully",
        });
    } catch (err) { }
};

const logoutUser = (req, res) => {
    try {
        res.clearCookie("tooken", {
            httpOnly: true,
            secure: true,
        });
        return res.status(200).json({ message: "user logged out succesfully" });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "there us something wrong in logging out", err })
    }
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "please fill the email field" })
    };
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }
        const resetToken = crypto.randomBytes(332).toString("hex")

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        const transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "forgot password link ",
            text: "your forgotpassword link will be expire in 10 min so please click on the link ",
            html: `<b>Click Here</b>
            <br/>
            ${process.env.BASE_URL}/api/v1/users/reset-password/${resetToken}`,
        };
        await transport.sendMail(mailOptions);
        res.status(200).json({ message: "reset password link sent to your email successfully" });
    }
    catch (err) {
        res.status(400).json({ message: "there is some server error problem ", err });
    };
};

const resetPassword = async (req, res) => {
    const { token } = req.params
    const { password, rePassword } = req.body
    if (!password || !rePassword) {
        return res.status(400).json({ message: "both field required" });

        if (!token) {
            return res.status(400).json({ message: "Invalid token" });
        }
        try {
            const user = await User.findOne({
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() },
            });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            if (password !== rePassword) {
                return res.status(400).json({ message: "password do not match" });
            }
            user.password = password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;

            await user.save();

            return res.status(200).json({ message: "Password reset successfully" });
        } catch (err) {
            return res.status(400).json({ message: "server Error", err });
        };
    };
};

export { register, login, verifyUser, getUser, logoutUser, forgotPassword, resetPassword }; 