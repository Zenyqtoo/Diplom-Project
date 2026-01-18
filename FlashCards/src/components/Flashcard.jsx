import React from "react";

export default function Flashcard({ card }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={card.imageUrl} alt={card.label || "card"} />
      </div>

      <div style={{ padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 28, fontFamily: "Fredoka One, cursive" }}>{card.label}</div>
      </div>
    </div>
  );
}