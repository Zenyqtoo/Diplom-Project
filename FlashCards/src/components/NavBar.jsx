import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Plus, Rabbit, TriangleAlert } from "lucide-react";
import CreateCardModal from "./CreateCardModal.jsx";
import CreateCategoryModal from "./CreateCategoryModal.jsx";
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/categories.jsx";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate(); // хук для перехода по страницам

  // состояния для меню и модальных окон
  const [isMenuOpen, setIsMenuOpen] = useState(false); // для бургер-меню на мобилках
  const [showCreateCard, setShowCreateCard] = useState(false); // открыть модалку для карточки
  const [showCreateCategory, setShowCreateCategory] = useState(false); // открыть модалку для категории

  // проверяем, авторизован ли пользователь
  const [authorized, setAuthorized] = useState(() => Boolean(localStorage.getItem("currentUser")));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null; // если что-то не так с JSON
    }
  });

  // состояние категорий
  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES; // дефолтные категории
    }
  });

  // слушаем изменения авторизации и категорий
  useEffect(() => {
    function handleAuthChange() {
      const isAuth = Boolean(localStorage.getItem("currentUser"));
      setAuthorized(isAuth);

      try {
        const user = JSON.parse(localStorage.getItem("currentUser") || "null");
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      }
    }

    function handleCategoriesChange() {
      try {
        const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
        if (Array.isArray(saved)) setCategories(saved); // обновляем категории
      } catch {}
    }

    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange); // кастомное событие для авторизации
    window.addEventListener("localCategoriesUpdated", handleCategoriesChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("localCategoriesUpdated", handleCategoriesChange);
    };
  }, []);

  // выйти из аккаунта
  function logoutHandler() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    setAuthorized(false);
    setCurrentUser(null);

    window.dispatchEvent(new Event("authChange")); // уведомляем другие вкладки

    navigate("/login"); // возвращаемся на логин
  }

  // открыть модалку создания категории
  function handleCreateCategory() {
    if (!authorized) {
      alert("<TriangleAlert /> Пожалуйста, войдите, чтобы создать категорию!");
      navigate("/login");
      return;
    }
    setShowCreateCategory(true);
  }

  // открыть модалку создания карточки
  function handleCreateCard() {
    if (!authorized) {
      alert("<TriangleAlert /> Пожалуйста, войдите, чтобы создать карточку!");
      navigate("/login");
      return;
    }

    if (categories.length === 0) {
      alert("<TriangleAlert /> Сначала создайте категорию!");
      return;
    }

    setShowCreateCard(true);
  }

  return (
    <>
      <nav className="navbar">
        {/* Лого и название */}
        <div className="navbar-logo">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Rabbit /> FlashCards
          </Link>
        </div>

        {/* бургер-меню */}
        <button
          className="hamburger-button"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((s) => !s)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="navbar-spacer" />

        {/* ссылки и кнопки справа */}
        <div className="navbar-right">
          <div className={`nav-links ${isMenuOpen ? "hidden" : ""}`}>
            <Link className="nav-link" to="/">Home</Link>
            <button className="nav-link" onClick={() => navigate("/category/alphabet/0")}>Alphabet</button>
            <button className="nav-link" onClick={() => navigate("/category/animals/0")}>Animals</button>
            <button className="nav-link" onClick={() => navigate("/category/numbers/0")}>Numbers</button>
            <button className="nav-link" onClick={() => navigate("/category/colors/0")}>Colors</button>
          </div>

          {/* кнопки создания карточек и категорий, только если авторизован */}
          {authorized && (
            <>
              <button 
                className="btn ghost" 
                onClick={handleCreateCard} 
                title="Create card"
              >
                <Plus size={16} /> Card
              </button>

              <button 
                className="btn ghost" 
                onClick={handleCreateCategory}
                title="Create category"
              >
                + Category
              </button>
            </>
          )}

          {/* кнопки логина/регистрации или инфо о пользователе */}
          {!authorized ? (
            <>
              <Link to="/login"><button className="nav-login">Login</button></Link>
              <Link to="/register"><button className="nav-login">Register</button></Link>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "#666" }}>
                👤 {currentUser?.name || "User"}
              </span>
              <button onClick={logoutHandler} className="nav-login">Logout</button>
            </div>
          )}
        </div>
      </nav>

      {/* мобильное меню */}
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

      {/* модалки создания карточек и категорий */}
      {authorized && (
        <>
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
                
                try {
                  localStorage.setItem("localCategories", JSON.stringify(next));
                  window.dispatchEvent(new Event("localCategoriesUpdated")); // уведомляем все вкладки
                } catch {}
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
                
                try {
                  localStorage.setItem("localCategories", JSON.stringify(next));
                  window.dispatchEvent(new Event("localCategoriesUpdated")); // обновляем все вкладки
                } catch {}
                
                navigate(`/category/${encodeURIComponent(createdCategory.id)}/0`);
              }
              setShowCreateCategory(false);
            }}
          />
        </>
      )}
    </>
  );
}
