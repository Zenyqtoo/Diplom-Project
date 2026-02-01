import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Plus } from "lucide-react";
import CreateCardModal from "./CreateCardModal.jsx";
import CreateCategoryModal from "./CreateCategoryModal.jsx";
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/categories.jsx";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();

  // Состояния для меню, модалок и авторизации
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Открыто ли мобильное меню
  const [showCreateCard, setShowCreateCard] = useState(false); // Открыта ли модалка создания карточки
  const [showCreateCategory, setShowCreateCategory] = useState(false); // Открыта ли модалка создания категории

  // Состояние авторизации
  const [authorized, setAuthorized] = useState(() => Boolean(localStorage.getItem("currentUser")));

  // Состояние категорий (берется из localStorage или дефолтные)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // Следим за изменениями в localStorage (например, если другая вкладка обновит данные)
  useEffect(() => {
    function handleStorage() {
      setAuthorized(Boolean(localStorage.getItem("currentUser")));
      try {
        const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
        if (Array.isArray(saved)) setCategories(saved);
      } catch {}
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Выход из аккаунта
  function logoutHandler() {
    localStorage.removeItem("currentUser"); // Удаляем данные пользователя
    localStorage.removeItem("accessToken"); // Если используется токен
    setAuthorized(false); // Обновляем состояние авторизации
    navigate("/login"); // Перенаправляем на страницу логина
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">FlashCards</Link> {/* Логотип */}
        </div>

        {/* Кнопка-гамбургер для мобильного меню */}
        <button
          className="hamburger-button"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((s) => !s)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="navbar-spacer" />

        <div className="navbar-right">
          <div className={`nav-links ${isMenuOpen ? "hidden" : ""}`}>
            <Link className="nav-link" to="/">Home</Link>
            <button className="nav-link" onClick={() => navigate("/category/alphabet/0")}>Alphabet</button>
            <button className="nav-link" onClick={() => navigate("/category/animals/0")}>Animals</button>
            <button className="nav-link" onClick={() => navigate("/category/numbers/0")}>Numbers</button>
            <button className="nav-link" onClick={() => navigate("/category/colors/0")}>Colors</button>
          </div>

          {/* Кнопки создания карточки и категории */}
          <button className="btn ghost" onClick={() => setShowCreateCard(true)} title="Create card">
            <Plus size={16} />
          </button>

          <button className="btn ghost" onClick={() => setShowCreateCategory(true)}>
            Create Category
          </button>

          {/* Кнопки авторизации / выхода */}
          {!authorized ? (
            <>
              <Link to="/login"><button className="nav-login">Login</button></Link>
              <Link to="/register"><button className="nav-login">Register</button></Link>
            </>
          ) : (
            <button onClick={logoutHandler} className="nav-login">Logout</button>
          )}
        </div>
      </nav>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <div>
            <Link className="mobile-link" to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link className="mobile-link" to="/category/alphabet/0" onClick={() => setIsMenuOpen(false)}>Alphabet</Link>
            <Link className="mobile-link" to="/category/animals/0" onClick={() => setIsMenuOpen(false)}>Animals</Link>
            <Link className="mobile-link" to="/category/numbers/0" onClick={() => setIsMenuOpen(false)}>Numbers</Link>
            <Link className="mobile-link" to="/category/colors/0" onClick={() => setIsMenuOpen(false)}>Colors</Link>
          </div>
        </div>
      )}

      {/* Модалки */}
      <CreateCardModal
        open={showCreateCard}
        onClose={() => setShowCreateCard(false)}
        categories={categories}
        onCreated={(updatedCategory) => {
          if (updatedCategory && updatedCategory.id) {
            const exists = categories.find((c) => c.id === updatedCategory.id);
            const next = exists
              ? categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c))
              : [updatedCategory, ...categories];
            try { localStorage.setItem("localCategories", JSON.stringify(next)); } catch {}
          }
          setShowCreateCard(false);
        }}
      />

      <CreateCategoryModal
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCreated={(createdCategory) => {
          if (createdCategory && createdCategory.id) {
            const next = [createdCategory, ...categories];
            try { localStorage.setItem("localCategories", JSON.stringify(next)); } catch {}
            navigate(`/category/${encodeURIComponent(createdCategory.id)}/0`);
          }
          setShowCreateCategory(false);
        }}
      />
    </>
  );
}

