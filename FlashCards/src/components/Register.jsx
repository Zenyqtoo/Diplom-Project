import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/userService.js";


export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // simple email check
  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(trimmedName, trimmedEmail, password);
      console.log("Registration successful:", result);
      // store user info in localStorage
      localStorage.setItem(
      "user",
      JSON.stringify({ name: trimmedName, email: trimmedEmail })
    );
      alert("Registration successful! You can now log in.");
      // reset form
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      // go to login page
      navigate("/login");
    } catch (err) {
      console.error("Registration failed:", err);
      const msg = err?.body?.message || err.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page page" style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <h1 className="register-title">Register</h1>

      {error && (
        <div role="alert" style={{ color: "white", background: "#e85d5d", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      <form className="register-form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Name"
          className="register-input input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Name"
        />

        <input
          type="email"
          placeholder="Email"
          className="register-input input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
        />

        <input
          type="password"
          placeholder="Password"
          className="register-input input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
        />

        <input
          type="password"
          placeholder="Confirm password"
          className="register-input input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-label="Confirm password"
        />

        <button
          type="submit"
          className="register-button button"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
    </div>
  );
}