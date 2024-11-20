import React from "react";

const FormatOptions = ({ format, setFormat }) => {
  return (
    <div className="format-options">
      <h4>Export Format:</h4>
      <select
        className="format-select"
        value={format}
        onChange={(e) => setFormat(e.target.value)}
      >
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
        <option value="ico">ICO</option>
      </select>
    </div>
  );
};

export default FormatOptions;
