import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import FlashcardViewer from "./components/FlashcardViewer.jsx";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import NavBar from "./components/NavBar.jsx";

export default function App() {
  return (
    <div className="app">
      {/* 🔹 NavBar handles user info, search, and create buttons */}
      <NavBar />

      <main style={{ width: "100%", flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:id/:index?" element={<FlashcardViewer />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer style={{ marginTop: 6, color: "var(--muted)", fontSize: 13 }}>
        Tip: swipe left/right on the card, or use the big buttons.
      </footer>
    </div>
  );
}


