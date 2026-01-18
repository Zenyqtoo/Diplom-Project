import React from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/cards.jsx";

export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="home">
      <section style={{ width: "100%", maxWidth: 920, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontFamily: "Fredoka One, cursive", fontSize: 22 }}>Choose a category</h2>
        <div style={{ color: "var(--muted)" }}>Bright and big for kids</div>
      </section>

      <section className="categories" aria-label="categories">
        {Object.values(CATEGORIES).map((cat) => (
          <button
            key={cat.id}
            className="cat-btn"
            onClick={() => navigate(`/category/${encodeURIComponent(cat.id)}/0`)}
            aria-label={`Open ${cat.title}`}
          >
            <div className="cat-icon" style={{ background: cat.color }}>{cat.title[0]}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{cat.title}</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>{cat.cards.length} cards</div>
          </button>
        ))}
      </section>
    </main>
  );
}