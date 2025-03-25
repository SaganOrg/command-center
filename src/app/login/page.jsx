"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Mic, User, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";


// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetMessage, setResetMessage] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const navigate = useRouter();

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (!isValidEmail(loginEmail)) {
      setAuthError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (loginPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    const { data: {user }, error: userError } = await supabase.from("users").select("*").eq("id", data.user.id);

    if (userError) {
      setAuthError(error.message || "Login failed. Please try again.");
      setIsLoading(false);
      return;
    }

    if (error) {
      setAuthError(error.message || "Login failed. Please try again.");
      setIsLoading(false);
      return;
    }

    

    console.log("Logged in user:", data.user);
    const role = user.role;
    if (role === "executive") {
      navigate.push("/voice"); // Adjust route as needed
    } else if (role === "assistant") {
      navigate.push("/voice"); // Adjust route as needed
    } else {
      navigate.push("/"); // Default route if role isn't set
    }
    setIsLoading(false);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    if (signupName.length < 2) {
      setAuthError("Name must be at least 2 characters");
      setIsLoading(false);
      return;
    }
    if (!isValidEmail(signupEmail)) {
      setAuthError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    if (signupPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail,
      password: signupPassword,
      // options: {
      //   data: {
      //     role: "executive", // Signup from this page is for employees
      //   },
      // },
    });

    if (data.user) {
      const userId = data.user.id; // The ID of the newly signed-up assistant

      const { error: updateError } = await supabase
        .from("users")
        .insert({ id: userId, email: data.user.email, role:"executive", full_name:signupName })
        .select();

      if (updateError) {
        console.error(
          "Error updating assistant_id in users table:",
          updateError
        );
        setAuthError(
          "Please try again later"
        );
        setIsLoading(false);
        return;
      }
    }

    if (error) {
      setAuthError(error.message || "Signup failed. Please try again.");
      setIsLoading(false);
      return;
    }

    console.log("Signed up employee:", data.user);
    setAuthError("Signup success as an executive");
    setIsLoading(false);
    navigate.push("/");
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setResetMessage(null);

    if (!isValidEmail(forgotEmail)) {
      setAuthError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      // redirectTo: 'http://localhost:3000/reset-password', // Adjust this URL
      redirectTo:'https://sagan-command-center.vercel.app/reset-password'
    });

    if (error) {
      setAuthError(
        error.message || "Failed to send reset email. Please try again."
      );
      setIsLoading(false);
      return;
    }

    setResetMessage("Password reset email sent! Check your inbox.");
    setIsLoading(false);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setShowForgotPassword(false);
    setAuthError(null);
    setResetMessage(null);
    setLoginEmail("");
    setLoginPassword("");
    setSignupName("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
    setForgotEmail("");
  };

  const showForgotPasswordForm = () => {
    setShowForgotPassword(true);
    setAuthError(null);
    setResetMessage(null);
    setForgotEmail("");
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthError(null);

    

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000", // Adjust redirect URL
      },
      
    });
console.log("alksdjfl alskjdf lgoogle data....",data)
    if (error) {
      setAuthError(error.message || "Google signup failed.");
      setIsLoading(false);
      return;
    }
    // Redirect happens automatically; handle success in Step 3
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "8px",
            }}
          >
            <Mic style={{ width: "40px", height: "40px", color: "#007bff" }} />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
            Sagan Command Center
          </h1>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Your mission control for productivity
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #eee" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
              {showForgotPassword
                ? "Reset Password"
                : isLogin
                ? "Login"
                : "Create Employee Account"}
            </h2>
            <p style={{ color: "#666", fontSize: "14px" }}>
              {showForgotPassword
                ? "Enter your email to reset your password"
                : isLogin
                ? "Enter your credentials to access your account"
                : "Fill in your details to get started as an employee"}
            </p>
          </div>

          <div style={{ padding: "24px" }}>
            {authError && (
              <div
                style={{
                  backgroundColor: authError.includes("Check your email")
                    ? "#d1fae5"
                    : "#fee2e2",
                  color: authError.includes("Check your email")
                    ? "#16a34a"
                    : "#dc2626",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                {authError}
              </div>
            )}
            {resetMessage && (
              <div
                style={{
                  backgroundColor: "#d1fae5",
                  color: "#16a34a",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                {resetMessage}
              </div>
            )}

            {showForgotPassword ? (
              <form
                onSubmit={handleForgotPasswordSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Email
                  </label>
                  <Mail
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "36px",
                      width: "16px",
                      height: "16px",
                      color: "#666",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 8px 8px 36px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}{" "}
                  <ArrowRight style={{ width: "16px", height: "16px" }} />
                </button>
              </form>
            ) : isLogin ? (
                <>
              <form
                onSubmit={handleLoginSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Email
                  </label>
                  <Mail
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "36px",
                      width: "16px",
                      height: "16px",
                      color: "#666",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 8px 8px 36px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Password
                  </label>
                  <Lock
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "36px",
                      width: "16px",
                      height: "16px",
                      color: "#666",
                    }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 40px 8px 36px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "32px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: "16px", height: "16px" }} />
                    ) : (
                      <Eye style={{ width: "16px", height: "16px" }} />
                    )}
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading ? "Logging in..." : "Login"}{" "}
                  <ArrowRight style={{ width: "16px", height: "16px" }} />
                </button>
                </form>
                
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "16px",
                  }}
                >
                  <button
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#fff",
                      color: "#333",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.09 20.38 7.75 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.75 1 4.09 3.62 2.18 7.07l2.85 2.84c.87-2.6 3.30-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isLoading ? "Processing..." : "Continue with Google"}
                  </button>
                  </div>
                  </>
              ) : (
                  <>
              <form
                onSubmit={handleSignupSubmit}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Full Name
                  </label>
                  <User
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "36px",
                      width: "16px",
                      height: "16px",
                      color: "#666",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 8px 8px 36px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Email
                  </label>
                  <Mail
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "36px",
                      width: "16px",
                      height: "16px",
                      color: "#666",
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 8px 8px 36px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Password
                  </label>
                  <Lock
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "36px",
                      width: "16px",
                      height: "16px",
                      color: "#666",
                    }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 40px 8px 36px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      top: "32px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: "16px", height: "16px" }} />
                    ) : (
                      <Eye style={{ width: "16px", height: "16px" }} />
                    )}
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontWeight: "500",
                    }}
                  >
                    Confirm Password
                  </label>
                  <Lock
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "36px",
                      width: "16px",
                      height: "16px",
                      color: "#666",
                    }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 8px 8px 36px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "14px",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                  }}
                >
                  {isLoading
                    ? "Creating account..."
                    : "Create Executive Account"}{" "}
                  <ArrowRight style={{ width: "16px", height: "16px" }} />
                </button>
                    </form>
                    <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "16px",
                  }}
                >
                  <button
                    onClick={handleGoogleAuth}
                    disabled={isLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "10px",
                      backgroundColor: "#fff",
                      color: "#333",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "14px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.09 20.38 7.75 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.75 1 4.09 3.62 2.18 7.07l2.85 2.84c.87-2.6 3.30-4.53 6.16-4.53z"
                      />
                    </svg>
                    {isLoading ? "Processing..." : "Continue with Google"}
                  </button>
                </div>
                    </>
            )}
          </div>

          <div
            style={{
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              textAlign: "center",
            }}
          >
            {!showForgotPassword && isLogin && (
              <button
                onClick={showForgotPasswordForm}
                style={{
                  background: "none",
                  border: "none",
                  color: "#666",
                  fontSize: "14px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Forgot Password?
              </button>
            )}
            <button
              onClick={toggleAuthMode}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {showForgotPassword
                ? "Back to Login"
                : isLogin
                ? "Don't have an account? Sign up as Executive"
                : "Already have an account? Log in"}
            </button>
            <p style={{ color: "#666", fontSize: "12px" }}>
              By continuing, you agree to Sagan's Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
