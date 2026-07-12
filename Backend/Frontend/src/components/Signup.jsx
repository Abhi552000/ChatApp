import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useAuth } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import chatterboxIcon from "../assets/chatterbox-icon.png";

function Signup() {
  const [authUser, setAuthUser] = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password", "");
  const confirmPassword = watch("confirmPassword", "");

  const validatePasswordMatch = (value) => {
    return value === password || "Passwords do not match";
  };

  const onSubmit = async (data) => {
    const userInfo = {
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    };
    await axios
      .post("/api/user/signup", userInfo)
      .then((response) => {
        if (response.data) {
          toast.success("Signup successful. Verification code sent!");
        }
        localStorage.setItem("ChatApp", JSON.stringify(response.data));
        setAuthUser(response.data);
      })
      .catch((error) => {
        if (error.response) {
          toast.error("Error: " + error.response.data.error);
        }
      });
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
        <div className="w-full max-w-md bg-themeBgSecondary/70 backdrop-blur-xl border border-themeBorder/50 p-8 rounded-3xl flex flex-col space-y-5 relative z-10">
          {/* Chatterbox Branding Logo & Header */}
          <div className="flex flex-col items-center text-center space-y-2 select-none">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-themeBgSecondary border border-themeBorder  mb-2 overflow-hidden">
              <img
                src={chatterboxIcon}
                alt="ChatterBox Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Chatterbox
            </h1>
            <h2 className="text-sm text-themeTextSecondary">
              Create a new account to get started.
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Fullname */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-themeTextSecondary uppercase tracking-wider ml-1">
                Full Name
              </label>
              <div className="flex items-center gap-3 bg-themeBgInput border border-themeBorder/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 text-themeTextSecondary opacity-80"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input
                  type="text"
                  className="grow bg-transparent outline-none text-themeTextPrimary placeholder:text-themeTextSecondary/40 text-sm"
                  placeholder="John Doe"
                  {...register("fullname", { required: true })}
                />
              </div>
              {errors.fullname && (
                <span className="text-red-500 text-xs font-semibold block ml-1">
                  Full Name is required
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-themeTextSecondary uppercase tracking-wider ml-1">
                Email Address
              </label>
              <div className="flex items-center gap-3 bg-themeBgInput border border-themeBorder/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 text-themeTextSecondary opacity-80"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="email"
                  className="grow bg-transparent outline-none text-themeTextPrimary placeholder:text-themeTextSecondary/40 text-sm"
                  placeholder="you@example.com"
                  {...register("email", { required: true })}
                />
              </div>
              {errors.email && (
                <span className="text-red-500 text-xs font-semibold block ml-1">
                  Email is required
                </span>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-themeTextSecondary uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="flex items-center gap-3 bg-themeBgInput border border-themeBorder/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 text-themeTextSecondary opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  className="grow bg-transparent outline-none text-themeTextPrimary placeholder:text-themeTextSecondary/40 text-sm"
                  placeholder="••••••••"
                  {...register("password", { required: true })}
                />
              </div>
              {errors.password && (
                <span className="text-red-500 text-xs font-semibold block ml-1">
                  Password is required
                </span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-themeTextSecondary uppercase tracking-wider ml-1">
                Confirm Password
              </label>
              <div className="flex items-center gap-3 bg-themeBgInput border border-themeBorder/80 rounded-2xl px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 text-themeTextSecondary opacity-80"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  className="grow bg-transparent outline-none text-themeTextPrimary placeholder:text-themeTextSecondary/40 text-sm"
                  placeholder="••••••••"
                  {...register("confirmPassword", {
                    required: true,
                    validate: validatePasswordMatch,
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <span className="text-red-500 text-xs font-semibold block ml-1">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300 text-sm tracking-wide cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="text-center pt-2 border-t border-themeBorder/40">
            <p className="text-sm text-themeTextSecondary">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-2 underline-offset-4 cursor-pointer ml-1 transition-colors"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
