import React, { useEffect, useState } from "react";
import { addCategory } from "../services/categoriesService.jsx";

export default function CreateCategoryModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#ffd166");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle("");
      setColor("#ffd166");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Please enter a category title");
      return;
    }
    setLoading(true);
    try {
      const created = await addCategory({ title: title.trim(), color, cards: [] });
      if (onCreated) onCreated(created);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.body?.message || err?.message || "Failed to create category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" style={{
      position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.35)", zIndex: 2000
    }}>
      <div style={{ width: 560, maxWidth: "95%", background: "white", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Create category</h3>
          <button onClick={onClose} className="btn ghost">Close</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Category title (e.g. Animals)"
            style={{ padding: 10 }}
          />

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
              Color:
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 44, height: 34, border: "none", background: "transparent" }} />
            </label>
          </div>

          {error && <div style={{ color: "crimson" }}>{error}</div>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? "Creating…" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
