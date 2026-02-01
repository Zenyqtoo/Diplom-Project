import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/userService.js";

const Login = () => {
  const navigate = useNavigate(); // для перехода между страницами

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false); 

  const loginHandler = async (e) => {
    e.preventDefault(); // отменяем стандартное поведение формы
    setError(null);
    setLoading(true);

    try {
      const result = await loginUser(email, password); // вызов сервиса логина

      if (result?.success) {
        navigate("/"); // переход на главную страницу при успешном входе
      } else {
        setError("Invalid login"); 
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false); // выключаем состояние загрузки
    }
  };

  return (
    <div className="login-page page">
      <h1 className="login-title">Login</h1>

      <form className="login-form" onSubmit={loginHandler}>
        <input
          type="email"
          placeholder="Email"
          className="login-input input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} // блокируем поле при загрузке
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading} // блокируем поле при загрузке
        />

        <button type="submit" className="login-button button" disabled={loading}>
          {loading ? "Logging in…" : "Login"} {/* индикатор загрузки */}
        </button>
      </form>

      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
    </div>
  );
};

export default Login;
