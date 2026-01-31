import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/cards.jsx";


export default function Home() {
  const navigate = useNavigate();
   const [user, setUser] = useState(null);

  useEffect(() => {
    // Get info from localStorage
     const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("user"); // remove user info
    localStorage.removeItem("accessToken"); 
    setUser(null)
  }

  return (
    <main className="home">
      <section className="home-header">
        <h2 className="home-title">Choose a category</h2>
        <div className="home-subtitle">Bright and big for kids</div>
      </section>

      <section className="categories" aria-label="categories">
        {Object.values(CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            className="cat-btn"
            onClick={() => navigate(`/category/${encodeURIComponent(cat.id)}/0`)}
            aria-label={`Open ${cat.title}`}
          >
            {}
            <div
              className="cat-icon"
              style={{ background: cat.color }}
            >
              {cat.title[0]}
            </div>

            <div className="cat-title">{cat.title}</div>
            <div className="cat-count">{cat.cards.length} cards</div>
          </button>
        ))}
      </section>
    </main>
  );
}
