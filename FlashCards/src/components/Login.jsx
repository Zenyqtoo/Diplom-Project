import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/userService.js";


const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const LoginHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginUser(email, password); 
      if (data?.accessToken) {

  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem(
    "user",
    JSON.stringify({
      email: email,
      name: data.user?.name || email.split("@")[0],
    })
  );
  navigate("/");
} else {
        setError("Login did not return an access token.");
      }
    } catch (err) {

      console.error("Login failed:", err);
      setError(err.body?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page page">
      <h1 className="login-title">Login</h1>
      <form className="login-form" onSubmit={LoginHandler}>
        <input
          type="text"
          placeholder="Email"
          className="login-input input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="login-input input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="login-button button" disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default Login;