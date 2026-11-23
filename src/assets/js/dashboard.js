
import "./icons.js";
import { getCurrentUser, ROUTES, signOut } from "./session.js";

const menuToggleBtn = document.getElementById("menu-toggle-btn");
const drawer = document.getElementById("sidebar-drawer");
const backdrop = document.getElementById("shell-backdrop");
const spaStage = document.getElementById("spa-stage");
const chatSupportBtn = document.getElementById("chat-support-btn");

const modal = document.getElementById("app-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalActivateLink = document.getElementById("modal-activate-link");

const views = [...document.querySelectorAll(".spa-view[data-view]")];
const navTabs = [...document.querySelectorAll(".nav-tab[data-view-target]")];
const drawerLinks = [
  ...document.querySelectorAll(".drawer-link[data-view-target]"),
];
const allViewTriggers = [...document.querySelectorAll("[data-view-target]")];
const categoryChips = [
  ...document.querySelectorAll("#earn-category-chips .filter-chip"),
];
const jobCards = [...document.querySelectorAll("#earn-jobs-list .job-card")];
const earnEmptyState = document.getElementById("earn-empty-state");
const earnEmptyDesc = document.getElementById("earn-empty-desc");
const earnResetFilterBtn = document.getElementById("earn-reset-filter-btn");

let isDrawerOpen = false;
let isModalOpen = false;
let activeView = "home";

if (modalActivateLink && ROUTES?.payment) {
  modalActivateLink.setAttribute("href", ROUTES.payment);
}

function isAccountGated() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!user) return true;
  return user.subscription !== "active";
}

function syncStageScroll() {
  if (!spaStage) return;
  spaStage.style.overflowY = isDrawerOpen || isModalOpen ? "hidden" : "auto";
}

function setDrawerOpen(open) {
  isDrawerOpen = open;
  drawer?.classList.toggle("is-open", open);
  backdrop?.classList.toggle("is-open", open || isModalOpen);
  drawer?.setAttribute("aria-hidden", String(!open));
  backdrop?.setAttribute("aria-hidden", String(!(open || isModalOpen)));
  menuToggleBtn?.setAttribute("aria-expanded", String(open));
  syncStageScroll();
}

export function openGateModal() {
  if (isDrawerOpen) {
    setDrawerOpen(false);
  }
  isModalOpen = true;
  modal?.classList.add("is-open");
  backdrop?.classList.add("is-open", "is-modal-open");
  modal?.setAttribute("aria-hidden", "false");
  backdrop?.setAttribute("aria-hidden", "false");
  // modalCancelBtn?.focus();
  syncStageScroll();
}

export function closeGateModal() {
  isModalOpen = false;
  modal?.classList.remove("is-open");
  backdrop?.classList.remove("is-modal-open");
  backdrop?.classList.toggle("is-open", isDrawerOpen);
  modal?.setAttribute("aria-hidden", "true");
  backdrop?.setAttribute("aria-hidden", String(!isDrawerOpen));
  syncStageScroll();
}

function syncActiveNav(viewName) {
  navTabs.forEach((tab) => {
    const isMatch = tab.dataset.viewTarget === viewName;
    tab.classList.toggle("is-active", isMatch);
    tab.setAttribute("aria-current", isMatch ? "page" : "false");
  });

  drawerLinks.forEach((link) => {
    const isMatch = link.dataset.viewTarget === viewName;
    link.classList.toggle("is-active", isMatch);
    link.setAttribute("aria-current", isMatch ? "page" : "false");
  });
}
const logoutBtn = document.getElementById("logout-btn");

function handleLogout() {
  // Clears active session ("demo:session") and redirects to `${ROUTES.auth}?mode=signin`
  if (typeof signOut === "function") {
    signOut({ redirect: false });
  } else {
    localStorage.removeItem("demo:session");
  }

  // Optional for full-flow testing: uncomment if you also want to wipe saved demo users/data
  // localStorage.removeItem("demo:users");

  if (isDrawerOpen) {
    setDrawerOpen(false);
  }

  const signInUrl = ROUTES?.auth
    ? `${ROUTES.auth}?mode=signin`
    : "/src/auth/?mode=signin";
  location.replace(signInUrl);
}

logoutBtn?.addEventListener("click", handleLogout);

function switchView(viewName, { closeDrawer = false } = {}) {
  const targetView = views.find((view) => view.dataset.view === viewName);
  if (!targetView) return;

  activeView = viewName;

  views.forEach((view) => {
    const isTarget = view === targetView;
    view.classList.toggle("is-active", isTarget);
    view.classList.toggle("is-hidden", !isTarget);
    view.setAttribute("aria-hidden", String(!isTarget));
  });

  syncActiveNav(viewName);

  if (spaStage) {
    spaStage.scrollTo({ top: 0, behavior: "auto" });
  }

  if (closeDrawer && isDrawerOpen) {
    setDrawerOpen(false);
  }
}

function filterEarnJobs(category = "all") {
  let visibleCount = 0;

  categoryChips.forEach((chip) => {
    const isMatch = chip.dataset.category === category;
    chip.classList.toggle("is-active", isMatch);
    chip.setAttribute("aria-pressed", String(isMatch));
  });

  jobCards.forEach((card) => {
    const match = category === "all" || card.dataset.category === category;
    card.classList.toggle("is-hidden", !match);
    if (match) visibleCount += 1;
  });

  if (earnEmptyState) {
    const showEmpty = visibleCount === 0;
    earnEmptyState.classList.toggle("is-hidden", !showEmpty);
    if (showEmpty && earnEmptyDesc) {
      earnEmptyDesc.textContent =
        category === "all"
          ? "There are no remote job cards available right now."
          : `There are no remote job cards under "${category}" right now. Switch back to All categories to view open tasks.`;
    }
  }
}

// Drawer listeners
menuToggleBtn?.addEventListener("click", () => {
  setDrawerOpen(!isDrawerOpen);
});

// Backdrop closes modal first if open, otherwise closes drawer
backdrop?.addEventListener("click", () => {
  if (isModalOpen) {
    closeGateModal();
  } else if (isDrawerOpen) {
    setDrawerOpen(false);
  }
});

// Escape key closes modal first, then drawer
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (isModalOpen) {
    closeGateModal();
  } else if (isDrawerOpen) {
    setDrawerOpen(false);
    menuToggleBtn?.focus();
  }
});

// Modal close & cancel controls
modalCloseBtn?.addEventListener("click", closeGateModal);
modalCancelBtn?.addEventListener("click", closeGateModal);

// Capture-phase gatekeeper for .js-gate-restricted and any child inside it
document.addEventListener(
  "click",
  (event) => {
    const gateTrigger = event.target.closest(".js-gate-restricted");
    if (!gateTrigger) return;
    if (isAccountGated()) {
      event.preventDefault();
      event.stopPropagation();
      openGateModal();
    }
  },
  { capture: true },
);

// Chat support button fallback (if not gated, switch to support view)
chatSupportBtn?.addEventListener("click", () => {
  if (!isAccountGated()) {
    switchView("support");
  }
});

// SPA view triggers
allViewTriggers.forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    const targetView = trigger.dataset.viewTarget;
    if (!targetView) return;

    if (trigger.tagName === "A") {
      event.preventDefault();
    }

    const fromDrawer = Boolean(trigger.closest("#sidebar-drawer"));
    switchView(targetView, { closeDrawer: fromDrawer });
  });
});

// Earn category chip filter + reset button
categoryChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    filterEarnJobs(chip.dataset.category || "all");
  });
});

earnResetFilterBtn?.addEventListener("click", () => {
  filterEarnJobs("all");
});

function getInitials(name = "", fallbackHandle = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (
    String(fallbackHandle).replace(/^@/, "").slice(0, 2).toUpperCase() || "LI"
  );
}

function getFirstName(user) {
  const first = String(user?.fullName ?? "")
    .trim()
    .split(/\s+/)[0];
  return first || user?.username || "Member";
}

function formatHandle(username) {
  const clean = String(username ?? "")
    .trim()
    .replace(/^@/, "");
  return clean ? `@${clean}` : "@member";
}

function formatTitleCaseToken(value, fallback = "—") {
  if (!value) return fallback;
  return String(value)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

function formatMemberSince(isoDate) {
  if (!isoDate) return "—";
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return String(isoDate);
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function renderAvatar(el, user) {
  if (!el) return;
  if (user.avatarUrl) {
    el.innerHTML = "";
    const img = document.createElement("img");
    img.src = user.avatarUrl;
    img.alt = `${user.fullName || user.username || "User"} avatar`;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "999px";
    el.appendChild(img);
  } else {
    el.textContent = getInitials(user.fullName, user.username);
  }
}

function hydrateUserDetails() {
  const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;
  if (!user) return;

  const firstName = getFirstName(user);
  const fullName = user.fullName || firstName;
  const handle = formatHandle(user.username);
  const email = user.email || "—";
  const phone = user.phone || "—";
  const subscriptionLabel = formatTitleCaseToken(user.subscription, "Standard");
  const statusLabel = formatTitleCaseToken(
    user.accountStatus ||
      (user.subscription === "active" ? "active" : "payment_pending"),
    "Payment Pending",
  );
  const referralLabel = user.referralId ? String(user.referralId) : "—";
  const memberSinceLabel = formatMemberSince(user.memberSince);

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  // Home & Alerts
  setText("home-user-first-name", firstName);
  setText("alert-user-first-name", firstName);

  // Drawer footer
  renderAvatar(document.getElementById("drawer-avatar"), user);
  setText("drawer-user-name", fullName);
  setText("drawer-user-handle", handle);

  // Profile hero
  renderAvatar(document.getElementById("profile-avatar"), user);
  setText("profile-full-name", fullName);
  setText("profile-handle", handle);

  // Profile account details
  setText("detail-full-name", fullName);
  setText("detail-username", handle);
  setText("detail-email", email);
  setText("detail-phone", phone);
  setText("detail-subscription", subscriptionLabel);
  setText("detail-account-status", statusLabel);
  setText("detail-referral-id", referralLabel);
  setText("detail-member-since", memberSinceLabel);

  // Settings
  setText("settings-signed-in-as", `${handle} · ${email}`);
}

// Init
filterEarnJobs("all");
switchView(activeView);
hydrateUserDetails();

if (isAccountGated()) {
  openGateModal();
}

