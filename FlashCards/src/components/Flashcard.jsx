import React, { useState } from "react";

export default function Flashcard({ card }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const fallbackImage = `https://via.placeholder.com/600x400/ffd166/ffffff?text=${encodeURIComponent(card?.label || "?")}`;

  const handleImageError = () => {
    console.error("Image failed to load:", card?.imageUrl);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  return (
    <div className="flashcard">
      {/* Верхняя часть с изображением */}
      <div className="flashcard-image">
        {imageLoading && !imageError && (
          <div style={{
            fontSize: "48px",
            animation: "bounce 0.6s ease-in-out infinite"
          }}>
            🎨
          </div>
        )}
        
        <img 
          src={imageError ? fallbackImage : (card?.imageUrl || fallbackImage)}
          alt={card?.label || "flashcard"}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            display: imageLoading && !imageError ? "none" : "block"
          }}
        />
      </div>

      {/* Нижняя часть с подписью */}
      <div className="flashcard-label">
        <div className="flashcard-text">{card?.label || ""}</div>
      </div>
    </div>
  );
}
