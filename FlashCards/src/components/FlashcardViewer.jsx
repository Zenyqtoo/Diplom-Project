import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Flashcard from "./Flashcard.jsx";
import { ArrowLeft, ArrowRight, Dices, Play, Volume2 } from "lucide-react";

export default function FlashcardViewer() {
  const { id, index: indexParam } = useParams(); // получаем id категории и индекс карточки из URL
  const navigate = useNavigate(); // хук для перехода между страницами

  // состояния для категорий
  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
      return Array.isArray(saved) && saved.length ? saved : [];
    } catch {
      return [];
    }
  });

  // слушаем изменения в localStorage
  useEffect(() => {
    function onStorage() {
      try {
        const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
        if (Array.isArray(saved)) setCategories(saved);
      } catch {}
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("localCategoriesUpdated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("localCategoriesUpdated", onStorage);
    };
  }, []);

  // находим выбранную категорию
  const cat = categories.find((c) => c.id === id);

  // если категория не найдена
  if (!cat) {
    return (
      <section className="viewer viewer-center">
        <div className="viewer-header">
          <button className="btn ghost" onClick={() => navigate("/")}>
            <ArrowLeft size={20} /> Back
          </button>
        </div>
        <div className="card-frame error-card">
          <h3>Oops! Category not found</h3>
          <p className="error-muted">Let's go back to the home screen and try again!</p>
          <div className="mt-12">
            <button className="btn" onClick={() => navigate("/")}>Go Home</button>
          </div>
        </div>
      </section>
    );
  }

  const total = cat.cards.length;

  // если карточек в категории нет
  if (total === 0) {
    return (
      <section className="viewer viewer-center">
        <div className="viewer-header">
          <button className="btn ghost" onClick={() => navigate("/")}>
            <ArrowLeft size={20} /> Back
          </button>
        </div>
        <div className="card-frame error-card">
          <h3>No cards yet!</h3>
          <p className="error-muted">This category is empty. Add some cards to get started!</p>
          <div className="mt-12">
            <button className="btn" onClick={() => navigate("/")}>Go Home</button>
          </div>
        </div>
      </section>
    );
  }

  // определяем индекс карточки
  const parsedIndex = (() => {
    if (typeof indexParam === "undefined") return 0;
    const p = Number(indexParam);
    if (Number.isNaN(p)) return 0;
    return Math.min(Math.max(0, p), total - 1);
  })();

  const [index, setIndex] = useState(parsedIndex); // текущий индекс карточки
  const [isPlaying, setIsPlaying] = useState(false); // индикатор озвучки

  // обновляем URL при смене карточки
  useEffect(() => {
    navigate(`/category/${encodeURIComponent(cat.id)}/${index}`, {
      replace: true,
    });
  }, [index]);

  // свайпы на карточках
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const pointerDown = useRef(false);

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

    // определяем свайп влево/вправо
    if (Math.abs(dx) > 50 && Math.abs(dy) < 80) {
      if (dx < 0) next();
      else prev();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }

  // обработка стрелок и пробела
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " ") {
        e.preventDefault();
        speak(cat.cards[index].label);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  function next() {
    if (index < total - 1) setIndex((i) => i + 1);
    else setIndex(0); // если дошли до конца, начинаем сначала
  }

  function prev() {
    if (index > 0) setIndex((i) => i - 1);
    else setIndex(total - 1); // если в начале, идем в конец
  }

  // озвучка карточки
  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) {
        alert("Speech is not available in this browser.");
        return;
      }

      setIsPlaying(true);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.volume = 0.9;
      utter.rate = 0.8;
      utter.pitch = 1.1;

      utter.onend = () => setIsPlaying(false);
      utter.onerror = () => setIsPlaying(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.error(err);
      setIsPlaying(false);
    }
  }

  return (
    <section className="viewer viewer-center">
      {/* шапка с названием категории */}
      <div className="viewer-header">
        <div className="kf-category-title">
          <button 
            className="btn ghost" 
            onClick={() => navigate("/")}
            style={{ fontSize: "18px" }}
          >
            <ArrowLeft size={22} /> Back
          </button>

          <div className="viewer-category">
            <div className="category-dot" style={{ background: cat.color }} aria-hidden="true" />
            <div className="category-name">{cat.title}</div>
          </div>
        </div>

        <div className="counter">{index + 1} / {total}</div>
      </div>

      {/* основная карточка */}
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

        {/* подпись и кнопка озвучки */}
        <div className="card-content">
          <div className="card-label card-label-row">
            <div className="flex-spacer" />
            <div className="text-center card-label">{cat.cards[index].label}</div>
            <div className="play-wrapper">
              <button
                className={`btn ${isPlaying ? 'success' : 'secondary'}`}
                onClick={() => speak(cat.cards[index].label)}
                disabled={isPlaying}
                style={{ fontSize: "18px" }}
              >
                {isPlaying ? (
                  <>
                    <Volume2 size={22} className="loading" /> Playing...
                  </>
                ) : (
                  <>
                    <Play size={22} /> Say it!
                  </>
                )}
              </button>
            </div>
          </div>

          {/* кнопки навигации */}
          <div className="controls controls-row">
            <div className="controls-group">
              <button className="btn ghost" onClick={prev} aria-label="Previous card" style={{ fontSize: "18px" }}>
                <ArrowLeft size={22} /> Back
              </button>
              
              <button className="btn" onClick={() => setIndex(Math.floor(Math.random() * total))} style={{ fontSize: "18px" }}>
                <Dices size={22} /> Surprise!
              </button>
              
              <button className="btn ghost" onClick={next} aria-label="Next card" style={{ fontSize: "18px" }}>
                Next <ArrowRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* подсказка для пользователя */}
      <div style={{ 
        textAlign: "center", 
        fontSize: "16px", 
        color: "var(--muted)",
        marginTop: "12px",
        background: "white",
        padding: "12px 20px",
        borderRadius: "12px",
        fontWeight: "600"
      }}>
        💡 Tip: Swipe left/right on the card, use arrow keys, or press the big buttons!
      </div>
    </section>
  );
}








