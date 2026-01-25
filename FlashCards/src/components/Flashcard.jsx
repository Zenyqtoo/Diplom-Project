import React from "react";

// Компонент карточки
export default function Flashcard({ card }) {
  return (
    <div className="flashcard">
      {/* Верхняя часть */}
      <div className="flashcard-image">
        <img src={card.imageUrl} alt={card.label || "card"} />
      </div>

      {/* Нижняя часть*/}
      <div className="flashcard-label">
        <div className="flashcard-text">{card.label}</div>
      </div>
    </div>
  );
}
