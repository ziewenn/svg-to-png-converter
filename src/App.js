import React, { useState, useRef } from "react";
import "./App.css";
import DotBackground from "./components/DotBackground";
import PreviewOptions from "./components/PreviewOptions";
import FileSizeInfo from "./components/FileSizeInfo";
import QualityOptions from "./components/QualityOptions";
import ProgressBar from "./components/ProgressBar";
import ConversionHistory from "./components/ConversionHistory";
import FormatOptions from "./components/FormatOptions";

function App() {
  const [svgFile, setSvgFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scale, setScale] = useState(1);
  const [customScale, setCustomScale] = useState("");
  const [showCustomScale, setShowCustomScale] = useState(false);
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [previewBg, setPreviewBg] = useState("transparent");
  const [quality, setQuality] = useState("best");
  const [progress, setProgress] = useState(0);
  const [recentFiles, setRecentFiles] = useState([]);
  const [convertedSize, setConvertedSize] = useState(0);
  const [originalSize, setOriginalSize] = useState(0);
  const [customDpi, setCustomDpi] = useState(300);
  const [format, setFormat] = useState("png");

  const createICO = async (canvas, sizes = [16, 32, 48]) => {
    try {
      // Function to create a high-quality scaled version
      const createScaledCanvas = (size) => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = size;
        tempCanvas.height = size;
        const ctx = tempCanvas.getContext("2d");

        // Enable image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill with transparent background
        ctx.clearRect(0, 0, size, size);

        // Calculate scaling to maintain aspect ratio
        const scale = Math.min(size / canvas.width, size / canvas.height);

        // Calculate centered position
        const x = (size - canvas.width * scale) / 2;
        const y = (size - canvas.height * scale) / 2;

        // Draw scaled image
        ctx.drawImage(
          canvas,
          x,
          y,
          canvas.width * scale,
          canvas.height * scale
        );

        return tempCanvas;
      };

      // Create PNG blobs for each size
      const images = await Promise.all(
        sizes.map(async (size) => {
          const scaledCanvas = createScaledCanvas(size);

          return new Promise((resolve) => {
            scaledCanvas.toBlob(
              (blob) => {
                blob.arrayBuffer().then((buffer) => {
                  resolve({
                    size,
                    buffer,
                    length: buffer.byteLength,
                  });
                });
              },
              "image/png",
              1.0
            ); // Use maximum PNG quality
          });
        })
      );

      // Calculate total size and offsets
      let offset = 6 + sizes.length * 16; // Header + Directory size
      const directory = [];

      for (const image of images) {
        directory.push({
          width: image.size,
          height: image.size,
          offset,
          size: image.length,
        });
        offset += image.length;
      }

      // Create final buffer
      const buffer = new ArrayBuffer(offset);
      const view = new DataView(buffer);

      // Write ICO header
      view.setUint16(0, 0, true); // Reserved
      view.setUint16(2, 1, true); // ICO type
      view.setUint16(4, sizes.length, true); // Number of images

      // Write directory entries
      let directoryOffset = 6;
      for (const entry of directory) {
        view.setUint8(directoryOffset, entry.width); // Width
        view.setUint8(directoryOffset + 1, entry.height); // Height
        view.setUint8(directoryOffset + 2, 0); // Color palette
        view.setUint8(directoryOffset + 3, 0); // Reserved
        view.setUint16(directoryOffset + 4, 1, true); // Color planes
        view.setUint16(directoryOffset + 6, 32, true); // Bits per pixel
        view.setUint32(directoryOffset + 8, entry.size, true); // Image size
        view.setUint32(directoryOffset + 12, entry.offset, true); // Image offset
        directoryOffset += 16;
      }

      // Write image data
      let dataOffset = 6 + sizes.length * 16;
      for (const image of images) {
        new Uint8Array(buffer).set(new Uint8Array(image.buffer), dataOffset);
        dataOffset += image.length;
      }

      return buffer;
    } catch (error) {
      console.error("Error creating ICO:", error);
      throw error;
    }
  };

  const handleDownloadAgain = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    setOriginalSize(file.size);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "image/svg+xml") {
      handleFile(file);
    } else {
      alert("Please select an SVG file");
    }
  };

  const convertImage = async () => {
    if (!svgFile) return;

    setProgress(10);
    const canvas = canvasRef.current;
    const img = new Image();

    img.onload = async () => {
      try {
        const dpi =
          quality === "best" ? 300 : quality === "optimized" ? 150 : customDpi;

        const dpiScale = dpi / 96;
        const finalScale = scale * dpiScale;

        const targetWidth = img.width * finalScale;
        const targetHeight = img.height * finalScale;

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        // Enable high-quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Clear background
        ctx.fillStyle = previewBg === "transparent" ? "transparent" : previewBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        setProgress(50);

        let blob;
        let fileExtension;
        let mimeType;

        switch (format) {
          case "webp":
            blob = await new Promise((resolve) => {
              canvas.toBlob(resolve, "image/webp", 0.9);
            });
            fileExtension = "webp";
            mimeType = "image/webp";
            break;

          case "ico":
            // Enhanced ICO sizes for better quality across different use cases
            const sizes = [16, 32, 48, 64, 128];

            // Create a temporary canvas for better downscaling
            const tempCanvas = document.createElement("canvas");
            const tempCtx = tempCanvas.getContext("2d");
            tempCanvas.width = Math.max(...sizes);
            tempCanvas.height = Math.max(...sizes);

            // Draw original image maintaining aspect ratio
            const aspectRatio = canvas.width / canvas.height;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (aspectRatio > 1) {
              drawWidth = tempCanvas.width;
              drawHeight = tempCanvas.width / aspectRatio;
              offsetX = 0;
              offsetY = (tempCanvas.height - drawHeight) / 2;
            } else {
              drawHeight = tempCanvas.height;
              drawWidth = tempCanvas.height * aspectRatio;
              offsetX = (tempCanvas.width - drawWidth) / 2;
              offsetY = 0;
            }

            // Draw with high quality settings
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = "high";
            tempCtx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight);

            const icoData = await createICO(tempCanvas, sizes);
            blob = new Blob([icoData], { type: "image/x-icon" });
            fileExtension = "ico";
            mimeType = "image/x-icon";
            break;

          default: // PNG
            blob = await new Promise((resolve) => {
              canvas.toBlob(resolve, "image/png", 1.0); // Maximum quality for PNG
            });
            fileExtension = "png";
            mimeType = "image/png";
        }

        setProgress(80);

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const fileName = svgFile.name.replace(/\.svg$/, `.${fileExtension}`);
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up previous file URL if it exists
        const newFile = {
          name: fileName,
          url,
          size: blob.size,
          date: new Date().toISOString(),
          type: mimeType,
        };

        setRecentFiles((prev) => {
          // Clean up old URLs
          prev.forEach((file) => URL.revokeObjectURL(file.url));
          return [newFile, ...prev].slice(0, 10);
        });

        setProgress(100);
        setConvertedSize(blob.size);

        setTimeout(() => {
          setProgress(0);
        }, 1000);
      } catch (error) {
        console.error("Conversion error:", error);
        setProgress(0);
        alert("Error converting the image. Please try again.");
      }
    };

    img.onerror = () => {
      setProgress(0);
      alert("Error loading the SVG image. Please check if the file is valid.");
    };

    img.src = preview;
  };

  const getMaxSafeScale = () => {
    const maxSize = 16384; // Maximum safe canvas size
    const maxScale = Math.min(
      maxSize / dimensions.width,
      maxSize / dimensions.height
    );
    return Math.floor(maxScale * 10) / 10;
  };

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
      <DotBackground />

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
            <PreviewOptions
              background={previewBg}
              setBackground={setPreviewBg}
            />
            <div className="preview-wrapper">
              <div
                className="preview-background"
                style={{
                  backgroundColor:
                    previewBg === "transparent" ? "var(--dark-bg)" : previewBg,
                }}
              >
                <img
                  src={preview}
                  alt="SVG preview"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    padding: 0,
                    margin: 0,
                  }}
                />
              </div>
            </div>

            {getDimensionsInfo()}

            <FileSizeInfo
              originalSize={originalSize}
              convertedSize={convertedSize}
            />

            <FormatOptions format={format} setFormat={setFormat} />

            <QualityOptions
              quality={quality}
              setQuality={setQuality}
              customDpi={customDpi}
              setCustomDpi={setCustomDpi}
            />

            <div className="scale-options">
              <h4>Select Scale:</h4>
              {[1, 2, 4, 8, 16].map((scaleOption) => (
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
              {progress > 0 && <ProgressBar progress={progress} />}
              <button
                onClick={convertImage}
                className="convert-btn"
                data-format={format.toUpperCase()}
              >
                Convert to {format.toUpperCase()} ({scale}x)
              </button>
            </div>
          </div>
        )}

        <ConversionHistory
          recentFiles={recentFiles}
          downloadAgain={handleDownloadAgain}
        />

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}

export default App;
