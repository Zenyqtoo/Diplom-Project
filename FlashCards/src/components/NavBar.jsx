import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchCardsByLabel, getCategories } from "../services/categoriesService.jsx";
import CreateCardModal from "./CreateCardModal.jsx";

export default function NavBar() {
  const navigate = useNavigate();
  const loadToken = localStorage.getItem ("accessToken")
  const [isAuth, setIsAuth] = useState(Boolean((loadToken)));


  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef(null);


  const [showCreate, setShowCreate] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    function onStorage() {
      setIsAuth(Boolean(loadToken()));
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {

    let mounted = true;
    getCategories()
      .then((cats) => { if (mounted) setCategories(cats || []); })
      .catch(() => {  });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!query || !query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }


    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchCardsByLabel(query.trim());
        setResults(res || []);
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      } finally {
        setSearching(false);
        setShowResults(true);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function handleLogout() {

    setIsAuth(false);
    navigate("/login");
  }

  function openCardResult(r) {

    navigate(`/category/${encodeURIComponent(r.categoryId)}/${r.cardIndex}`);

    setShowResults(false);
    setQuery("");
  }


  const containerRef = useRef(null);
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

  return (
    <>
      <nav className="nav" style={{ width: "100%", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/" className="brand" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: 12 }}>
            <div className="logo" aria-hidden="true" style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>KF</div>
            <div>
              <div className="title" style={{ fontSize: 16 }}>Kids Flashcards</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Learn with bright, fun cards</div>
            </div>
          </Link>
        </div>

        <div style={{ flex: 1, marginLeft: 12, marginRight: 12 }} ref={containerRef}>
          <div style={{ position: "relative" }}>
            <input
              type="search"
              placeholder="Search cards by title..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query && setShowResults(true)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid #e8e8e8" }}
            />
            {showResults && (results.length > 0 || searching) && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "white", borderRadius: 10, boxShadow: "0 8px 20px rgba(0,0,0,0.08)", zIndex: 1200, maxHeight: 320, overflowY: "auto" }}>
                {searching ? (
                  <div style={{ padding: 12, color: "var(--muted)" }}>Searching…</div>
                ) : results.length === 0 ? (
                  <div style={{ padding: 12, color: "var(--muted)" }}>No results</div>
                ) : (
                  results.map((r) => (
                    <button
                      key={r.card.id}
                      onClick={() => openCardResult(r)}
                      style={{ width: "100%", textAlign: "left", padding: 10, border: "none", background: "transparent", display: "flex", gap: 12, alignItems: "center", cursor: "pointer" }}
                    >
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f2f2f2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        {(r.card.label || "").charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{r.card.label}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.categoryTitle}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{r.cardIndex + 1}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn ghost" onClick={() => setShowCreate(true)} aria-haspopup="dialog">Create Card</button>

          <Link to="/" className="btn ghost" style={{ textDecoration: "none" }}>Home</Link>
          <Link to="/category/alphabet/0" className="btn ghost" style={{ textDecoration: "none" }}>Alphabet</Link>

          {!isAuth ? (
            <>
              <Link to="/login" className="btn" style={{ textDecoration: "none" }}>Login</Link>
              <Link to="/register" className="btn ghost" style={{ textDecoration: "none" }}>Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn" style={{ cursor: "pointer" }}>Logout</button>
          )}
        </div>
      </nav>

      <CreateCardModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        categories={categories}
        onCreated={(updatedCategory) => {

          setShowCreate(false);
          if (updatedCategory && updatedCategory.cards && updatedCategory.cards.length) {
            const lastIndex = updatedCategory.cards.length - 1;
            navigate(`/category/${encodeURIComponent(updatedCategory.id)}/${lastIndex}`);
          }
        }}
      />
    </>
  );
}