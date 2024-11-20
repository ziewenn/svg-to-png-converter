import React from "react";

const PreviewOptions = ({ background, setBackground }) => {
  const backgrounds = [
    { id: "transparent", label: "Transparent" },
    { id: "white", label: "White", value: "#ffffff" },
    { id: "black", label: "Black", value: "#000000" },
  ];

  const handleBackgroundChange = (bgOption) => {
    setBackground(bgOption.value || bgOption.id);
  };

  return (
    <div className="preview-options">
      <h4>Preview Background:</h4>
      <div className="bg-options">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            className={`bg-btn ${
              background === (bg.value || bg.id) ? "active" : ""
            }`}
            onClick={() => handleBackgroundChange(bg)}
          >
            {bg.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PreviewOptions;
