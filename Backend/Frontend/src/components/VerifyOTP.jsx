import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

function VerifyOTP() {
  const [authUser, setAuthUser] = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const navigate = useNavigate();
  const email = authUser?.user?.email || "";

  // Countdown timer for Resend OTP
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/user/verify-otp", {
        email,
        otp
      });

      if (response.data?.user) {
        toast.success("Email verified successfully!");
        // Update context & localStorage
        const updatedAuthUser = { ...authUser, user: response.data.user };
        setAuthUser(updatedAuthUser);
        localStorage.setItem("ChatApp", JSON.stringify(updatedAuthUser));
        navigate("/");
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await axios.post("/api/user/resend-otp", { email });
      toast.success("Verification code resent successfully");
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ChatApp");
    setAuthUser(undefined);
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-themeBgPrimary text-themeTextPrimary">
      <div className="bg-themeBgSecondary border border-themeBorder/40 p-8 rounded-2xl w-full max-w-md shadow-2xl flex flex-col space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-500">Verify Email</h1>
          <p className="text-sm text-themeTextSecondary">
            We sent a 6-digit verification code to
          </p>
          <p className="font-semibold text-themeTextPrimary break-all">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs text-themeTextSecondary uppercase tracking-wider font-semibold block text-center">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full tracking-[0.8em] font-bold text-3xl text-center py-3 bg-themeBgInput border border-themeBorder rounded-xl text-themeTextPrimary outline-none focus:border-blue-500 transition-all placeholder:opacity-20 placeholder:tracking-[0.8em]"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="flex flex-col items-center space-y-4">
          <div className="text-sm text-themeTextSecondary">
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-blue-500 font-semibold hover:underline transition-colors"
              >
                Resend verification code
              </button>
            ) : (
              <span>Resend code in <span className="font-bold text-themeTextPrimary">{timer}s</span></span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-red-500 hover:underline cursor-pointer"
          >
            Back to Login / Change Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
