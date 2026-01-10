// src/components/CustomCursor.jsx
import React, { useEffect, useRef } from "react";
import "./CustomCursor.css";

export default function CustomCursor() {
  const pointerRef = useRef(null);
  const haloRef = useRef(null);

  useEffect(() => {
    const finePointer = window.matchMedia?.("(pointer: fine)")?.matches;
    if (!finePointer) return;

    const root = document.documentElement;
    root.classList.add("txl-cursor-on");

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;

    let px = tx;
    let py = ty;

    let hx = tx;
    let hy = ty;

    let lastX = tx;
    let lastY = ty;

    let targetAngle = 0;
    let currentAngle = 0;

    const normalizeAngleDiff = (a) => {
      let diff = a;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;
      return diff;
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;

      const dx = tx - lastX;
      const dy = ty - lastY;

      if (Math.abs(dx) + Math.abs(dy) > 1) {
        // +90 pour aligner la flèche (hotspot en haut)
        targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      }

      lastX = tx;
      lastY = ty;
    };

    const onDown = () => root.classList.add("txl-cursor-down");
    const onUp = () => root.classList.remove("txl-cursor-down");

    const onOver = (e) => {
      const el = e.target;

      // Hover interactif (navbar OK car ce sont des <button>)
      const isInteractive = !!el.closest(
        "a,button,[role='button'],[data-cursor='pointer']"
      );

      // On garde un comportement propre sur les champs texte
      const isTextZone = !!el.closest(
        "input,textarea,select,[contenteditable='true'],[role='textbox']"
      );

      root.classList.toggle("txl-cursor-hover", isInteractive);
      root.classList.toggle("txl-cursor-text", isTextZone);
    };

    let raf = 0;
    const tick = () => {
      // Flèche (un peu plus “snappy”)
      px += (tx - px) * 0.26;
      py += (ty - py) * 0.26;

      // Halo (plus “lag” = premium)
      hx += (tx - hx) * 0.16;
      hy += (ty - hy) * 0.16;

      // Rotation douce
      const diff = normalizeAngleDiff(targetAngle - currentAngle);
      currentAngle += diff * 0.18;

      if (pointerRef.current) {
        pointerRef.current.style.transform = `translate3d(${px}px, ${py}px, 0) rotate(${currentAngle}deg)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${hx}px, ${hy}px, 0)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      root.classList.remove("txl-cursor-on", "txl-cursor-hover", "txl-cursor-down", "txl-cursor-text");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Halo pointillé (surtout visible en hover) */}
      <div ref={haloRef} className="txlHalo" aria-hidden="true" />

      {/* Pointeur */}
      <div ref={pointerRef} className="txlPointer" aria-hidden="true">
        <svg className="txlPointer__svg" viewBox="0 0 48 48" width="42" height="42" focusable="false" aria-hidden="true">
          <defs>
            <linearGradient id="txlGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#60a5fa" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          {/* FILLED (default) */}
          <path
            className="txlPointer__fill"
            d="M12 7 L35 22 L25 25 L29 40 L23 42 L19 27 L12 34 Z"
            fill="url(#txlGrad)"
          />

          {/* OUTLINE (hover) */}
          <path
            className="txlPointer__outline"
            d="M12 7 L35 22 L25 25 L29 40 L23 42 L19 27 L12 34 Z"
            fill="transparent"
            stroke="url(#txlGrad)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />

          {/* petite ligne interne pour “premium” */}
          <path
            className="txlPointer__detail"
            d="M14 9 L31.5 22"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}
