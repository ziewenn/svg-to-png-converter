import React from "react";

const FileSizeInfo = ({ originalSize, convertedSize }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="file-size-info">
      <div className="size-item">
        <span>Original:</span>
        <strong>{formatFileSize(originalSize)}</strong>
      </div>
      <div className="size-item">
        <span>Converted:</span>
        <strong>{formatFileSize(convertedSize)}</strong>
      </div>
    </div>
  );
};

export default FileSizeInfo;
