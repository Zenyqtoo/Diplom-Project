import React, { useEffect, useState } from "react";
import { addCardToCategory } from "../services/categoriesService.jsx";
import "./CreateCardModal.css";

export default function CreateCardModal({ open, onClose, categories, onCreated }) {
  // состояние выбранной категории
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");

  // состояние названия карточки
  const [label, setLabel] = useState("");

  // состояние URL изображения
  const [imageUrl, setImageUrl] = useState("");

  // состояние загрузки (чтобы блокировать кнопку во время создания)
  const [loading, setLoading] = useState(false);

  // состояние ошибки при создании карточки
  const [error, setError] = useState("");

  // ошибка загрузки preview изображения
  const [imagePreviewError, setImagePreviewError] = useState(false);

  // при открытии модального окна сбрасываем все поля
  useEffect(() => {
    if (open) {
      setLabel("");
      setImageUrl("");
      setCategoryId(categories?.[0]?.id || "");
      setError("");
      setImagePreviewError(false);
    }
  }, [open, categories]);

  // если модальное окно закрыто — ничего не рендерим
  if (!open) return null;

  // функция отправки формы
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // проверка названия карточки
    if (!label.trim()) {
      setError("Please enter a card name");
      return;
    }

    // проверка URL изображения
    if (!imageUrl.trim()) {
      setError("Please enter an image URL");
      return;
    }

    setLoading(true);

    try {
      // создаем карточку и добавляем в категорию
      const updatedCategory = await addCardToCategory(categoryId, {
        label: label.trim(),
        imageUrl: imageUrl.trim(),
        speak: label.trim() // текст, который будет использоваться для озвучки
      });

      // уведомляем родительский компонент об успешном создании
      if (onCreated) onCreated(updatedCategory);

      // закрываем модальное окно
      onClose();

    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create card");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div 
      className="create-card-modal-backdrop"
      role="dialog" 
      aria-modal="true"
      // закрытие при клике вне окна
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="create-card-modal-container">

        {/* Header */}
        <div className="create-card-modal-header">
          <h2>Create New Card</h2>
          <button 
            onClick={onClose} 
            className="btn ghost"
          >
            ✖
          </button>
        </div>

        <form onSubmit={handleSubmit} className="create-card-modal-form">

          {/* выбор категории */}
          <label className="create-card-modal-label">
            Choose Category:
            <select 
              value={categoryId} 
              onChange={e => setCategoryId(e.target.value)}
              className="create-card-modal-select"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </label>

          {/* ввод названия карточки */}
          <label className="create-card-modal-label">
            Card Name:
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Example: Cat, Dog, Apple..."
              className="create-card-modal-input"
            />
          </label>

          {/* ввод URL изображения */}
          <label className="create-card-modal-label">
            Image URL:
            <input
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                setImagePreviewError(false); // сбрасываем ошибку preview при изменении URL
              }}
              placeholder="https://example.com/image.jpg"
              className="create-card-modal-input"
            />
            <small className="create-card-modal-hint">
              L
            </small>
          </label>

          {/* preview изображения */}
          {imageUrl && (
            <div className="create-card-modal-preview">
              <p className="create-card-modal-preview-title">Preview:</p>

              {!imagePreviewError ? (
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="create-card-modal-preview-image"
                  onError={() => setImagePreviewError(true)} // если изображение не загрузилось
                  onLoad={() => setImagePreviewError(false)} // если успешно загрузилось
                />
              ) : (
                <div className="create-card-modal-preview-error">
                  <p>Can't load this image. Please check the URL!</p>
                </div>
              )}

            </div>
          )}

          {/* отображение ошибки */}
          {error && (
            <div className="create-card-modal-error">
              {error}
            </div>
          )}

          {/* кнопки действий */}
          <div className="create-card-modal-footer">

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
              disabled={loading || imagePreviewError} // блокируем кнопку при загрузке или ошибке изображения
            >
              {loading ? "Creating... " : "Create Card! "}
            </button>

          </div>
        </form>

      </div>
    </div>
  );
}



