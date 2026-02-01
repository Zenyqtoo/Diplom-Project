import React, { useEffect, useState } from "react";
import { addCardToCategory } from "../services/categoriesService.jsx";

export default function CreateCardModal({ open, onClose, categories, onCreated }) {
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");
  const [label, setLabel] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setLabel("");
      setImage("");
      setCategoryId(categories?.[0]?.id || "");
      setError("");
    }
  }, [open, categories]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!label.trim()) {
      setError("Please enter a label");
      return;
    }

    if (!image.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setLoading(true);
    try {
      const updatedCategory = await addCardToCategory(categoryId, {
        label: label.trim(),
        image: image.trim(),
      });

      if (onCreated) onCreated(updatedCategory);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create card");
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
          <h3>Create Card</h3>
          <button onClick={onClose} className="btn ghost">Close</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>

          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (e.g. Cat)"
            style={{ padding: 10 }}
          />

          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL"
            style={{ padding: 10 }}
          />

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
