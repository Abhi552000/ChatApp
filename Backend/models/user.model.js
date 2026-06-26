import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      require: true,
    },
    confirmpassword: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    about: {
      type: String,
      default: "Hey there! I am using Messenger.",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, //createdAt & updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
