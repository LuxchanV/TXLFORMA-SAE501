import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/home.css";

export default function Home() {
  const navigate = useNavigate();

  // Stats animation
  const statsRef = useRef(null);

  useEffect(() => {
    const stats = document.querySelectorAll(".stat-number");
    let started = false;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) {
        started = true;

        stats.forEach((stat) => {
          const target = parseInt(stat.dataset.value, 10);
          let count = 0;
          const step = target / 80;

          const timer = setInterval(() => {
            count += step;
            if (count >= target) {
              clearInterval(timer);
              stat.textContent = target + stat.dataset.suffix;
            } else {
              stat.textContent = Math.floor(count) + stat.dataset.suffix;
            }
          }, 20);
        });
      }
    });

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Slider formations
  const formations = [
    { id: 1, title: "Développement Front-End", text: "HTML, CSS, JavaScript, React.", icon: "💻" },
    { id: 2, title: "Développement Back-End", text: "Spring Boot, API, MySQL.", icon: "🛠️" },
    { id: 3, title: "Cybersécurité", text: "Réseau, attaques, protection.", icon: "🔐" },
    { id: 4, title: "UX/UI Design", text: "Figma, personas, prototypage.", icon: "🎨" },
  ];

  const sliderRef = useRef(null);
  const scrollNext = () => sliderRef.current?.scrollBy({ left: 330, behavior: "smooth" });
  const scrollPrev = () => sliderRef.current?.scrollBy({ left: -330, behavior: "smooth" });

  // Slider avis
  const testimonials = [
    {
      id: 1,
      title: "Une plateforme vraiment incroyable",
      author: "Sarah M.",
      text: "Je me sens enfin à l’aise avec le numérique.",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      views: "244 000",
    },
    {
      id: 2,
      title: "Je recommande de fou",
      author: "Bilal",
      text: "Les formateurs sont grave pédagogues.",
      image: "https://images.pexels.com/photos/1181524/pexels-photo-1181524.jpeg?auto=compress&cs=tinysrgb&w=1200",
      avatar: "https://randomuser.me/api/portraits/men/71.jpg",
      views: "203 587",
    },
  ];

  const testimonialsRef = useRef(null);
  const nextTestimonials = () => testimonialsRef.current?.scrollBy({ left: 520, behavior: "smooth" });
  const prevTestimonials = () => testimonialsRef.current?.scrollBy({ left: -520, behavior: "smooth" });

  const scrollToFormations = () => {
    document.getElementById("formations-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1>
            Découvrez nos<br />
            <span>formations digitales</span>
          </h1>

          <p className="hero-text">
            TXL FORMA est une plateforme moderne dédiée à l’apprentissage interactif.
          </p>

          <div className="hero-actions">
            <button className="hero-btn" onClick={scrollToFormations}>
              Commencer
            </button>
            <button className="hero-btn ghost" onClick={() => navigate("/catalogue")}>
              Voir le catalogue
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-circle">
            <img
              src="/fillehome.png"
              className="hero-image"
              alt="Étudiante"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.pexels.com/photos/3775146/pexels-photo-3775146.jpeg?auto=compress&cs=tinysrgb&w=900";
              }}
            />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats-section" ref={statsRef}>
        <div className="stats-header">
          <h2>Notre succès</h2>
          <p>Une plateforme complète et efficace.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-number" data-value="15000" data-suffix="+">
              0
            </span>
            <span className="stat-label">Étudiants</span>
          </div>
          <div className="stat-box">
            <span className="stat-number" data-value="95" data-suffix="%">
              0
            </span>
            <span className="stat-label">Satisfaction</span>
          </div>
          <div className="stat-box">
            <span className="stat-number" data-value="35" data-suffix="">
              0
            </span>
            <span className="stat-label">Formations</span>
          </div>
          <div className="stat-box">
            <span className="stat-number" data-value="27" data-suffix="">
              0
            </span>
            <span className="stat-label">Experts</span>
          </div>
        </div>
      </section>

      {/* FORMATIONS */}
      <section className="formations-section" id="formations-section">
        <h2>
          Toutes les formations <span className="txl-blue">TXL FORMA</span>
        </h2>
        <p className="formations-subtitle">
          Sélection de compétences essentielles pour maîtriser le digital.
        </p>

        <button className="formations-arrow left" onClick={scrollPrev}>
          ‹
        </button>
        <button className="formations-arrow right" onClick={scrollNext}>
          ›
        </button>

        <div className="formations-slider" ref={sliderRef}>
          {formations.map((f) => (
            <div key={f.id} className="formation-card">
              <div className="formation-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>

              <button className="formation-btn" onClick={() => navigate("/catalogue")}>
                Découvrir
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* AVIS */}
      <section className="testimonials-section" id="about-section">
        <h2 className="testimonials-title">Ils nous font confiance</h2>

        <button className="testimonials-arrow left" onClick={prevTestimonials}>
          ‹
        </button>
        <button className="testimonials-arrow right" onClick={nextTestimonials}>
          ›
        </button>

        <div className="testimonials-slider" ref={testimonialsRef}>
          {testimonials.map((t) => (
            <div key={t.id} className="testimonial-card">
              <div className="testimonial-image-wrapper">
                <img src={t.image} className="testimonial-image" alt={t.author} />
              </div>

              <h3 className="testimonial-title">{t.title}</h3>

              <div className="testimonial-author">
                <img src={t.avatar} className="testimonial-avatar" alt={t.author} />
                <span>{t.author}</span>
              </div>

              <p className="testimonial-text">{t.text}</p>

              <div className="testimonial-footer">
                <span className="stars">★★★★★</span>
                <span className="views">{t.views} vues</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section" id="contact-section">
        <h2>Contact</h2>
        <p>Besoin d’aide ? Notre équipe te répond rapidement.</p>
        <button className="contact-btn" onClick={() => navigate("/register")}>
          Nous contacter
        </button>
      </section>

      <footer className="footer">© 2025 TXL FORMA — Tous droits réservés</footer>
    </div>
  );
}
