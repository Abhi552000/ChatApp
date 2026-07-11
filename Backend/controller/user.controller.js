import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.js";
import { sendOTPEmail } from "../services/email.service.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";


export const signup = async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;
  try {
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already registered" });
    }
    // Hashing the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    const newUser = new User({
      fullname,
      email,
      password: hashPassword,
      isVerified: false,
      otp,
      otpExpiry,
    });
    await newUser.save();

    if (newUser) {
      sendOTPEmail(newUser.email, newUser.fullname, otp).catch((error) => {
        console.error("Background signup OTP email error:", error);
      });
      res.status(201).json({
        message: "User registered successfully. Please verify your email.",
        user: {
          _id: newUser._id,
          fullname: newUser.fullname,
          email: newUser.email,
          avatar: newUser.avatar,
          about: newUser.about,
          isVerified: false,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid user credential" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid user credential" });
    }

    // Check if verified
    if (!user.isVerified) {
      // Regenerate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();

      sendOTPEmail(user.email, user.fullname, otp).catch((error) => {
        console.error("Background login OTP email error:", error);
      });

      return res.status(400).json({
        error: "Email not verified. A verification code has been sent to your email.",
        unverified: true,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar,
          about: user.about,
          isVerified: false,
        },
      });
    }

    createTokenAndSaveCookie(user._id, res);
    res.status(201).json({
      message: "User logged in successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        about: user.about,
        isVerified: true,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(201).json({ message: "User logged out successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const allUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all users except current
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // Fetch last message and unread count for each user
    const usersWithChatInfo = await Promise.all(
      users.map(async (user) => {
        // Find the conversation between loggedInUser and this user
        const conversation = await Conversation.findOne({
          members: { $all: [loggedInUserId, user._id] },
        }).populate({
          path: "messages",
          options: { sort: { createdAt: -1 }, limit: 1 } // Get only the latest message
        });

        const lastMessage = conversation && conversation.messages.length > 0 
          ? conversation.messages[0] 
          : null;

        // Count unread messages sent by this user to the loggedInUser
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          seen: false,
        });

        return {
          ...user.toObject(),
          lastMessage,
          unreadCount,
        };
      })
    );

    res.status(201).json(usersWithChatInfo);
  } catch (error) {
    console.log("Error in allUsers Controller: " + error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, about, avatar } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullname, about, avatar },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log("Error in updateProfile: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User email is already verified" });
    }

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ error: "Verification code has expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    createTokenAndSaveCookie(user._id, res);

    res.status(200).json({
      message: "Email verified successfully",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        avatar: user.avatar,
        about: user.about,
        isVerified: true,
      },
    });
  } catch (error) {
    console.log("Error in verifyOTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "User email is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    sendOTPEmail(user.email, user.fullname, otp).catch((error) => {
      console.error("Background resend OTP email error:", error);
    });

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    console.log("Error in resendOTP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
