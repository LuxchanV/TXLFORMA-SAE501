import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  // ===== Reveal animations (pro, léger)
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

  // ===== Carousel “Toutes les formations”
  const formations = useMemo(
    () => [
      {
        id: "front-end",
        title: "Développement Front-End",
        text:
          "Créer des interfaces modernes, rapides et responsive. Design propre + composants réutilisables.",
        btn: "Découvrir le Front-End",
        route: "/formations/front-end",
        icon: "💻",
        tone: "tone-blue",
      },
      {
        id: "back-end",
        title: "Développement Back-End",
        text:
          "Construire des APIs sécurisées et scalables. Auth, base de données, architecture propre.",
        btn: "Découvrir le Back-End",
        route: "/formations/back-end",
        icon: "🛠️",
        tone: "tone-teal",
      },
      {
        id: "cyber",
        title: "Cybersécurité",
        text:
          "Comprendre les attaques et protéger tes systèmes. OWASP, audits, bonnes pratiques.",
        btn: "Découvrir la Cybersécurité",
        route: "/formations/cybersecurite",
        icon: "🔐",
        tone: "tone-cyan",
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

  // ===== Testimonials simple + propre
  const avis = [
    {
      id: 1,
      title: "Les cours de front-end c’est incroyable",
      author: "Lina",
      text:
        "Je progresse vite et les exercices sont bien expliqués. Ça donne envie d’aller au bout.",
      img: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200",
      views: "251,232",
      stars: 5,
    },
    {
      id: 2,
      title: "La plateforme est claire et moderne",
      author: "Lina",
      text:
        "Le parcours est structuré, et j’adore voir ma progression. Très motivant.",
      img: "https://images.pexels.com/photos/1181524/pexels-photo-1181524.jpeg?auto=compress&cs=tinysrgb&w=1200",
      views: "251,232",
      stars: 5,
    },
  ];

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__left reveal">
            <h1 className="hero__title">
              Découvrez les différentes <span>formations</span>
            </h1>
            <p className="hero__subtitle">
              Une plateforme moderne pour apprendre, pratiquer et valider ses compétences avec un parcours clair.
            </p>

            <div className="hero__actions">
              <button className="btn btn-primary" onClick={() => scrollTo("formations")}>
                Découvrir les formations
              </button>
              <button className="btn btn-ghost" onClick={() => navigate("/register")}>
                S’inscrire dès maintenant
              </button>
            </div>

            <div className="hero__mini">
              <div className="mini-pill">
                <span className="mini-dot" />
                Modules structurés
              </div>
              <div className="mini-pill">
                <span className="mini-dot" />
                Progression suivie
              </div>
            </div>
          </div>

          <div className="hero__right reveal">
            <div className="hero__imageWrap">
              {/* Mets ton image dans /public/hero-student.png */}
              <img
                className="hero__img"
                src="/etudiante.png"
                alt="Étudiant"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <span className="hero__circle" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats reveal" ref={statsRef}>
        <div className="container">
          <h2 className="sectionTitle center">Notre Success</h2>
          <p className="sectionDesc center">
            Une plateforme pensée pour apprendre efficacement, avec une expérience fluide et claire.
          </p>

          <div className="stats__grid">
            <div className="stat">
              <div className="stat__num" data-count="15000" data-suffix="+">0</div>
              <div className="stat__label">Students</div>
            </div>
            <div className="stat">
              <div className="stat__num" data-count="75" data-suffix="%">0</div>
              <div className="stat__label">Total success</div>
            </div>
            <div className="stat">
              <div className="stat__num" data-count="35">0</div>
              <div className="stat__label">Main questions</div>
            </div>
            <div className="stat">
              <div className="stat__num" data-count="26">0</div>
              <div className="stat__label">Chief experts</div>
            </div>
            <div className="stat">
              <div className="stat__num" data-count="16">0</div>
              <div className="stat__label">Years of experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMATIONS (Carousel) */}
      <section className="formations" id="formations">
        <div className="container reveal">
          <h2 className="sectionTitle center">
            Toutes les formations <span className="brand">TXLFORMA</span>.
          </h2>
          <p className="sectionDesc center">
            Une sélection claire des domaines essentiels pour maîtriser le digital.
          </p>

          <div className="carousel">
            <button
              className={`arrow left ${!canLeft ? "disabled" : ""}`}
              onClick={() => scrollByCard(-1)}
              disabled={!canLeft}
              aria-label="Précédent"
            >
              ‹
            </button>

            <div className="carousel__track" ref={carRef}>
              {formations.map((f) => (
                <article key={f.id} className={`formation-card ${f.tone}`}>
                  <div className="formation-icon">{f.icon}</div>
                  <h3 className="formation-title">{f.title}</h3>
                  <p className="formation-text">{f.text}</p>
                  <button className="btn btn-card" onClick={() => navigate(f.route)}>
                    {f.btn}
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
              ›
            </button>
          </div>
        </div>
      </section>

      {/* AVIS */}
      <section className="avis">
        <div className="container reveal">
          <div className="avis__top">
            <h2 className="sectionTitle">Ils nous font <span className="brandDark">confiance</span></h2>
            <button className="linkBtn" onClick={() => scrollTo("formations")}>See all</button>
          </div>

          <div className="avis__grid">
            {avis.map((a) => (
              <article className="avisCard" key={a.id}>
                <div className="avisImg">
                  <img src={a.img} alt={a.title} />
                </div>

                <h3 className="avisTitle">{a.title}</h3>

                <div className="avisMeta">
                  <div className="avatar">{a.author[0]}</div>
                  <div>
                    <div className="avisAuthor">{a.author}</div>
                    <div className="avisSmall">Class, launched less than a year ago…</div>
                  </div>
                </div>

                <div className="avisBottom">
                  <button className="linkBtn small">Read more</button>
                  <div className="stars">★★★★★</div>
                  <div className="views">👁 {a.views}</div>
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
            <div className="footer__logo">TXL FORMA</div>
            <div className="footer__sub">Gestion formation numérique</div>
          </div>

          <div className="footer__links">
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>

          <div className="footer__copy">© 2025 TXLFORMA Class Technologies Inc.</div>
        </div>
      </footer>
    </div>
  );
}
