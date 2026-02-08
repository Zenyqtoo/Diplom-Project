import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm.jsx";
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/categories.jsx";
import "./Home.css"; // стили страницы Home
import { getCategories } from "../services/categoriesService.jsx";

export default function Home() {
  const navigate = useNavigate();

  // состояние категорий (берем из localStorage или дефолтные)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // если в localStorage нет категорий, сохраняем дефолтные
  const categoriesFromLS = localStorage.getItem("localCategories");
  if (!categoriesFromLS) {
    try {
      localStorage.setItem("localCategories", JSON.stringify(CATEGORIES));
    } catch (error) {
      console.error("Ошибка при записи localCategories в localStorage:", error);
    }
  }

  // синхронизация категорий между вкладками и событиями
  useEffect(() => {
    function load() {
      try {
        const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
        // если есть сохраненные категории, используем их, иначе дефолтные
        setCategories(Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES);
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }
    }

    load(); // загрузка при монтировании
    window.addEventListener("storage", load); // слушаем изменения localStorage
    window.addEventListener("localCategoriesUpdated", load); // кастомное событие обновления

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("localCategoriesUpdated", load);
    };
  }, []);

  // состояние результатов поиска
  const [results, setResults] = useState({ categories: [], cards: [] });

  // обработка поиска
  function onSearchHandler(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setResults({ categories: [], cards: [] });
      return;
    }

    // поиск по категориям
    const categoryMatches = categories.filter(c =>
      (c.title || "").toLowerCase().includes(q)
    );

    // поиск по карточкам внутри категорий
    const cardMatches = [];
    categories.forEach(c => {
      (c.cards || []).forEach((card, idx) => {
        if ((card.label || "").toLowerCase().includes(q)) {
          cardMatches.push({
            categoryId: c.id,
            categoryTitle: c.title,
            card,
            cardIndex: idx
          });
        }
      });
    });

    setResults({ categories: categoryMatches, cards: cardMatches });
  }

  // открыть категорию
  function openCategory(id) {
    navigate(`/category/${encodeURIComponent(id)}/0`);
  }

  // открыть карточку
  function openCard(r) {
    navigate(`/category/${encodeURIComponent(r.categoryId)}/${r.cardIndex}`);
  }
  
  return (
    <main className="home-page">
      <h1 className="home-heading">Welcome to FlashCards</h1>

      {/* Форма поиска сверху */}
      <section className="home-search">
        <SearchForm onSearchHandler={onSearchHandler} />
      </section>

      {/* Категории в виде кнопок */}
      <section className="categories-grid">
        {categories.map((c, idx) => (
          <button
            key={`${c.id}-${idx}`}   // уникальный ключ
            className="cat-btn"
            onClick={() => openCategory(c.id)}
          >
            <div className="cat-icon" style={{ background: c.color || "#ddd" }}>
              {c.title.charAt(0)}
            </div>
            <div className="cat-title">{c.title}</div>
          </button>
        ))}
      </section>

      {/* Результаты поиска */}
      {results.categories.length > 0 || results.cards.length > 0 ? (
        <section className="results-grid">
          {/* Категории в результатах */}
          {results.categories.length > 0 && (
            <div className="results-box">
              <h3>Categories</h3>
              {results.categories.map(c => (
                <button
                  key={c.id}
                  className="result-item"
                  onClick={() => openCategory(c.id)}
                >
                  <div
                    className="result-icon"
                    style={{ background: c.color || "#ddd" }}
                  >
                    {(c.title || "").charAt(0)}
                  </div>

                  <div>
                    <div className="result-title">{c.title}</div>
                    <div className="result-sub">{c.id}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Карточки в результатах */}
          {results.cards.length > 0 && (
            <div className="results-box">
              <h3>Cards</h3>
              {results.cards.map(r => (
                <button
                  key={r.card.id}
                  className="result-item"
                  onClick={() => openCard(r)}
                >
                  <div className="result-icon gray">
                    {(r.card.label || "").charAt(0)}
                  </div>

                  <div className="result-flex">
                    <div className="result-title">{r.card.label}</div>
                    <div className="result-sub">{r.categoryTitle}</div>
                  </div>

                  <div className="result-index">{r.cardIndex + 1}</div>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="home-muted">
          Type something in the search to find categories or cards.
        </div>
      )}
    </main>
  );
}

