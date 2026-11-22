

// Scroll reveal: elements with [data-reveal] fade in and slide up once.
// Children of [data-stagger] get revealed one after another (0.08s apart).
// Timing lives in base.css (.js [data-reveal]).

document.querySelectorAll("[data-stagger]").forEach((group) => {
  [...group.children].forEach((el, i) => {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--reveal-delay", `${i * 0.08}s`);
  });
});

const items = document.querySelectorAll("[data-reveal]");

items.forEach((el) => {
  if (el.dataset.revealDelay) {
    el.style.setProperty("--reveal-delay", `${el.dataset.revealDelay}s`);
  }
  // once revealed, hand control back to the element's own CSS (hover transitions etc.)
  el.addEventListener("transitionend", (e) => {
    if (!el.classList.contains("is-visible")) return; // ignore the dev-mode CSS-injection fade
    if (e.target !== el || e.propertyName !== "opacity") return;
    el.removeAttribute("data-reveal");
    el.classList.remove("is-visible");
    el.style.removeProperty("--reveal-delay");
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target); // once
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

items.forEach((el) => observer.observe(el));
