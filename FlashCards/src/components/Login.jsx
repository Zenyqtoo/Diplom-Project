import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/userService.js";
import { UserLock, KeyRound, Rocket, TriangleAlert } from "lucide-react";
import "./NavBar.css"; // стили для страницы

const Login = () => {
  const navigate = useNavigate(); // хук для перехода между страницами

  // состояния для формы
  const [email, setEmail] = useState(""); // email
  const [password, setPassword] = useState(""); // пароль
  const [error, setError] = useState(null); // ошибки входа
  const [loading, setLoading] = useState(false); // индикатор загрузки

  // обработчик формы логина
  const loginHandler = async (e) => {
    e.preventDefault(); // чтобы страница не перезагружалась
    setError(null); // очищаем ошибки
    setLoading(true); // ставим индикатор загрузки

    try {
      const result = await loginUser(email, password); // вызываем сервис логина

      if (result?.success) {
        // если логин успешен, уведомляем другие вкладки
        window.dispatchEvent(new Event("authChange"));
        navigate("/"); // переходим на домашнюю страницу
      } else {
        setError("Неверный логин или пароль"); // сообщение об ошибке
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Ошибка входа"); // вывод ошибки
    } finally {
      setLoading(false); // выключаем индикатор загрузки
    }
  };

  return (
    <div className="login-page page">
      {/* Заголовок страницы */}
      <h1 className="login-title"><UserLock /> Login</h1>

      {/* Форма логина */}
      <form className="login-form" onSubmit={loginHandler}>
        {/* Поле email */}
        <input
          type="email"
          placeholder="Email"
          className="login-input input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading} // блокируем во время загрузки
          required
        />

        {/* Поле пароль */}
        <input
          type="password"
          placeholder="Password"
          className="login-input input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />

        {/* Кнопка входа */}
        <button type="submit" className="login-button" disabled={loading}>
          {loading 
            ? <><KeyRound className="loading-icon" /> Logging in…</> 
            : <><Rocket className="rocket-icon" /> Login</>}
        </button>
      </form>

      {/* Ошибки при входе */}
      {error && <div className="login-error"><TriangleAlert /> {error}</div>}

      {/* Ссылка на регистрацию */}
      <div className="login-register-link">
        Нет аккаунта?{" "}
        <button onClick={() => navigate("/register")}>Зарегистрироваться</button>
      </div>
    </div>
  );
};

export default Login;

