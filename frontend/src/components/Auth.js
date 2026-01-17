import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, LogIn, UserPlus, Phone, CheckCircle, FileText } from "lucide-react";
import { useAuth } from "../App";

import Navigation from "./Navigation";
import Footer from "./Footer";

const Auth = () => {
  const navigate = useNavigate();
  const { user, login, logout, register, updateUser, loading, setUser } = useAuth();

  // Auth Mode and OTP States
  const [authMode, setAuthMode] = useState("login"); // login, signup, otp
  const [authStep, setAuthStep] = useState("credentials"); // credentials, otp, details
  const [loginMethod, setLoginMethod] = useState("phone"); // phone or email
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [signupData, setSignupData] = useState({ name: "", email: "", gender: "", dob: "", address: "", password: "" });
  const [otpTimer, setOtpTimer] = useState(0);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const otpInputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const [error, setError] = useState("");

  const handleSendOtp = () => {
    let identifier = loginMethod === "phone" ? phoneNumber : email;
    let isValid = false;
    if (loginMethod === "phone") {
      isValid = identifier.length === 10 && /^\d+$/.test(identifier);
      if (!isValid) {
        setError("Please enter a valid 10-digit phone number");
        return;
      }
    } else {
      isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      if (!isValid) {
        setError("Please enter a valid email address");
        return;
      }
    }

    const registeredPhone = localStorage.getItem('user_phone');
    const registeredEmail = localStorage.getItem('user_email');
    const storedPassword = localStorage.getItem('user_password');

    if (authMode === "login") {
      if (loginMethod === "phone") {
        if (!registeredPhone || identifier !== registeredPhone) {
          setError("This number is not registered. Please sign up first.");
          return;
        }
      } else {
        if (!registeredEmail || identifier !== registeredEmail) {
          setError("This email is not registered. Please sign up first.");
          return;
        }
      }
      if (password !== storedPassword) {
        setError("Incorrect password.");
        return;
      }
      // For login, send OTP after credentials
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      console.log("Generated OTP:", otp); // For testing purposes
      setAuthStep("otp");
      setOtpTimer(30);
      setError("");
    } else if (authMode === "signup") {
      if (loginMethod === "phone") {
        if (registeredPhone && identifier === registeredPhone) {
          setError("This number is already registered. Please sign in instead.");
          return;
        }
      } else {
        if (registeredEmail && identifier === registeredEmail) {
          setError("This email is already registered. Please sign in instead.");
          return;
        }
      }
      // For signup, go to details after credentials validation
      setAuthStep("details");
      setError("");
    }
  };

  const handleSendOtpFromDetails = () => {
    // Send OTP after personal details
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    console.log("Generated OTP:", otp); // For testing purposes
    setAuthStep("otp");
    setOtpTimer(30);
    setError("");
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpValues.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    // For demo: accept any 6-digit OTP or the generated one
    if (enteredOtp === generatedOtp || enteredOtp === "123456") {
      if (authMode === "signup") {
        handleCompleteSignup();
      } else {
        // Login: already checked in handleSendOtp, so proceed to login
        try {
          await login("kminchelle", "0lelplR");
          navigate("/profile");
        } catch (err) {
          setError("Login failed. Demo mode activated.");
        }
      }
    } else {
      setError("Invalid OTP. Please try again. (Hint: Use 123456 for demo)");
    }
  };

  const handleCompleteSignup = async () => {
    if (!signupData.name.trim() || !signupData.email.trim() || !signupData.password.trim()) {
      setError("Please enter your name, email and password");
      return;
    }
    // Save signup data first
    const profileData = {
      name: signupData.name,
      email: signupData.email,
      gender: signupData.gender,
      dob: signupData.dob,
      address: signupData.address,
    };
    localStorage.setItem('user_profile', JSON.stringify(profileData));
    if (loginMethod === "phone") {
      localStorage.setItem('user_phone', phoneNumber);
    } else {
      localStorage.setItem('user_email', email);
    }
    localStorage.setItem('user_password', signupData.password); // Save password for future login

    try {
      // In production, this would register the user
      await login("kminchelle", "0lelplR");
      // After login, update the user name
      await updateUser(1, { firstName: signupData.name.split(' ')[0], lastName: signupData.name.split(' ')[1] || '' }); // Assuming user id is 1
      navigate("/profile");
    } catch (err) {
      setError("Account created! (Demo mode)");
      navigate("/profile");
    }
  };

  const resetAuth = () => {
    setAuthStep("credentials");
    setOtpValues(["", "", "", "", "", ""]);
    setPhoneNumber("");
    setEmail("");
    setPassword("");
    setSignupData({ name: "", email: "", gender: "", dob: "", address: "", password: "" });
    setError("");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (user) {
    navigate("/profile");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4 pt-24">
        <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {authMode === "login" ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
              </div>
              <h2 className="text-2xl font-bold mb-1">
                {authMode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-violet-200 text-sm">
                {authStep === "credentials" && "Enter your login details"}
                {authStep === "otp" && `Verify with OTP sent to your ${loginMethod === "phone" ? "phone" : "email"}`}
                {authStep === "details" && (authMode === "signup" ? "Complete your profile information" : "Complete your profile")}
              </p>
            </div>
          </div>

          <CardContent className="p-6">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 mb-4">
                {error}
              </div>
            )}

            {/* Credentials Step */}
            {authStep === "credentials" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Login Method</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="loginMethod"
                        value="phone"
                        checked={loginMethod === "phone"}
                        onChange={(e) => { setLoginMethod(e.target.value); setEmail(""); }}
                        className="text-violet-600 focus:ring-violet-600"
                      />
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Phone Number</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="loginMethod"
                        value="email"
                        checked={loginMethod === "email"}
                        onChange={(e) => { setLoginMethod(e.target.value); setPhoneNumber(""); }}
                        className="text-violet-600 focus:ring-violet-600"
                      />
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Email Address</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">{loginMethod === "phone" ? "Phone Number" : "Email Address"}</Label>
                  {loginMethod === "phone" ? (
                    <div className="flex">
                      <div className="flex items-center justify-center px-4 bg-gray-100 border border-r-0 border-gray-200 rounded-l-lg text-gray-600 font-medium">
                        +91
                      </div>
                      <Input
                        type="tel"
                        placeholder="Enter 10-digit number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="h-12 rounded-l-none rounded-r-lg border-gray-200 focus:ring-2 focus:ring-violet-600 text-lg tracking-wider"
                        autoComplete="tel"
                      />
                    </div>
                  ) : (
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                      autoComplete="email"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  onClick={handleSendOtp}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Send OTP
                </Button>
              </div>
            )}

            {/* OTP Verification Step */}
            {authStep === "otp" && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <p className="text-gray-600 text-sm">
                    OTP sent to <span className="font-semibold">{loginMethod === "phone" ? `+91 ${phoneNumber}` : email}</span>
                  </p>
                  <button onClick={() => setAuthStep("credentials")} className="text-violet-600 text-sm font-medium hover:underline">
                    Change {loginMethod === "phone" ? "number" : "email"}
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 text-center block">Enter 6-digit OTP</Label>
                  <div className="flex justify-center gap-2">
                    {otpValues.map((value, index) => (
                      <Input
                        key={index}
                        ref={otpInputRefs[index]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={value}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 text-center text-xl font-bold border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-600"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify OTP
                </Button>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-gray-500 text-sm">Resend OTP in <span className="font-semibold text-violet-600">{otpTimer}s</span></p>
                  ) : (
                    <button onClick={handleSendOtp} className="text-violet-600 font-semibold text-sm hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>

                <p className="text-center text-xs text-gray-400">
                  Demo: Use OTP <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">123456</span> for testing
                </p>
              </div>
            )}

            {/* Complete Profile Step (Signup only) */}
            {authStep === "details" && (
              <div className="space-y-6">
                <div className="text-center mb-2">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-emerald-600 font-semibold">Credentials verified!</p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Full Name *</Label>
                      <Input
                        placeholder="Enter your name"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Email *</Label>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                        autoComplete="email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Password *</Label>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Gender</Label>
                      <select
                        value={signupData.gender}
                        onChange={(e) => setSignupData({ ...signupData, gender: e.target.value })}
                        className="h-12 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-violet-600 px-3"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Date of Birth</Label>
                      <Input
                        type="date"
                        value={signupData.dob}
                        onChange={(e) => setSignupData({ ...signupData, dob: e.target.value })}
                        className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Address (Optional)</Label>
                    <Input
                      placeholder="Enter your address"
                      value={signupData.address}
                      onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                      className="h-12 rounded-lg border-gray-200 focus:ring-2 focus:ring-violet-600"
                      autoComplete="address"
                    />
                  </div>
                </div>

                <Button
                  onClick={authMode === "signup" ? handleSendOtpFromDetails : handleCompleteSignup}
                  className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold"
                >
                  {authMode === "signup" ? "Send OTP" : "Complete Signup"}
                </Button>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="px-6 pb-6">
            <p className="text-center text-sm text-gray-500">
              {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); resetAuth(); }}
                className="text-violet-600 font-semibold hover:underline"
              >
                {authMode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
            <p className="text-center text-xs text-gray-400 mt-4">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-violet-600 hover:underline">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;