import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Home.css"; // ← Changez ici

export default function Home() {
  // ===== Reveal animations
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // ===== Floating animation for hero image
  useEffect(() => {
    const img = document.querySelector(".hero__img");
    if (!img) return;
    
    let frame = 0;
    const animate = () => {
      frame += 0.01;
      img.style.transform = `translateY(${Math.sin(frame) * 10}px)`;
      requestAnimationFrame(animate);
    };
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ===== Parallax circles background
  useEffect(() => {
    const handleMouseMove = (e) => {
      const circles = document.querySelectorAll(".parallax-circle");
      circles.forEach((circle, i) => {
        const speed = (i + 1) * 0.02;
        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        circle.style.transform = `translate(${x}px, ${y}px)`;
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ===== Stats count animation
  const statsRef = useRef(null);
  useEffect(() => {
    const container = statsRef.current;
    if (!container) return;

    const stats = container.querySelectorAll("[data-count]");
    let started = false;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started) return;
        started = true;

        stats.forEach((el) => {
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || "";
          let cur = 0;

          const step = Math.max(1, Math.floor(target / 70));
          const timer = setInterval(() => {
            cur += step;
            if (cur >= target) {
              cur = target;
              clearInterval(timer);
            }
            el.textContent = `${cur}${suffix}`;
          }, 16);
        });
      },
      { threshold: 0.35 }
    );

    io.observe(container);
    return () => io.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ===== Formations carousel
  const formations = useMemo(
    () => [
      {
        id: "front-end",
        title: "Développement Front-End",
        text: "Créer des interfaces modernes, rapides et responsive. Design propre + composants réutilisables.",
        btn: "Découvrir le Front-End",
        icon: "💻",
        tone: "tone-blue",
      },
      {
        id: "back-end",
        title: "Développement Back-End",
        text: "Construire des APIs sécurisées et scalables. Auth, base de données, architecture propre.",
        btn: "Découvrir le Back-End",
        icon: "🛠️",
        tone: "tone-teal",
      },
      {
        id: "cyber",
        title: "Cybersécurité",
        text: "Comprendre les attaques et protéger tes systèmes. OWASP, audits, bonnes pratiques.",
        btn: "Découvrir la Cybersécurité",
        icon: "🔐",
        tone: "tone-cyan",
      },
      {
        id: "devops",
        title: "DevOps & Cloud",
        text: "Automatisation, CI/CD, containers et orchestration. Déploiements modernes et scalables.",
        btn: "Découvrir le DevOps",
        icon: "☁️",
        tone: "tone-purple",
      },
    ],
    []
  );

  const carRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = carRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth - 2;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max);
  };

  useEffect(() => {
    const el = carRef.current;
    if (!el) return;
    updateArrows();

    const onScroll = () => updateArrows();
    const onResize = () => updateArrows();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByCard = (dir) => {
    const el = carRef.current;
    if (!el) return;
    const card = el.querySelector(".formation-card");
    const step = card ? card.getBoundingClientRect().width + 24 : 380;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // ===== Testimonials
  const avis = [
    {
      id: 1,
      title: "Les cours de front-end c'est incroyable",
      author: "Lina M.",
      text: "Je progresse vite et les exercices sont bien expliqués. Ça donne envie d'aller au bout.",
      img: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200",
      views: "251,232",
      stars: 5,
    },
    {
      id: 2,
      title: "La plateforme est claire et moderne",
      author: "Marc D.",
      text: "Le parcours est structuré, et j'adore voir ma progression. Très motivant.",
      img: "https://images.pexels.com/photos/1181524/pexels-photo-1181524.jpeg?auto=compress&cs=tinysrgb&w=1200",
      views: "198,445",
      stars: 5,
    },
  ];

  return (
    <div className="home">
      {/* Background decorative elements */}
      <div className="parallax-circle circle-1" />
      <div className="parallax-circle circle-2" />
      <div className="parallax-circle circle-3" />

      {/* HERO */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__left reveal reveal-left">
            <div className="hero__badge">
              <span className="badge-dot" />
              Plateforme de formation N°1
            </div>
            
            <h1 className="hero__title">
              Découvrez les différentes <span className="gradient-text">formations</span>
            </h1>
            
            <p className="hero__subtitle">
              Une plateforme moderne pour apprendre, pratiquer et valider ses compétences avec un parcours clair et structuré.
            </p>

            <div className="hero__actions">
              <button className="btn btn-primary btn-shine" onClick={() => scrollTo("formations")}>
                <span>Découvrir les formations</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="btn btn-ghost">
                S'inscrire gratuitement
              </button>
            </div>

            <div className="hero__mini">
              <div className="mini-pill">
                <span className="mini-icon">✓</span>
                Modules structurés
              </div>
              <div className="mini-pill">
                <span className="mini-icon">✓</span>
                Progression suivie
              </div>
              <div className="mini-pill">
                <span className="mini-icon">✓</span>
                Certificats reconnus
              </div>
            </div>
          </div>

          <div className="hero__right reveal reveal-right">
            <div className="hero__imageWrap">
              <div className="hero__glow" />
              <img
                className="hero__img"
                src="/etudiante.png"
                alt="Étudiant en formation"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="hero__decoration deco-1">
                <div className="deco-content">
                  <span className="deco-icon">📚</span>
                  <div>
                    <div className="deco-title">+15k</div>
                    <div className="deco-subtitle">Étudiants actifs</div>
                  </div>
                </div>
              </div>
              <div className="hero__decoration deco-2">
                <div className="deco-content">
                  <span className="deco-icon">🎯</span>
                  <div>
                    <div className="deco-title">75%</div>
                    <div className="deco-subtitle">Taux de réussite</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats reveal" ref={statsRef}>
        <div className="container">
          <div className="stats__header">
            <h2 className="sectionTitle center">Nos résultats en chiffres</h2>
            <p className="sectionDesc center">
              Une plateforme pensée pour apprendre efficacement, avec une expérience fluide et des résultats concrets.
            </p>
          </div>

          <div className="stats__grid">
            <div className="stat">
              <div className="stat__icon">👥</div>
              <div className="stat__num" data-count="15000" data-suffix="+">0</div>
              <div className="stat__label">Étudiants actifs</div>
            </div>
            <div className="stat">
              <div className="stat__icon">🎓</div>
              <div className="stat__num" data-count="75" data-suffix="%">0</div>
              <div className="stat__label">Taux de réussite</div>
            </div>
            <div className="stat">
              <div className="stat__icon">📝</div>
              <div className="stat__num" data-count="35">0</div>
              <div className="stat__label">Modules de cours</div>
            </div>
            <div className="stat">
              <div className="stat__icon">👨‍🏫</div>
              <div className="stat__num" data-count="26">0</div>
              <div className="stat__label">Experts formateurs</div>
            </div>
            <div className="stat">
              <div className="stat__icon">⭐</div>
              <div className="stat__num" data-count="16">0</div>
              <div className="stat__label">Années d'expérience</div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMATIONS */}
      <section className="formations" id="formations">
        <div className="container reveal">
          <div className="formations__header">
            <h2 className="sectionTitle center">
              Toutes les formations <span className="brand">TXLFORMA</span>
            </h2>
            <p className="sectionDesc center">
              Une sélection claire des domaines essentiels pour maîtriser le digital et booster votre carrière.
            </p>
          </div>

          <div className="carousel">
            <button
              className={`arrow left ${!canLeft ? "disabled" : ""}`}
              onClick={() => scrollByCard(-1)}
              disabled={!canLeft}
              aria-label="Précédent"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="carousel__track" ref={carRef}>
              {formations.map((f, idx) => (
                <article key={f.id} className={`formation-card ${f.tone}`} style={{"--delay": `${idx * 0.1}s`}}>
                  <div className="formation-icon">{f.icon}</div>
                  <h3 className="formation-title">{f.title}</h3>
                  <p className="formation-text">{f.text}</p>
                  <button className="btn btn-card">
                    <span>{f.btn}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </article>
              ))}
            </div>

            <button
              className={`arrow right ${!canRight ? "disabled" : ""}`}
              onClick={() => scrollByCard(1)}
              disabled={!canRight}
              aria-label="Suivant"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* AVIS */}
      <section className="avis">
        <div className="container reveal">
          <div className="avis__top">
            <div>
              <h2 className="sectionTitle">
                Ils nous font <span className="brandDark">confiance</span>
              </h2>
              <p className="avis__subtitle">Découvrez les témoignages de nos étudiants</p>
            </div>
            <button className="linkBtn" onClick={() => scrollTo("formations")}>
              Voir tous les avis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="avis__grid">
            {avis.map((a, idx) => (
              <article className="avisCard" key={a.id} style={{"--delay": `${idx * 0.15}s`}}>
                <div className="avisImg">
                  <img src={a.img} alt={a.title} loading="lazy" />
                  <div className="avisImg__overlay" />
                </div>

                <div className="avisCard__content">
                  <h3 className="avisTitle">{a.title}</h3>
                  <p className="avisText">{a.text}</p>

                  <div className="avisMeta">
                    <div className="avatar">{a.author[0]}</div>
                    <div>
                      <div className="avisAuthor">{a.author}</div>
                      <div className="avisSmall">Étudiant Front-End</div>
                    </div>
                  </div>

                  <div className="avisBottom">
                    <div className="stars">
                      {Array.from({ length: a.stars }).map((_, i) => (
                        <span key={i} className="star">★</span>
                      ))}
                    </div>
                    <div className="views">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                      {a.views}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer__grid">
          <div className="footer__brand">
            <div className="footer__logo">
              <span className="logo-icon">🎓</span>
              TXL FORMA
            </div>
            <div className="footer__sub">Plateforme de formation numérique professionnelle</div>
          </div>

          <div className="footer__links">
            <a href="#" className="footer__link">Carrières</a>
            <a href="#" className="footer__link">Politique de confidentialité</a>
            <a href="#" className="footer__link">Conditions d'utilisation</a>
            <a href="#" className="footer__link">Contact</a>
          </div>

          <div className="footer__copy">
            © 2025 TXLFORMA. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}