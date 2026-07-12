import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthProvider";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import chatterboxIcon from "../assets/chatterbox-icon.png";

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
    <div className="h-screen w-screen flex bg-themeBgPrimary text-themeTextPrimary relative overflow-hidden">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left Panel: Branding Logo (hidden on mobile, takes 50% on md+) */}
      <div className="hidden md:flex md:w-[50%] h-full relative border-r border-themeBorder/40 overflow-hidden items-center justify-center p-8">
        <div className="relative max-w-sm w-full flex flex-col justify-center items-center select-none text-center space-y-8">
          <h1 className="text-4xl font-extrabold tracking-wide chatterbox-brand-title">
            ChatterBox
          </h1>
          <img
            src={chatterboxIcon}
            alt="ChatterBox Logo"
            className="w-56 h-56 object-contain"
          />
          <p className="text-lg font-medium text-themeTextSecondary">
            Connect. Share. Chat.
          </p>
        </div>
      </div>

      {/* Right Panel: Form (100% on mobile, 50% on md+) */}
      <div className="flex-1 flex items-center justify-center p-4 relative h-full">
        <div className="w-full max-w-md bg-themeBgSecondary/70 backdrop-blur-xl border border-themeBorder/50 p-8 rounded-3xl shadow-2xl flex flex-col space-y-6 relative z-10">
          
          {/* Chatterbox Branding Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2 select-none">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-themeBgSecondary border border-themeBorder shadow-md mb-2 overflow-hidden">
              <img
                src={chatterboxIcon}
                alt="ChatterBox Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Verify Email
            </h1>
            <p className="text-sm text-themeTextSecondary">
              We sent a 6-digit verification code to
            </p>
            <p className="font-semibold text-themeTextPrimary break-all text-sm mt-0.5">{email}</p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs text-themeTextSecondary uppercase tracking-wider font-bold block text-center">
                Enter 6-Digit Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full tracking-[0.8em] font-bold text-3xl text-center py-3.5 bg-themeBgInput border border-themeBorder/85 rounded-2xl text-themeTextPrimary outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:opacity-25 placeholder:tracking-[0.8em]"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 text-sm tracking-wide disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="flex flex-col items-center space-y-4 pt-2 border-t border-themeBorder/40">
            <div className="text-sm text-themeTextSecondary">
              {canResend ? (
                <button
                  onClick={handleResend}
                  disabled={loading}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-2 underline-offset-4 cursor-pointer transition-colors"
                >
                  Resend verification code
                </button>
              ) : (
                <span>Resend code in <span className="font-bold text-themeTextPrimary">{timer}s</span></span>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="text-xs text-red-500/90 hover:text-red-400 font-semibold underline decoration-2 underline-offset-4 cursor-pointer transition-colors"
            >
              Back to Login / Change Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;
