// src/components/CustomCursor.jsx
import React, { useEffect, useRef, useState } from "react";
import "./CustomCursor.css";

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia?.("(pointer: fine)")?.matches;
    if (!finePointer) return;

    setEnabled(true);

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    // Active le mode curseur custom
    document.documentElement.classList.add("txl-cursor-on");

    // Positions
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;

    let dx = tx;
    let dy = ty;

    let rx = tx;
    let ry = ty;

    let visible = false;
    let raf = 0;

    const setVars = (el, x, y) => {
      if (!el) return;
      el.style.setProperty("--x", `${x}px`);
      el.style.setProperty("--y", `${y}px`);
    };

    const showCursor = () => {
      if (visible) return;
      visible = true;
      document.documentElement.classList.remove("txl-cursor-hidden");
    };

    const hideCursor = () => {
      document.documentElement.classList.add("txl-cursor-hidden");
    };

    const isInteractiveTarget = (target) => {
      return !!target?.closest?.(
        "a,button,[role='button'],input,select,textarea,label,.txl-brand,.txl-link,.txl-btn,.pubFooter__link,.pubFooter__cookieBtn"
      );
    };

    const isTextTarget = (target) => {
      // On laisse le curseur système (I-beam) sur champs texte
      return !!target?.closest?.("input,textarea,[contenteditable='true']");
    };

    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      showCursor();
    };

    const onOver = (e) => {
      const t = e.target;

      const interactive = isInteractiveTarget(t);
      const text = isTextTarget(t);

      document.documentElement.classList.toggle("txl-cursor-hover", interactive);
      document.documentElement.classList.toggle("txl-cursor-text", text);

      // Si text => on cache le curseur custom pour laisser l'I-beam
      // (sinon c'est pénible pour sélectionner du texte)
    };

    const onDown = () => {
      document.documentElement.classList.add("txl-cursor-down");
    };

    const onUp = () => {
      document.documentElement.classList.remove("txl-cursor-down");
    };

    const onLeave = () => {
      // évite un curseur figé visible hors fenêtre
      document.documentElement.classList.add("txl-cursor-hover");
      hideCursor();
      document.documentElement.classList.remove("txl-cursor-down");
    };

    const onEnter = () => {
      showCursor();
    };

    // Animation frame (super fluide, uniquement transform via CSS vars)
    const tick = () => {
      // dot = plus “snappy”
      const dotEase = reduceMotion ? 1 : 0.35;
      dx += (tx - dx) * dotEase;
      dy += (ty - dy) * dotEase;

      // ring = plus “cinématique”
      const ringEase = reduceMotion ? 1 : 0.14;
      rx += (tx - rx) * ringEase;
      ry += (ty - ry) * ringEase;

      setVars(dotRef.current, dx, dy);
      setVars(ringRef.current, rx, ry);

      raf = requestAnimationFrame(tick);
    };

    // Init caché jusqu’au 1er move
    document.documentElement.classList.add("txl-cursor-hidden");
    setVars(dotRef.current, -9999, -9999);
    setVars(ringRef.current, -9999, -9999);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });
    window.addEventListener("mouseup", onUp, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("mouseenter", onEnter, { passive: true });

    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove(
        "txl-cursor-on",
        "txl-cursor-hover",
        "txl-cursor-down",
        "txl-cursor-hidden",
        "txl-cursor-text"
      );

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseenter", onEnter);

      cancelAnimationFrame(raf);
    };
  }, []);

  // Sur mobile / touch : on ne rend rien
  if (!enabled) return null;

  return (
    <>
      <div ref={ringRef} className="txlRing" aria-hidden="true" />
      <div ref={dotRef} className="txlDot" aria-hidden="true" />
    </>
  );
}
