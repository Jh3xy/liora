
// Navbar: scrolled state + mobile menu toggle.
const header = document.querySelector(".site-header");
const burger = document.querySelector(".nav-burger");
const menu = document.getElementById("mobile-menu");

// scrolled state (threshold is a guess; tune by eye)
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function setOpen(open) {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.hidden = !open;
}

burger.addEventListener("click", () => {
  setOpen(burger.getAttribute("aria-expanded") !== "true");
});
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setOpen(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setOpen(false);
});
window.matchMedia("(min-width: 1150px)").addEventListener("change", (e) => {
  if (e.matches) setOpen(false);
});

