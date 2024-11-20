import React, { useEffect, useRef, useState } from "react";

const DotBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dots, setDots] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Handle canvas resize and create dot grid
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setCanvasSize({ width, height });

      // Create denser grid of dots
      const spacing = 25; // Reduced spacing for more dots
      const newDots = [];

      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          newDots.push({ x, y, baseSize: 2 }); // Smaller base size
        }
      }

      setDots(newDots);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dots.length === 0) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerBox = document.querySelector(".converter");
      const boxRect = centerBox?.getBoundingClientRect();

      dots.forEach((dot) => {
        if (boxRect) {
          const isInBox =
            dot.x >= boxRect.left &&
            dot.x <= boxRect.right &&
            dot.y >= boxRect.top &&
            dot.y <= boxRect.bottom;

          if (isInBox) return;
        }

        const distance = Math.hypot(
          dot.x - mouseRef.current.x,
          dot.y - mouseRef.current.y
        );
        const maxDistance = 100; // Reduced radius around mouse

        if (distance < maxDistance) {
          // Calculate size and opacity based on distance
          const size = dot.baseSize * (1 + (1 - distance / maxDistance));
          const opacity = 1 * (1 - distance / maxDistance);

          ctx.beginPath();
          ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba( 	29.8, 68.6, 31.4, ${opacity})`;
          ctx.fill();
        } else {
          // Make dots completely invisible when mouse is far
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.baseSize, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0)";
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    window.addEventListener("mousemove", handleMouseMove);
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [dots, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: -1,
        backgroundColor: "transparent",
      }}
    />
  );
};

export default DotBackground;
