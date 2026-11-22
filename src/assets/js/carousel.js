
// Carousel: 5 cards on a circle. Positions come from the original's inline styles.
const root = document.querySelector("[data-carousel]");

if (root) {
  const cards = [...root.querySelectorAll(".stage-card")];
  const dots = [...root.querySelectorAll(".stage-dot")];
  const box = root.querySelector(".stage-box__inner");
  const boxBadge = box.querySelector(".stage-box__badge");
  const boxTitle = box.querySelector(".stage-box__title");
  const boxText = box.querySelector(".stage-box__text");
  const boxCta = box.querySelector(".stage-box__cta");

  const slides = [
    {
      label: "Welcome to Liora",
      title: "Earn and become a shareholder",
      text: "An all-in-one, multi-purpose project: weekly and monthly dividends, products delivered to your door, and daily ways to earn.",
      cta: "See what Lioa is",
      href: "#",
    },
    {
      label: "Watch & Earn",
      title: "Earn up to ₦3,000 Every seconds watching videos",
      text: "₦3,000 on your Liora membership — content creator, music, AI, dance, and comedy videos, every 30 seconds you watch.",
      cta: "See watch & earn",
      href: "#",
    },
    {
      label: "Play & earn",
      title: "Earn up to ₦6,000 every 60 seconds playing games",
      text: "₦6,000 on your Liora membership — win or lose, every 60 seconds of gameplay pays.",
      cta: "See Play & earn",
      href: "#",
    },
    {
      label: "Friday Bonus Rewards",
      title: "Win & withdraw ₦10,000 every Friday",
      text: "Included with Liora membership — a random number appears every Friday, tap fast to claim your ₦10,000 reward and withdraw instantly.",
      cta: "See Friday bonus rewards",
      href: "#",
    },
    {
      label: "Why Choose Us",
      title: "Users first, every time",
      text: "Expert team, transparency, data security, 24/7 support, and fast payments — built for worldwide recognition.",
      cta: "Learn More",
      href: "#",
    },
  ];

  const N = cards.length;
  const RADIUS = 400;          // px, distance of side cards from the centre
  const INTERVAL = 1500;       // ms between auto-rotations (guess)
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let active = 0;
  let timer = null;
  let swapTimer = null;
  let paused = false;

  // card/dot labels come from the same data so they never drift apart
  cards.forEach((card, i) => card.setAttribute("aria-label", "Show " + slides[i].title));
  dots.forEach((dot, i) => dot.setAttribute("aria-label", "Go to " + slides[i].title));

  function layout() {
    cards.forEach((card, i) => {
      // shortest signed distance from the active card: 0, 1, 2, -2, -1
      let offset = (((i - active) % N) + N) % N;
      if (offset > N / 2) offset -= N;

      const isActive = offset === 0;
      const theta = ((2 * Math.PI) / N) * offset;
      const d = 1 - Math.cos(theta); // 0 at the front, up to ~1.8 at the back

      card.style.zIndex = Math.round(100 - 50 * d);
      card.style.opacity = 1 - 0.35 * d;
      card.style.filter = "blur(" + 2.5 * d + "px)";
      card.style.transform = isActive
        ? "scale(1.45)"
        : "translateX(" + RADIUS * Math.sin(theta) + "px) translateY(" + -23 * d + "px) scale(" + (1 - 0.22 * d) + ")";
      card.setAttribute("aria-current", String(isActive));
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === active);
      dot.setAttribute("aria-current", String(i === active));
    });
  }

  function fillBox() {
    const s = slides[active];
    boxBadge.textContent = s.label;
    boxTitle.textContent = s.title;
    boxText.textContent = s.text;
    boxCta.textContent = s.cta;
    boxCta.href = s.href;
  }

  function swapBox() {
    clearTimeout(swapTimer);
    box.classList.add("is-swapping");
    swapTimer = setTimeout(() => {
      fillBox();
      box.classList.remove("is-swapping");
    }, 150);
  }

  function start() {
    stop();
    if (reduceMotion.matches || paused) return;
    timer = setInterval(() => go(active + 1), INTERVAL);
  }
  function stop() {
    clearInterval(timer);
  }

  function go(index) {
    active = ((index % N) + N) % N;
    layout();
    swapBox();
    start(); // restart the countdown after any change
  }

  cards.forEach((card, i) => card.addEventListener("click", () => { if (i !== active) go(i); }));
  dots.forEach((dot, i) => dot.addEventListener("click", () => go(i)));

  // pause while a mouse is over the carousel or focus is inside it
  root.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") { paused = true; stop(); } });
  root.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { paused = false; start(); } });
  root.addEventListener("focusin", () => { paused = true; stop(); });
  root.addEventListener("focusout", () => { paused = false; start(); });

  layout();
  fillBox();
  requestAnimationFrame(() => root.classList.add("is-ready")); // enable transitions after first paint
  start();
}

