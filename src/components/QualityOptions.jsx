import React, { useState } from "react";

const QualityOptions = ({ quality, setQuality, customDpi, setCustomDpi }) => {
  const [showCustomDpi, setShowCustomDpi] = useState(false);

  const handleDpiChange = (e) => {
    const value = Math.min(Math.max(Number(e.target.value), 72), 1200);
    setCustomDpi(value);
  };

  return (
    <div className="quality-options">
      <h4>Quality:</h4>
      <div className="quality-buttons">
        <button
          className={`quality-btn ${quality === "best" ? "active" : ""}`}
          onClick={() => {
            setQuality("best");
            setShowCustomDpi(false);
          }}
        >
          Best
        </button>
        <button
          className={`quality-btn ${quality === "optimized" ? "active" : ""}`}
          onClick={() => {
            setQuality("optimized");
            setShowCustomDpi(false);
          }}
        >
          Optimized
        </button>
        <button
          className={`quality-btn ${quality === "custom" ? "active" : ""}`}
          onClick={() => {
            setQuality("custom");
            setShowCustomDpi(true);
          }}
        >
          Custom
        </button>
      </div>

      {showCustomDpi && (
        <div className="custom-dpi-container">
          <div className="custom-dpi-input">
            <div className="dpi-input-group">
              <input
                type="number"
                value={customDpi}
                onChange={handleDpiChange}
                min="72"
                max="1200"
                className="dpi-number-input"
              />
              <span className="dpi-label">DPI</span>
            </div>
            <div className="slider-container">
              <input
                type="range"
                min="72"
                max="1200"
                value={customDpi}
                onChange={handleDpiChange}
                className="dpi-slider"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityOptions;
