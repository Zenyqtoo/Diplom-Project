import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import FlashcardViewer from "./components/FlashcardViewer.jsx";

export default function App() {
  return (
    <div className="app">
      <header className="header" style={{ maxWidth: 920 }}>
        <div className="brand">
          <div className="logo">KF</div>
          <div>
            <div className="title">Kids Flashcards</div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Learn with bright, fun cards</div>
          </div>
        </div>
      </header>

      <main style={{ width: "100%", flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:id/:index?" element={<FlashcardViewer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
        Tip: swipe left/right on the card, or use the big buttons.
      </footer>
    </div>
  );
}