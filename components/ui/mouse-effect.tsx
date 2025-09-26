"use client";

import { useEffect, useState } from "react";

type Star = {
  id: number;
  x: number;
  y: number;
  color: string;
};

export function MouseEffect() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    let id = 0;

    const createStar = (x: number, y: number) => {
      setPos({ x, y });

      const colors = ["#ffffff", "#bfdbfe", "#60a5fa", "#22d3ee"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const newStar = { id: id++, x, y, color };
      setStars((prev) => [...prev, newStar]);

      setTimeout(() => {
        setStars((prev) => prev.filter((s) => s.id !== newStar.id));
      }, 800);
    };

    const onMouseMove = (e: MouseEvent) => {
      createStar(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        createStar(touch.clientX, touch.clientY);
      }
    };

    // 🧠 Gắn event listener không chặn scroll
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  return (
    <>
      {/* Cursor tròn (ẩn trên mobile) */}
      <div
        className="mouse-cursor"
        style={{ left: pos.x, top: pos.y }}
      />

      {/* Star sparkles */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="mouse-star"
          style={{ left: star.x, top: star.y, backgroundColor: star.color }}
        />
      ))}

      <style jsx global>{`
        html, body {
          cursor: none;
        }

        .mouse-cursor {
          position: fixed;
          width: 20px;
          height: 20px;
          border: 2px solid #60a5fa;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: transform 0.1s ease-out;
          z-index: 9999;
        }

        .mouse-star {
          position: fixed;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 8px currentColor, 0 0 16px currentColor;
          animation: starFade 0.8s ease-out forwards;
          z-index: 9998;
        }

        @keyframes starFade {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0);
          }
        }

        /* Ẩn cursor tròn trên thiết bị cảm ứng */
        @media (hover: none) and (pointer: coarse) {
          .mouse-cursor {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
