import React from "react";

const ConversionHistory = ({ recentFiles, downloadAgain }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="conversion-history">
      <h4>Recent Conversions</h4>
      <div className="history-list">
        {recentFiles.map((file, index) => (
          <div key={index} className="history-item">
            <img src={file.thumbnail} alt="thumbnail" />
            <div className="history-item-info">
              <span className="filename">{file.name}</span>
              <span className="filesize">{formatFileSize(file.size)}</span>
              <span className="date">{formatDate(file.date)}</span>
            </div>
            <button
              onClick={() => downloadAgain(file)}
              className="download-again-btn"
            >
              ↓
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionHistory;
