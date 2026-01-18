import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/cards.jsx";
import Flashcard from "./Flashcard.jsx";
import { ArrowLeft } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Dices } from "lucide-react";
import { Play } from "lucide-react";

export default function FlashcardViewer() {
  const { id, index: indexParam } = useParams();
  const navigate = useNavigate();

  const cat = CATEGORIES[id];
  if (!cat) {
    return (
      <section className="viewer" style={{ alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: 920, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button className="btn ghost" onClick={() => navigate("/")}>← Back</button>
        </div>

        <div className="card-frame" style={{ textAlign: "center", padding: 36 }}>
          <h3>Category not found</h3>
          <p style={{ color: "var(--muted)" }}>Try returning to the home screen.</p>
          <div style={{ marginTop: 12 }}>
            <button className="btn" onClick={() => navigate("/")}>Go Home</button>
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

  // keep URL in sync with index for deep-linking
  useEffect(() => {
    navigate(`/category/${encodeURIComponent(cat.id)}/${index}`, { replace: true });
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
    // eslint-disable-next-line
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
    const endX = e.clientX ?? (e.changedTouches && e.changedTouches[0].clientX);
    const endY = e.clientY ?? (e.changedTouches && e.changedTouches[0].clientY);
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

  // simple fixed-volume speech (no settings)
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
    <section className="viewer" style={{ alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 920, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="kf-category-title">
          <button className="btn ghost" onClick={() => navigate("/")}>←</button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 14, height: 14, background: cat.color, borderRadius: 4 }} aria-hidden="true" />
            <div style={{ fontWeight: 700 }}>{cat.title}</div>
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

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="card-label" role="heading" aria-level="2">
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: "center", width: "100%" }}>{cat.cards[index].label}</div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <button className="btn secondary" onClick={() => speak(cat.cards[index].speak || cat.cards[index].label)}><Play /> Play</button>
            </div>
          </div>

          <div className="controls" style={{ alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn ghost" onClick={prev} aria-label="Previous"><ArrowLeft /> Prev</button>
              <button className="btn" onClick={() => setIndex(Math.floor(Math.random() * total))}><Dices /> Random</button>
              <button className="btn ghost" onClick={next} aria-label="Next">Next <ArrowRight /> </button>
            </div>

            <div style={{ fontSize: 13, color: "var(--muted)", minWidth: 80, textAlign: "right" }}>
              {index + 1} / {total}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}