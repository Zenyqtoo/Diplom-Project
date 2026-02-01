import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchForm from "../components/SearchForm.jsx";
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/categories.jsx";
import "./Home.css"; // стили страницы Home

export default function Home() {
  const navigate = useNavigate();

  // состояние категорий (берем из localStorage или дефолт)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  // синхронизация категорий между вкладками и событиями
  useEffect(() => {
    function load() {
      try {
        const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
        setCategories(Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES);
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }
    }

    load();
    window.addEventListener("storage", load);
    window.addEventListener("localCategoriesUpdated", load);

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("localCategoriesUpdated", load);
    };
  }, []);

  // результаты поиска
  const [results, setResults] = useState({ categories: [], cards: [] });

  // обработка поиска
  function onSearchHandler(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setResults({ categories: [], cards: [] });
      return;
    }

    const categoryMatches = categories.filter(c =>
      (c.title || "").toLowerCase().includes(q)
    );

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

  function openCategory(id) {
    navigate(`/category/${encodeURIComponent(id)}/0`);
  }

  function openCard(r) {
    navigate(`/category/${encodeURIComponent(r.categoryId)}/${r.cardIndex}`);
  }

  return (
    <main className="home-page">
      <h1 className="home-heading">Welcome to FlashCards</h1>

      <section className="home-search">
        <SearchForm onSearchHandler={onSearchHandler} />
      </section>

      <section>
        {results.categories.length === 0 && results.cards.length === 0 ? (
          <div className="home-muted">
            Type something in the search to find categories or cards.
          </div>
        ) : (
          <div className="results-grid">
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

                    <div className="result-index">
                      {r.cardIndex + 1}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
