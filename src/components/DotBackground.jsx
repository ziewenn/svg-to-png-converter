import React, { useEffect, useRef, useState } from "react";

const DotBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotsRef = useRef([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setCanvasSize({ width, height });

      const spacing = 25; // Spacing between dots
      const newDots = [];

      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          newDots.push({
            x,
            y,
            baseSize: 2,
            currentSize: 2,
            targetSize: 2,
            currentOpacity: 0,
            targetOpacity: 0,
          });
        }
      }

      dotsRef.current = newDots;
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dotsRef.current.length === 0) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerBox = document.querySelector(".converter");
      const boxRect = centerBox?.getBoundingClientRect();

      dotsRef.current.forEach((dot) => {
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
        const maxDistance = 100; // Reduced from 150 to 100 for smaller radius

        // Calculate target values with increased size for closer dots
        if (distance < maxDistance) {
          const distanceFactor = 1 - distance / maxDistance;
          // Increased size multiplier for dots closer to mouse
          dot.targetSize = dot.baseSize * (1 + distanceFactor * 5);
          dot.targetOpacity = distanceFactor * 0.8; // Slightly reduced max opacity
        } else {
          dot.targetSize = dot.baseSize;
          dot.targetOpacity = 0;
        }

        // Smoother animation with adjusted easing
        const easing = 0.08; // Slightly reduced for smoother transitions
        dot.currentSize += (dot.targetSize - dot.currentSize) * easing;
        dot.currentOpacity += (dot.targetOpacity - dot.currentOpacity) * easing;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(76, 175, 80, ${dot.currentOpacity})`;
        ctx.fill();
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
  }, [canvasSize]);

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
