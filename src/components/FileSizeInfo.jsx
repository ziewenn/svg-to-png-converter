import React from "react";

const FileSizeInfo = ({ originalSize, convertedSize }) => {
  const formatSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="file-size-info">
      <div className="size-item">
        <span>Original Size:</span>
        <strong>{formatSize(originalSize)}</strong>
      </div>
      {convertedSize > 0 && (
        <div className="size-item">
          <span>Converted Size:</span>
          <strong>{formatSize(convertedSize)}</strong>
        </div>
      )}
    </div>
  );
};

export default FileSizeInfo;
