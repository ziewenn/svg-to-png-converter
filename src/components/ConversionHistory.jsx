import React from "react";

const ConversionHistory = ({ recentFiles, downloadAgain }) => {
  if (recentFiles.length === 0) return null;

  return (
    <div className="conversion-history">
      <h3>Recent Conversions</h3>
      <div className="history-list">
        {recentFiles.map((file, index) => (
          <div key={index} className="history-item">
            <img src={file.url} alt={file.name} />
            <button onClick={() => downloadAgain(file)}>Download Again</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversionHistory;
