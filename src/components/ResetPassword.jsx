import React, { useState } from "react";

const ResetPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Verify code, Step 3: Reset password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  
  // Handle email submission (Step 1)
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call API to send verification code to the email
      const response = await fetch(`https://localhost:5000/api/send-verification-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code.");
      }

      // Move to the next step (verification)
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle verification code submission (Step 2)
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call API to verify the code
      const response = await fetch(`https://localhost:5000/api/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid verification code.");
      }

      // Move to the next step (password reset)
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset submission (Step 3)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    try {
      // Call API to reset the password
      const response = await fetch(`https://localhost:5000/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "20px" }}>
      <h2>
        {step === 1
          ? "Enter Your Email"
          : step === 2
          ? "Verify Your Email"
          : "Reset Your Password"}
      </h2>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      {success && (
        <div style={{ color: "green", marginBottom: "10px" }}>
          Password has been reset successfully!
        </div>
      )}
      {loading && <div style={{ marginBottom: "10px" }}>Loading...</div>}
      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Send Verification Code
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleCodeSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="verificationCode">Verification Code</label>
            <input
              type="text"
              id="verificationCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Verify Code
          </button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handlePasswordSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                display: "block",
                width: "100%",
                padding: "8px",
                marginTop: "5px",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
            disabled={loading}
          >
            Reset Password
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
