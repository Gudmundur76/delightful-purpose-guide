import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Citation — Get cited by ChatGPT, Perplexity, Claude & Google AI" },
      {
        name: "description",
        content:
          "Citation is the free platform that makes your site cited by AI engines. Scan, standardize, and get discovered — one click away.",
      },
      { property: "og:title", content: "Citation — Get cited by AI engines" },
      {
        property: "og:description",
        content:
          "Free platform to make your site cited by ChatGPT, Perplexity, Claude and Google AI.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CitationLanding,
});

const BG_URL =
  "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260624_111401_56af5012-2263-45d3-849a-8688084d7c2a.png&w=1280&q=85";

const LOGO_URL = "";


const AVATARS = [
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/aa51718fb3af3637e6d666b6543fc27a175fada6.png", orbit: 1, angle: 270, radius: 177, size: 58, radius_css: 20, glow: "#A068FF", delay: 0.6 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/ca755f7f93c1126fb8bdbf99ab364a33aa9ab272.png", orbit: 2, angle: 60, radius: 251, size: 58, radius_css: 999, glow: "#FFD166", delay: 0.9 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/dc01064c7093dcc32674876ee3cf5e41c4a485c6.png", orbit: 2, angle: 180, radius: 251, size: 78, radius_css: 999, glow: "#FF6B9D", delay: 1.1 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/d5470a58b02388336141575048720f19a50de832.png", orbit: 2, angle: 300, radius: 251, size: 58, radius_css: 20, glow: "#5B8CFF", delay: 1.3 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/018736aa5d0275c4ce56cfebaf2ae3007d81ca1e.png", orbit: 3, angle: 130, radius: 325, size: 88, radius_css: 999, glow: "#FF6B9D", delay: 1.5 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/c76d8a0b99676de31c014344bfaf75bad090758d.png", orbit: 4, angle: 30, radius: 399, size: 58, radius_css: 999, glow: "#A068FF", delay: 1.7 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/7b1b5f039de7b54cc9913e96c1923c3b15a157fa.png", orbit: 4, angle: 95, radius: 399, size: 88, radius_css: 24, glow: "#FF9F55", delay: 1.9 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/9ae171d8895199349755c43fbff00e122221a027.png", orbit: 4, angle: 220, radius: 399, size: 88, radius_css: 24, glow: "#FF6B9D", delay: 2.1 },
  { url: "https://polo-pecan-73837341.figma.site/_assets/v11/926c9eb7b4bc1df846fa0e39f0b0dc3fefd80671.png", orbit: 4, angle: 320, radius: 399, size: 58, radius_css: 999, glow: "#A068FF", delay: 2.3 },
];

const LOGOS = [
  "https://polo-pecan-73837341.figma.site/_assets/v11/1e7b0e6fcc016cd28aec5c68990118b8c54c35a5.svg",
  "https://polo-pecan-73837341.figma.site/_assets/v11/3eac03c183db2ae080d910159211c14843398b61.svg",
  "https://polo-pecan-73837341.figma.site/_assets/v11/17705a4c0023a0e5a99154dfb10582adbbf4260b.svg",
  "https://polo-pecan-73837341.figma.site/_assets/v11/0e5f442b09dc5c248e3e60d40a65505fb1887228.svg",
  "https://polo-pecan-73837341.figma.site/_assets/v11/63f99030ceb459e3c9ab9e429cfa2353491d3816.svg",
];

const HEADLINE = "Unlock AI Citations You Thought Were Out of Reach — Now Just One Click Away!";
const DARK_LEN = 52; // through the em dash + space

function useCountUp(target: number, duration = 2000, delay = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);
  return value;
}

function TypewriterHeading() {
  const [n, setN] = useState(0);
  const done = n >= HEADLINE.length;
  useEffect(() => {
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        setN((v) => {
          if (v >= HEADLINE.length) {
            clearInterval(iv);
            return v;
          }
          return v + 1;
        });
      }, 35);
      return () => clearInterval(iv);
    }, 400);
    return () => clearTimeout(start);
  }, []);
  const text = HEADLINE.slice(0, n);
  const darkPart = text.slice(0, Math.min(n, DARK_LEN));
  const lightPart = text.slice(Math.min(n, DARK_LEN));
  return (
    <h1 className="ct-h1">
      <span className="ct-h1-inner">
        <span className="ct-h1-dark">{darkPart}</span>
        <span className="ct-h1-light">{lightPart}</span>
        {!done && <span className="ct-caret" />}
      </span>
      {/* invisible full text reserves space so layout doesn't jump */}
      <span className="ct-h1-ghost" aria-hidden="true">{HEADLINE}</span>
    </h1>
  );
}

function CitationLanding() {
  const count = useCountUp(20, 2000, 1200);
  return (
    <>
      <style>{css}</style>
      <div className="ct-app" style={{ backgroundImage: `url(${BG_URL})` }}>
        <header className="ct-header">
          <div className="ct-header-left">
            <a href="/" className="ct-brand-link">
              <span className="ct-brand-mark">◎</span>
              <span className="ct-brand">citation<span className="ct-brand-dot">.is</span></span>
            </a>
            <nav className="ct-nav">
              <a href="#team">Your Team</a>
              <a href="#solutions">Solutions</a>
              <a href="#blog">Blog</a>
              <a href="#pricing">Pricing</a>
            </nav>
          </div>
          <div className="ct-header-right">
            <a href="#login" className="ct-login">Log In</a>
            <div className="btn-border-wrap">
              <a href="#join" className="ct-btn ct-btn-sm">Join Now</a>
            </div>
          </div>
        </header>

        <main className="ct-main">
          <section className="ct-left">
            <TypewriterHeading />
            <div className="ct-cta-row">
              <div className="btn-border-wrap ct-fade-in">
                <a href="#start" className="ct-btn ct-btn-lg">
                  Start Project
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
              <div className="ct-cursor-wrap ct-fade-in-late">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#A068FF" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2l16 8-7 2-2 7-7-17z" />
                </svg>
                <span className="ct-cursor-badge">David</span>
              </div>
            </div>
          </section>

          <section className="ct-right">
            <div className="ct-right-wrap">
              <div className="ct-circles">
                {[1, 2, 3, 4].map((o) => (
                  <div key={o} className={`ct-orbit ct-orbit-${o}`}>
                    {o === 1 && (
                      <div className="ct-orbit-inner">
                        <div className="ct-count">{count}k+</div>
                        <div className="ct-count-label">Citations</div>
                      </div>
                    )}
                  </div>
                ))}
                {AVATARS.map((a, i) => {
                  const style: React.CSSProperties = {
                    transform: `translate(-50%, -50%) rotate(${a.angle}deg) translate(${a.radius}px) rotate(${-a.angle}deg)`,
                    width: a.size,
                    height: a.size,
                    borderRadius: a.radius_css,
                    boxShadow: `0 0 30px ${a.glow}80, 0 0 60px ${a.glow}40`,
                    animationDelay: `${a.delay}s`,
                  };
                  return (
                    <img
                      key={i}
                      src={a.url}
                      alt=""
                      className="ct-avatar"
                      style={style}
                    />
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <div className="ct-logos">
          <div className="ct-logos-track">
            {Array.from({ length: 4 }).flatMap((_, r) =>
              LOGOS.map((l, i) => (
                <img key={`${r}-${i}`} src={l} alt="" className="ct-logo-item" />
              )),
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const css = `
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.ct-app {
  min-height: 100vh;
  background-color: #0a0a0a;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.ct-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 64px;
  max-width: 1920px;
  width: 100%;
  margin: 0 auto;
  animation: ctFadeDown 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ct-header-left { display: flex; align-items: center; gap: 40px; min-width: 0; }
.ct-brand-link { display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #000; }
.ct-brand-mark {
  display: inline-grid; place-items: center;
  width: 32px; height: 32px; border-radius: 10px;
  background: #000; color: #A068FF; font-size: 20px; line-height: 1;
  box-shadow: 0 0 0 2px rgba(160,104,255,0.35);
}
.ct-brand { font-family: 'Urbanist', sans-serif; font-weight: 700; font-size: 22px; color: #000; letter-spacing: -0.5px; }
.ct-brand-dot { color: #A068FF; }
.ct-nav { display: flex; gap: 32px; }
.ct-nav a, .ct-login {
  color: #000; font-size: 15px; font-weight: 400; text-decoration: none;
  position: relative; padding: 4px 0;
}
.ct-login { color: #fff; font-weight: 500; }
.ct-nav a::after, .ct-login::after {
  content: ''; position: absolute; left: 0; bottom: 0; height: 1.5px; width: 100%;
  background: currentColor; transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s ease;
}
.ct-nav a:hover::after, .ct-login:hover::after { transform: scaleX(1); }
.ct-header-right { display: flex; align-items: center; gap: 24px; }

.btn-border-wrap {
  position: relative;
  border-radius: 50px;
  padding: 0;
  display: inline-block;
}
.btn-border-wrap::before {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50px;
  padding: 3px;
  background: conic-gradient(from var(--border-angle), #A068FF, #070319, #A068FF, #070319, #A068FF);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: ctSpin 3s linear infinite;
  pointer-events: none;
}
@keyframes ctSpin { to { --border-angle: 360deg; } }

.ct-btn {
  position: relative;
  display: inline-flex; align-items: center; gap: 10px;
  background: #000; color: #fff;
  border-radius: 50px; text-decoration: none;
  font-weight: 500; overflow: hidden;
  isolation: isolate;
}
.ct-btn-sm { padding: 12px 26px; font-size: 15px; }
.ct-btn-lg { padding: 14px 28px; font-size: 16px; background: #060218; }
.ct-btn > * { position: relative; z-index: 2; }
.ct-btn::after {
  content: ''; position: absolute; inset: 0; background: #A068FF;
  transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 1;
}
.ct-btn-lg::after { transform: translateX(100%); }
.ct-btn:hover::after { transform: translateX(0); }

.ct-main {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  padding: 24px 64px 40px;
  max-width: 1920px;
  width: 100%;
  margin: 0 auto;
  gap: 40px;
  position: relative;
  z-index: 1;
}
.ct-left {
  min-width: 0;
  animation: ctFadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ct-h1 {
  position: relative;
  font-family: 'Urbanist', sans-serif;
  font-size: clamp(32px, 4.6vw, 64px);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -1.5px;
  margin: 0 0 32px;
}
.ct-h1-inner {
  position: absolute; inset: 0;
  display: block;
}
.ct-h1-ghost {
  visibility: hidden;
  display: block;
}
.ct-h1-dark { color: #0a0a0a; }
.ct-h1-light {
  background: linear-gradient(180deg, #ffffff 0%, #E6D6FF 100%);
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  text-shadow: 0 2px 24px rgba(0,0,0,0.25);
}
.ct-caret {
  display: inline-block; width: 3px; height: 0.9em;
  background: #A068FF; vertical-align: -0.12em;
  margin-left: 4px; animation: ctBlink 0.7s steps(2) infinite;
}
@keyframes ctBlink { 50% { opacity: 0; } }

.ct-cta-row { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.ct-fade-in { opacity: 0; animation: ctFadeUp 0.6s ease-out 3.2s forwards; }
.ct-fade-in-late { opacity: 0; animation: ctFadeUp 0.6s ease-out 3.6s forwards; }

.ct-cursor-wrap {
  display: inline-flex; align-items: center; gap: 6px;
}
.ct-cursor-badge {
  background: #A068FF; color: #fff; font-size: 14px; font-weight: 500;
  padding: 6px 14px; border-radius: 20px;
}

.ct-right {
  min-width: 0;
  display: flex; justify-content: center; align-items: center;
  animation: ctScaleIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both;
}
.ct-circles {
  position: absolute;
  top: 50%; left: 50%;
  width: 797px; height: 797px;
  transform-origin: center center;
  transform: translate(-50%, -50%) scale(var(--ct-scale, 0.75));
}
.ct-orbit {
  position: absolute; top: 50%; left: 50%;
  border-radius: 50%;
  background: linear-gradient(180deg, rgba(217, 161, 255, 0) 0%, rgba(217, 161, 255, 1) 43%, rgba(217, 161, 255, 0) 100%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  padding: 1px;
}
.ct-orbit-1 { width: 353px; height: 353px; animation: ctSpinL 30s linear infinite; }
.ct-orbit-2 { width: 501px; height: 501px; animation: ctSpinR 40s linear infinite; }
.ct-orbit-3 { width: 649px; height: 649px; animation: ctSpinR 50s linear infinite; }
.ct-orbit-4 { width: 797px; height: 797px; animation: ctSpinL 60s linear infinite; }
@keyframes ctSpinR { from { transform: translate(-50%, -50%) rotate(0); } to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes ctSpinL { from { transform: translate(-50%, -50%) rotate(0); } to { transform: translate(-50%, -50%) rotate(-360deg); } }

.ct-orbit-inner {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center; color: #fff;
  font-family: 'Urbanist', sans-serif;
}
.ct-count { font-size: clamp(36px, 4.5vw, 64px); font-weight: 600; line-height: 1; }
.ct-count-label { font-size: 14px; font-weight: 500; margin-top: 8px; opacity: 0.85; letter-spacing: 0.5px; }

.ct-avatar {
  position: absolute; top: 50%; left: 50%;
  object-fit: cover;
  opacity: 0;
  animation: ctAvatarIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
  background: #1a1a1a;
}
@keyframes ctAvatarIn {
  from { opacity: 0; filter: blur(8px); }
  to { opacity: 1; filter: blur(0); }
}

.ct-logos {
  padding: 24px 0 32px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent);
  animation: ctFadeUp 1s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both;
  position: relative; z-index: 1;
}
.ct-logos-track {
  display: flex; gap: 64px; width: max-content;
  animation: ctTicker 30s linear infinite;
}
.ct-logo-item { width: 137px; height: 40px; object-fit: contain; filter: brightness(0) invert(1); opacity: 0.75; flex-shrink: 0; }
@keyframes ctTicker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes ctFadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ctFadeUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
@keyframes ctScaleIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }

.ct-right-wrap {
  position: relative;
  width: calc(797px * var(--ct-scale, 0.75));
  height: calc(797px * var(--ct-scale, 0.75));
  display: grid; place-items: center;
  margin: 0 auto;
}

@media (min-width: 1600px) { .ct-app { --ct-scale: 0.9; } }
@media (max-width: 1280px) { .ct-app { --ct-scale: 0.62; } }
@media (max-width: 1024px) {
  .ct-app { --ct-scale: 0.5; }
  .ct-main {
    grid-template-columns: 1fr;
    padding: 8px 24px 24px;
    gap: 8px;
    text-align: left;
  }
  .ct-right { order: -1; }
  .ct-header { padding: 18px 24px; }
  .ct-nav { gap: 20px; }
}
@media (max-width: 640px) {
  .ct-app { --ct-scale: 0.38; }
  .ct-nav { display: none; }
  .ct-header { padding: 14px 18px; }
  .ct-header-left { gap: 12px; }
  .ct-login { display: none; }
  .ct-logo-item { width: 100px; height: 32px; }
  .ct-brand { font-size: 18px; }
  .ct-brand-mark { width: 28px; height: 28px; font-size: 17px; border-radius: 8px; }
  .ct-cta-row { gap: 14px; }
}
@media (max-width: 400px) {
  .ct-app { --ct-scale: 0.32; }
}
`;
