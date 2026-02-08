import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/userService.js";
import { FilePlus, Rocket, Hourglass } from "lucide-react";
import "./NavBar.css"; // стили для страницы регистрации

function Register() {
  const navigate = useNavigate(); // хук для перехода на другую страницу

  // состояния для формы
  const [name, setName] = useState(""); // имя пользователя
  const [email, setEmail] = useState(""); // email
  const [password, setPassword] = useState(""); // пароль
  const [confirmPassword, setConfirmPassword] = useState(""); // подтверждение пароля
  const [loading, setLoading] = useState(false); // показываем загрузку при отправке
  const [error, setError] = useState(""); // сообщение об ошибке

  // проверяем, что email валидный
  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  // когда пользователь отправляет форму
  async function handleRegister(e) {
    e.preventDefault(); // чтобы страница не перезагружалась
    setError(""); // убираем старые ошибки

    const trimmedName = name.trim(); // убираем лишние пробелы
    const trimmedEmail = email.trim();

    // простая валидация
    if (!trimmedName) {
      setError("Введите своё имя");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Введите корректный email");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов");
      return;
    }
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true); // включаем загрузку
    try {
      const result = await registerUser(trimmedName, trimmedEmail, password); // вызов API регистрации
      console.log("Регистрация успешна:", result);

      alert(`Регистрация успешна! Добро пожаловать, ${trimmedName}!`);

      // очищаем поля формы после успешной регистрации
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/login"); // переходим на страницу логина
    } catch (err) {
      console.error("Ошибка регистрации:", err);
      setError(err?.message || "Ошибка регистрации"); // показываем ошибку
    } finally {
      setLoading(false); // выключаем загрузку
    }
  }

  return (
    <div className="register-page page">
      {/* Заголовок с иконкой */}
      <h1 className="register-title"><FilePlus /> Create Account</h1>

      {/* если есть ошибка, показываем */}
      {error && <div role="alert" className="register-error">⚠️ {error}</div>}

      {/* сама форма */}
      <form className="register-form" onSubmit={handleRegister}>
        {/* имя */}
        <input
          type="text"
          placeholder="Full Name"
          className="register-input input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Name"
          disabled={loading} // блокируем, если идет отправка
          required
        />

        {/* email */}
        <input
          type="email"
          placeholder="Email Address"
          className="register-input input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label="Email"
          disabled={loading}
          required
        />

        {/* пароль */}
        <input
          type="password"
          placeholder="Password (min. 6 characters)"
          className="register-input input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Password"
          disabled={loading}
          required
        />

        {/* подтверждение пароля */}
        <input
          type="password"
          placeholder="Confirm Password"
          className="register-input input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          aria-label="Confirm password"
          disabled={loading}
          required
        />

        {/* кнопка регистрации */}
        <button type="submit" className="register-button" disabled={loading}>
          {loading ? (
            <>
              <Hourglass size={16} /> Creating Account...
            </>
          ) : (
            <>
              <Rocket size={16} /> Register
            </>
          )}
        </button>
      </form>

      {/* ссылка на логин */}
      <div className="register-login-link">
        Уже есть аккаунт?{" "}
        <button onClick={() => navigate("/login")}>Войти</button>
      </div>
    </div>
  );
}

export default Register;
