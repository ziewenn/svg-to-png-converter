import React, { useState, useRef } from "react";
import "./App.css";

function App() {
  const [svgFile, setSvgFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scale, setScale] = useState(1);
  const [customScale, setCustomScale] = useState("");
  const [showCustomScale, setShowCustomScale] = useState(false);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === "image/svg+xml") {
      handleFile(file);
    } else {
      alert("Please drop an SVG file");
    }
  };

  const handleFile = (file) => {
    setSvgFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      const tempImg = new Image();
      tempImg.onload = () => {
        setDimensions({
          width: tempImg.naturalWidth,
          height: tempImg.naturalHeight,
        });
        setPreview(result);
      };
      tempImg.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/svg+xml") {
      handleFile(file);
    } else {
      alert("Please select an SVG file");
    }
  };

  const convertToPng = () => {
    if (!svgFile) return;

    const canvas = canvasRef.current;
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate target dimensions
        const targetWidth = img.width * scale;
        const targetHeight = img.height * scale;

        // Check if dimensions exceed browser limits (most browsers have a max of 32767 pixels)
        const MAX_DIMENSION = 32767;
        if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
          const maxScale = Math.floor(
            Math.min(MAX_DIMENSION / img.width, MAX_DIMENSION / img.height)
          );
          alert(
            `Scale ${scale}x is too large for this image.\nMaximum safe scale is ${maxScale}x.\nPlease try a smaller scale or reduce the original SVG size.`
          );
          return;
        }

        // Set canvas dimensions
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Clear previous content
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw at scaled size directly instead of using ctx.scale
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          0,
          0,
          targetWidth,
          targetHeight
        );

        // Convert to PNG and download
        try {
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = svgFile.name.replace(
            ".svg",
            `@${scale}x.png`
          );
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } catch (e) {
          console.error("Download error:", e);
          alert("Error creating download. Please try a smaller scale.");
        }
      } catch (error) {
        console.error("Conversion error:", error);
        alert(
          `Error during conversion. Please try a smaller scale or reduce the original SVG size.`
        );
      }
    };

    img.onerror = () => {
      alert("Error loading the SVG image. Please check if the file is valid.");
    };

    img.src = preview;
  };

  const getMaxSafeScale = () => {
    if (!dimensions.width || !dimensions.height) return Infinity;

    const MAX_DIMENSION = 32767;
    return Math.floor(
      Math.min(
        MAX_DIMENSION / dimensions.width,
        MAX_DIMENSION / dimensions.height
      )
    );
  };

  // Update the scale setting functions
  const handleScaleClick = (newScale) => {
    const maxSafeScale = getMaxSafeScale();
    if (newScale > maxSafeScale) {
      alert(
        `Scale ${newScale}x is too large.\nMaximum safe scale is ${maxSafeScale}x`
      );
      return;
    }
    setScale(newScale);
  };

  const handleCustomScaleSubmit = (e) => {
    e.preventDefault();
    const numScale = parseFloat(customScale);
    const maxSafeScale = getMaxSafeScale();

    if (numScale > 0) {
      if (numScale > maxSafeScale) {
        alert(
          `Scale ${numScale}x is too large.\nMaximum safe scale is ${maxSafeScale}x`
        );
        return;
      }
      setScale(numScale);
      setShowCustomScale(false);
    } else {
      alert("Please enter a valid positive number");
    }
  };

  const getDimensionsInfo = () => {
    const maxSafeScale = getMaxSafeScale();
    return (
      <div className="dimensions-info">
        <div className="current-dimensions">
          <h4>Current Dimensions:</h4>
          <p>
            {dimensions.width} × {dimensions.height}px
          </p>
        </div>
        <div className="target-dimensions">
          <h4>Target Dimensions:</h4>
          <p>
            {Math.round(dimensions.width * scale)} ×{" "}
            {Math.round(dimensions.height * scale)}px
          </p>
        </div>
        <div className="max-scale">
          <h4>Maximum Safe Scale:</h4>
          <p>{maxSafeScale}x</p>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <h1>SVG to PNG Converter</h1>

      <div className="converter">
        <div
          className={`drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".svg"
            onChange={handleFileChange}
            className="file-input"
            id="file-input"
          />
          <label htmlFor="file-input" className="drop-zone-label">
            <div className="drop-zone-content">
              <p>Drag & Drop your SVG file here</p>
              <p>or</p>
              <button className="browse-btn">Browse Files</button>
            </div>
          </label>
        </div>

        {preview && (
          <div className="preview">
            <h3>Preview:</h3>
            <div className="preview-container">
              <img src={preview} alt="SVG preview" />
            </div>
            {getDimensionsInfo()}

            <div className="scale-options">
              <h4>Select Scale:</h4>
              {[1, 2, 4, 8, 16, 32].map((scaleOption) => (
                <button
                  key={scaleOption}
                  onClick={() => handleScaleClick(scaleOption)}
                  className={`scale-btn ${
                    scale === scaleOption ? "active" : ""
                  }`}
                >
                  {scaleOption}x
                </button>
              ))}
              <button
                onClick={() => setShowCustomScale(!showCustomScale)}
                className="scale-btn custom"
              >
                Custom
              </button>
            </div>
            {showCustomScale && (
              <form
                onSubmit={handleCustomScaleSubmit}
                className="custom-scale-form"
              >
                <input
                  type="number"
                  step="any"
                  value={customScale}
                  onChange={(e) => setCustomScale(e.target.value)}
                  placeholder="Enter scale factor"
                  className="custom-scale-input"
                />
                <button type="submit" className="scale-btn">
                  Apply
                </button>
              </form>
            )}
            <div className="convert-section">
              <button onClick={convertToPng} className="convert-btn">
                Convert to PNG ({scale}x)
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
export default App;
