import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search as SearchIcon } from "lucide-react"; // install with: npm i lucide-react
import SearchForm from "./SearchForm.jsx";
import CreateCardModal from "./CreateCardModal.jsx";
import CreateCategoryModal from "./CreateCategoryModal.jsx";
import { loadToken, clearToken } from "../services/userService.js";
import { CATEGORIES as DEFAULT_CATEGORIES } from "../data/categories.jsx";

export default function NavBar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(Boolean(loadToken && loadToken()));
  const containerRef = useRef(null);


  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  
  const [results, setResults] = useState({ categories: [], cards: [] });
  const [showResults, setShowResults] = useState(false);


  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  useEffect(() => {
    function onStorage() {
      setIsAuth(Boolean(loadToken && loadToken()));
      try {
        const saved = JSON.parse(localStorage.getItem("localCategories") || "null");
        if (Array.isArray(saved) && saved.length) setCategories(saved);
      } catch {}
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function logoutHandler() {
    if (typeof clearToken === "function") clearToken();
    localStorage.removeItem("accessToken");
    setIsAuth(false);
    navigate("/login");
  }

  function slugify(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-");
  }

  // SearchForm submit handler
  function onSearchHandler(query) {
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      setResults({ categories: [], cards: [] });
      setShowResults(false);
      return;
    }

    const categoryMatches = categories.filter((c) => (c.title || "").toLowerCase().includes(q));
    const cardMatches = [];

    categories.forEach((c) => {
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
    setShowResults(true);
  }

  function openCategory(id) {
    setShowResults(false);
    navigate(`/category/${encodeURIComponent(id)}/0`);
    setIsMenuOpen(false);
  }

  function openCard(r) {
    setShowResults(false);
    navigate(`/category/${encodeURIComponent(r.categoryId)}/${r.cardIndex}`);
    setIsMenuOpen(false);
  }

  // create a category locally and persist to localStorage
  function createCategoryLocal() {
    const title = window.prompt("New category title (e.g. Animals)");
    if (!title) return;
    const id = slugify(title);
    if (categories.find((c) => c.id === id)) {
      alert("A category with that name already exists.");
      return;
    }
    const newCat = { id, title: title.trim(), color: "#ffd166", cards: [] };
    const next = [newCat, ...categories];
    setCategories(next);
    try { localStorage.setItem("localCategories", JSON.stringify(next)); } catch {}
    navigate(`/category/${encodeURIComponent(id)}/0`);
  }

  return (
    <>
      <nav className="nav" style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/" className="nav-brand" style={{ fontWeight: 700, textDecoration: "none" }}>FlashCards</Link>
        </div>

        {/* hamburger for mobile */}
        <button
          className="hamburger-button"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((s) => !s)}
          style={{ background: "transparent", border: "none", display: "inline-flex", alignItems: "center" }}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* search + dropdown */}
        <div ref={containerRef} style={{ flex: 1, maxWidth: 720 }}>
          <SearchForm onSearchHandler={onSearchHandler} />
          {showResults && (results.categories.length > 0 || results.cards.length > 0) && (
            <div style={{ marginTop: 8, background: "#fff", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              {results.categories.length > 0 && (
                <div style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Categories</div>
                  {results.categories.map((c) => (
                    <button key={c.id} onClick={() => openCategory(c.id)} style={{ display: "flex", gap: 10, padding: 8, width: "100%", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: c.color || "#ddd", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                        {(c.title || "").charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{c.title}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{c.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.cards.length > 0 && (
                <div style={{ padding: 8 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Cards</div>
                  {results.cards.map((r) => (
                    <button key={r.card.id} onClick={() => openCard(r)} style={{ display: "flex", gap: 10, padding: 8, width: "100%", border: "none", background: "transparent", cursor: "pointer", textAlign: "left" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>{(r.card.label || "").charAt(0)}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{r.card.label}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{r.categoryTitle}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "#666" }}>{r.cardIndex + 1}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* desktop links / actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="nav-links" style={{ display: isMenuOpen ? "none" : "flex", gap: 8 }}>
            <Link to="/" className="nav-link">Home</Link>
            <button className="nav-link" onClick={() => navigate("/category/alphabet/0")}>Alphabet</button>
            <button className="nav-link" onClick={() => navigate("/category/animals/0")}>Animals</button>
            <button className="nav-link" onClick={() => navigate("/category/numbers/0")}>Numbers</button>
            <button className="nav-link" onClick={() => navigate("/category/colors/0")}>Colors</button>
          </div>

          <button className="btn ghost" onClick={() => setShowCreateCard(true)}>Create Card</button>
          <button className="btn ghost" onClick={() => setShowCreateCategory(true)}>Create Category</button>

          {!isAuth ? (
            <>
              <Link to="/login"><button className="nav-login">Login</button></Link>
              <Link to="/register"><button className="nav-login">Register</button></Link>
            </>
          ) : (
            <button onClick={logoutHandler} className="nav-login">Logout</button>
          )}
        </div>
      </nav>

      {/* mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu" style={{ position: "absolute", left: 0, right: 0, top: 64, background: "#fff", zIndex: 2000, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", flexDirection: "column", padding: 12 }}>
            <Link className="mobile-link" to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link className="mobile-link" to="/category/alphabet/0" onClick={() => setIsMenuOpen(false)}>Alphabet</Link>
            <Link className="mobile-link" to="/category/animals/0" onClick={() => setIsMenuOpen(false)}>Animals</Link>
            <Link className="mobile-link" to="/category/numbers/0" onClick={() => setIsMenuOpen(false)}>Numbers</Link>
            <Link className="mobile-link" to="/category/colors/0" onClick={() => setIsMenuOpen(false)}>Colors</Link>
            {isAuth && <Link className="mobile-link" to="/add-product" onClick={() => setIsMenuOpen(false)}>Add Product</Link>}
          </div>
        </div>
      )}

      {/* modals */}
      <CreateCardModal
        open={showCreateCard}
        onClose={() => setShowCreateCard(false)}
        categories={categories}
        onCreated={(updatedCategory) => {
          if (updatedCategory && updatedCategory.id) {
            const exists = categories.find((c) => c.id === updatedCategory.id);
            const next = exists ? categories.map((c) => (c.id === updatedCategory.id ? updatedCategory : c)) : [updatedCategory, ...categories];
            setCategories(next);
            try { localStorage.setItem("localCategories", JSON.stringify(next)); } catch {}
            const lastIndex = (updatedCategory.cards || []).length - 1;
            navigate(`/category/${encodeURIComponent(updatedCategory.id)}/${Math.max(0, lastIndex)}`);
          }
          setShowCreateCard(false);
        }}
      />

      <CreateCategoryModal
        open={showCreateCategory}
        onClose={() => setShowCreateCategory(false)}
        onCreated={(createdCategory) => {
          if (createdCategory && createdCategory.id) {
            const next = [createdCategory, ...categories];
            setCategories(next);
            try { localStorage.setItem("localCategories", JSON.stringify(next)); } catch {}
            navigate(`/category/${encodeURIComponent(createdCategory.id)}/0`);
          }
          setShowCreateCategory(false);
        }}
      />
    </>
  );
}