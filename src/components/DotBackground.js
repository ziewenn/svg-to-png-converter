import React, { useEffect, useRef } from "react";

const DotBackground = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let dots = [];

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Create dots with smaller spacing
    const createDots = () => {
      dots = [];
      const spacing = 30; // Reduced spacing for more frequent dots
      for (let x = 0; x < canvas.width; x += spacing) {
        for (let y = 0; y < canvas.height; y += spacing) {
          dots.push({
            x,
            y,
            baseRadius: 1.5, // Increased base radius
            radius: 1.5,
          });
        }
      }
    };

    // Draw dots
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get the center box position and dimensions
      const centerBox = document.querySelector(".converter");
      const boxRect = centerBox?.getBoundingClientRect();

      dots.forEach((dot) => {
        // Check if dot is inside the center box
        if (boxRect) {
          const isInBox =
            dot.x >= boxRect.left &&
            dot.x <= boxRect.right &&
            dot.y >= boxRect.top &&
            dot.y <= boxRect.bottom;

          // Skip drawing if dot is inside the box
          if (isInBox) return;
        }

        const distance = Math.hypot(
          dot.x - mouseRef.current.x,
          dot.y - mouseRef.current.y
        );
        const maxDistance = 150; // Increased interaction distance

        if (distance < maxDistance) {
          dot.radius = dot.baseRadius + (1 - distance / maxDistance) * 4; // Increased growth factor
        } else {
          dot.radius = dot.baseRadius;
        }

        // Draw dot with higher opacity
        ctx.fillStyle = "rgba(76, 175, 80, 0.3)"; // Increased opacity
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    // Handle mouse movement
    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    // Initialize
    setCanvasSize();
    createDots();
    draw();

    // Event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", () => {
      setCanvasSize();
      createDots();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

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
        zIndex: 0,
      }}
    />
  );
};

export default DotBackground;
