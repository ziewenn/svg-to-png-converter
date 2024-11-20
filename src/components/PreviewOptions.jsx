import React from "react";

const PreviewOptions = ({ background, setBackground }) => {
  return (
    <div className="background-options">
      <button
        className={`bg-btn ${background === "transparent" ? "active" : ""}`}
        onClick={() => setBackground("transparent")}
      >
        Transparent
      </button>
      <button
        className={`bg-btn ${background === "white" ? "active" : ""}`}
        onClick={() => setBackground("white")}
      >
        White
      </button>
      <button
        className={`bg-btn ${background === "black" ? "active" : ""}`}
        onClick={() => setBackground("black")}
      >
        Black
      </button>
    </div>
  );
};

export default PreviewOptions;
