"use client"
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";


const UpdatePassword = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useRouter();

  const handleUpdatePasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);

    if (newPassword.length < 6) {
      setAuthError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setAuthError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccessMessage("Password updated successfully! Redirecting to projects...");
      setTimeout(() => navigate.push("/projects"), 1000); // Redirect after 2s
    } catch (error) {
      setAuthError(error.message || "Failed to update password. Please try again.");
      const { error:signoutError } = await supabase.auth.signOut();
          if (signoutError) {
            console.error("Logout error:", error.message);
          } else {
            navigate.push("/login");
          }
    } finally {
      setIsLoading(false);
    }
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
            Sagan Command Center
          </h1>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Update your password
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
              Update Password
            </h2>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Enter your new password below
            </p>
          </div>

          <div style={{ padding: "24px" }}>
            {authError && (
              <div
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                {authError}
              </div>
            )}
            {successMessage && (
              <div
                style={{
                  backgroundColor: "#d1fae5",
                  color: "#16a34a",
                  padding: "12px",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                {successMessage}
              </div>
            )}

            <form
              onSubmit={handleUpdatePasswordSubmit}
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
                  New Password
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
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 40px 8px 36px",
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
                {isLoading ? "Updating..." : "Update Password"}
                <ArrowRight style={{ width: "16px", height: "16px" }} />
              </button>
            </form>
          </div>

          <div
            style={{
              padding: "16px 24px",
              textAlign: "center",
            }}
          >
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#666",
                fontSize: "14px",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;