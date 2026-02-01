import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/userService.js";

export default function Register() {
  const navigate = useNavigate();

  // Состояния для полей формы
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Состояния для загрузки и ошибок
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Функция для проверки корректности email
  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  // Обработка регистрации при отправке формы
  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Валидация полей
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
      // Вызов сервиса регистрации
      const result = await registerUser(trimmedName, trimmedEmail, password);
      console.log("Registration successful:", result);

      // Сохраняем данные пользователя в localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({ name: trimmedName, email: trimmedEmail })
      );
      alert("Registration successful! You can now log in.");

      // Сброс полей формы после успешной регистрации
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Переход на страницу входа
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
    // Основной контейнер страницы регистрации
    <div className="register-page page" style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <h1 className="register-title">Register</h1>

      {/* Блок отображения ошибок */}
      {error && (
        <div role="alert" style={{ color: "white", background: "#e85d5d", padding: 10, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Форма регистрации */}
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

        {/* Кнопка отправки формы */}
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
