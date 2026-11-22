

const items = [...document.querySelectorAll(".faq-item")];

function setOpen(item, open) {
  item.querySelector(".faq-q").setAttribute("aria-expanded", String(open));
  item.querySelector(".accordion-panel").classList.toggle("is-open", open);
}

items.forEach((item) => {
  item.querySelector(".faq-q").addEventListener("click", () => {
    const wasOpen =
      item.querySelector(".faq-q").getAttribute("aria-expanded") === "true";
    items.forEach((other) => setOpen(other, false));
    if (!wasOpen) setOpen(item, true);
  });
});

