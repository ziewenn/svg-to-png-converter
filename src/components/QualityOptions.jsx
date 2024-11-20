import React, { useState } from "react";

const QualityOptions = ({ quality, setQuality, customDpi, setCustomDpi }) => {
  const [showCustomDpi, setShowCustomDpi] = useState(false);

  const handleQualityChange = (e) => {
    const newQuality = e.target.value;
    setQuality(newQuality);
    setShowCustomDpi(newQuality === "custom");
  };

  const handleDpiChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setCustomDpi(value);
    }
  };

  return (
    <div className="quality-options">
      <h4>Export Quality:</h4>
      <select
        className="quality-select"
        value={quality}
        onChange={handleQualityChange}
      >
        <option value="best">Best Quality (300 DPI)</option>
        <option value="optimized">Optimized Size (150 DPI)</option>
        <option value="custom">Custom DPI</option>
      </select>

      {quality === "custom" && (
        <div className="custom-dpi-container">
          <input
            type="number"
            min="1"
            max="1200"
            value={customDpi}
            onChange={handleDpiChange}
            className="custom-dpi-input"
            placeholder="Enter DPI (72-1200)"
          />
          <span className="dpi-label">DPI</span>
        </div>
      )}
    </div>
  );
};

export default QualityOptions;
