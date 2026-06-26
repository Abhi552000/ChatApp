import express from "express";
import {
  allUsers,
  login,
  logout,
  signup,
  updateProfile,
  verifyOTP,
  resendOTP,
} from "../controller/user.controller.js";
import secureRoute from "../middleWare/secureRoute.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.get("/allusers", secureRoute, allUsers);
router.put("/update", secureRoute, updateProfile);

export default router;
