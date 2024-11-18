import React from "react";

const QualityOptions = ({ quality, setQuality }) => {
  return (
    <div className="quality-options">
      <h4>Export Quality:</h4>
      <select
        className="quality-select"
        value={quality}
        onChange={(e) => setQuality(e.target.value)}
      >
        <option value="best">Best Quality</option>
        <option value="optimized">Optimized Size</option>
        <option value="custom">Custom DPI</option>
      </select>
    </div>
  );
};

export default QualityOptions;
