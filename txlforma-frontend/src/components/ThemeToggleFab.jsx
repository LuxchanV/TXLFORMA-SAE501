// src/components/ThemeToggleFab.jsx
import React, { useEffect, useState } from "react";
import "./ThemeToggleFab.css";

export default function ThemeToggleFab({ show = true }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("txl_theme");
    const initial = saved || "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("txl_theme", next);
  };

  if (!show) return null;

  return (
    <button className="themeFab" type="button" onClick={toggle} aria-label="Basculer le mode sombre">
      <span className="themeFab__icon" aria-hidden="true">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
      <span className="themeFab__txt">{theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
