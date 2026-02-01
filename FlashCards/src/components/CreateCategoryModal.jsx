import React, { useEffect, useState } from "react";
import { addCategory } from "../services/categoriesService.jsx";
import "./CreateCategoryModal.css";

export default function CreateCategoryModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#ffd166");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // при открытии модального окна — сбрасываем состояние
  useEffect(() => {
    if (open) {
      setTitle("");
      setColor("#ffd166");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  // отправка формы создания категории
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a category title");
      return;
    }

    setLoading(true);
    try {
      const created = await addCategory({
        title: title.trim(),
        color,
        cards: []
      });

      // передаем созданную категорию родителю
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
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Create category</h3>
          <button onClick={onClose} className="btn ghost">Close</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Category title (e.g. Animals)"
          />

          <label className="color-row">
            <span>Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </label>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn"
              disabled={loading}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
