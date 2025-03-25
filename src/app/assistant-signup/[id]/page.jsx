"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { User, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AssistantSignup = ({ params }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = (useState) | (null > null);
  const [signupName, setSignupName] = useState("")
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const navigate = useRouter();
  const { id } = params; // Extract user_id from URL params

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const isValidUuid = (str) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    // Validate user_id from URL params
    if (!id || !isValidUuid(id)) {
      setAuthError(
        "Invalid or missing Owner Code in the URL. Please use a valid signup link."
      );
      setIsLoading(false);
      return;
    }

    // Check if a user exists with this UUID in the users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    console.log(user);
    if (userError || !user) {
      setAuthError("Owner Code is not correct or no user found!");
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
      //     full_name: id, // Using user_id as full_name (adjust if needed)
      //     role: "assistant",
      //     owner_id: id,
      //   },
      // },
    });

    if (error) {
      setAuthError(error.message || "Signup failed. Please try again.");
      setIsLoading(false);
      return;
    }

    if (data.user) {
      const assistantId = data.user.id;

      const { error: insertError } = await supabase
      .from("users")
      .insert({ id: data.user.id, email: data.user.email, role:"assistant", full_name:signupName, executive_id:id })
      .select();


      const { error: updateError } = await supabase
        .from("users")
        .update({ assistant_id: assistantId })
        .eq("id", id);

      if (updateError || insertError) {
        console.error(
          "Error updating assistant_id in users table:",
          updateError
        );
        setAuthError(
          "Signup has a problem"
        );
        setIsLoading(false);
        return;
      }

      console.log(
        `Successfully linked assistant ${assistantId} to employee ${id}`
      );
    }

    // setAuthError("Check your email to confirm your account!");
    setIsLoading(false);
    navigate("/");
    // Optionally redirect to login after signup
    // setTimeout(() => navigate('/login'), 2000);
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
          <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
            Assistant Signup
          </h1>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Use the Owner Code from your signup link
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: "24px",
          }}
        >
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

          <form
            onSubmit={handleSignupSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
                }}
              >
                Full name
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
                placeholder="Full name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 8px 8px 36px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "#f0f0f0",
                }}
              />
            </div>
            <div style={{ position: "relative" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontWeight: 500,
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
                  fontWeight: 500,
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
                  fontWeight: 500,
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
              {isLoading ? "Creating account..." : "Create Assistant Account"}
              <ArrowRight style={{ width: "16px", height: "16px" }} />
            </button>
          </form>

          <div style={{ padding: "16px 0", textAlign: "center" }}>
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

export default AssistantSignup;
