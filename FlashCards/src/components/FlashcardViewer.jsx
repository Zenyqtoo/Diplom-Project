import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Flashcard from "./Flashcard.jsx";
import { ArrowLeft, ArrowRight, Dices, Play } from "lucide-react";

export default function FlashcardViewer() {
  const { id, index: indexParam } = useParams();
  const navigate = useNavigate();

  // Get categories from localStorage
  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
      return Array.isArray(saved) && saved.length ? saved : [];
    } catch {
      return [];
    }
  });

  // Listen for localStorage changes (so newly added cards appear)
  useEffect(() => {
    function onStorage() {
      try {
        const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
        if (Array.isArray(saved)) setCategories(saved);
      } catch {}
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Find the selected category
  const cat = categories.find((c) => c.id === id);

  if (!cat) {
    return (
      <section className="viewer viewer-center">
        <div className="viewer-header">
          <button className="btn ghost" onClick={() => navigate("/")}>
            ← Back
          </button>
        </div>

        <div className="card-frame error-card">
          <h3>Category not found</h3>
          <p className="error-muted">Try returning to the home screen.</p>
          <div className="mt-12">
            <button className="btn" onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  const total = cat.cards.length;

  const parsedIndex = (() => {
    if (typeof indexParam === "undefined") return 0;
    const p = Number(indexParam);
    if (Number.isNaN(p)) return 0;
    return Math.min(Math.max(0, p), total - 1);
  })();

  const [index, setIndex] = useState(parsedIndex);

  useEffect(() => {
    navigate(`/category/${encodeURIComponent(cat.id)}/${index}`, {
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const pointerDown = useRef(false);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  function next() {
    setIndex((i) => Math.min(total - 1, i + 1));
  }

  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function onPointerDown(e) {
    pointerDown.current = true;
    touchStartX.current = e.clientX ?? e.touches?.[0]?.clientX;
    touchStartY.current = e.clientY ?? e.touches?.[0]?.clientY;
  }

  function onPointerUp(e) {
    if (!pointerDown.current) return;
    pointerDown.current = false;

    const endX =
      e.clientX ?? (e.changedTouches && e.changedTouches[0].clientX);
    const endY =
      e.clientY ?? (e.changedTouches && e.changedTouches[0].clientY);

    if (endX == null || touchStartX.current == null) return;

    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;

    if (Math.abs(dx) > 50 && Math.abs(dy) < 80) {
      if (dx < 0) next();
      else prev();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }

  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) {
        alert("Speech synthesis not available in this browser.");
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.volume = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <section className="viewer viewer-center">
      <div className="viewer-header">
        <div className="kf-category-title">
          <button className="btn ghost" onClick={() => navigate("/")}>
            ←
          </button>

          <div className="viewer-category">
            <div
              className="category-dot"
              style={{ background: cat.color }}
              aria-hidden="true"
            />
            <div className="category-name">{cat.title}</div>
          </div>
        </div>
      </div>

      <div
        className="card-frame"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onTouchStart={(e) => onPointerDown(e.touches ? e.touches[0] : e)}
        onTouchEnd={(e) => onPointerUp(e.changedTouches ? e.changedTouches[0] : e)}
      >
        <div className="card-visual" aria-live="polite">
          <Flashcard card={cat.cards[index]} />
        </div>

        <div className="card-content">
          <div className="card-label card-label-row">
            <div className="flex-spacer" />
            <div className="text-center">{cat.cards[index].label}</div>
            <div className="play-wrapper">
              <button
                className="btn secondary"
                onClick={() => speak(cat.cards[index].label)}
              >
                <Play /> Play
              </button>
            </div>
          </div>

          <div className="controls controls-row">
            <div className="controls-group">
              <button className="btn ghost" onClick={prev} aria-label="Previous">
                <ArrowLeft /> Prev
              </button>
              <button
                className="btn"
                onClick={() => setIndex(Math.floor(Math.random() * total))}
              >
                <Dices /> Random
              </button>
              <button className="btn ghost" onClick={next} aria-label="Next">
                Next <ArrowRight />
              </button>
            </div>

            <div className="counter">
              {index + 1} / {total}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}





