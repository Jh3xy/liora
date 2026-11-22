// Auth page logic. Demo only: nothing leaves the browser.
import {
  ROUTES,
  getSession,
  findUser,
  isTaken,
  createUser,
  startSession,
} from "./session.js";

const REDIRECT_DELAY = 1500;
const MODES = ["signin", "create"];
const LABELS = { signin: "Sign in", create: "Create account" };

const forms = {
  create: document.getElementById("create-form"),
  signin: document.getElementById("signin-form"),
};
const panels = {
  create: document.getElementById("create-panel"),
  signin: document.getElementById("signin-panel"),
};
const tablist = document.querySelector('[role="tablist"]');
const tabs = [...tablist.querySelectorAll('[role="tab"]')];
const panelsWrap = document.querySelector(".auth-panels");
const title = document.getElementById("auth-title");
const loading = document.getElementById("auth-loading");
const loadingText = loading.querySelector(".auth-loading-text");
let busy = false;

/* ---------- validation ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const PHONE_RE = /^\+[0-9]{8,15}$/;
const PASSWORD_RE = /^\S{6,}$/;
const cleanPhone = (v) => v.replace(/[\s\-().]/g, "");

// A rule returns true, or an error message string.
const createSchema = {
  fullName: (v) =>
    v.trim().length >= 2 || "Enter your full name (at least 2 characters).",
  username: (v) =>
    !USERNAME_RE.test(v.trim())
      ? "3 to 20 characters: letters, numbers and underscores only."
      : isTaken("username", v)
        ? "That username is already taken."
        : true,
  phone: (v) =>
    PHONE_RE.test(cleanPhone(v)) ||
    "Include your country code, e.g. +2348012345678.",
  country: (v) => v !== "" || "Select your country.",
  email: (v) =>
    !EMAIL_RE.test(v.trim())
      ? "Enter a valid email address."
      : isTaken("email", v)
        ? "An account with this email already exists."
        : true,
  password: (v) =>
    PASSWORD_RE.test(v) || "Use at least 6 characters, with no spaces.",
  referralId: (v) =>
    /^[\w-]{0,32}$/.test(v.trim()) ||
    "Use letters, numbers, dashes or underscores only.",
};

const signinSchema = {
  identity: (v) => v.trim() !== "" || "Enter your email or username.",
  password: (v) =>
    (v !== "" && !/\s/.test(v)) || "Enter your password (no spaces).",
};

/* ---------- error UI ---------- */
function errorEl(input) {
  let el = document.getElementById(`${input.id}-error`);
  if (!el) {
    el = document.createElement("p");
    el.className = "field-error";
    el.id = `${input.id}-error`;
    (input.closest(".password-wrapper, .select-wrapper") ?? input).after(el);
  }
  return el;
}

function setError(input, message) {
  const el = errorEl(input);
  el.textContent = message;
  input.setAttribute("aria-invalid", "true");
  input.setAttribute("aria-describedby", el.id);
}

function clearError(input) {
  const el = document.getElementById(`${input.id}-error`);
  if (el) el.textContent = "";
  input.removeAttribute("aria-invalid");
  input.removeAttribute("aria-describedby");
}

const setStatus = (form, msg) => {
  form.querySelector(".form-status").textContent = msg;
};

function clearAll(form) {
  form.querySelectorAll("[aria-invalid]").forEach((input) => clearError(input));
  setStatus(form, "");
}

function validate(form, schema) {
  const invalid = [];
  for (const [name, rule] of Object.entries(schema)) {
    const input = form.elements[name];
    const result = rule(input.value);
    if (result === true) clearError(input);
    else {
      setError(input, result);
      invalid.push(input);
    }
  }
  return invalid; // schema order matches DOM order
}

function reject(form, invalid) {
  const n = invalid.length;
  setStatus(form, `Please fix the ${n} highlighted field${n > 1 ? "s" : ""}.`);
  invalid[0].focus();
}

/* ---------- actions ---------- */
function finish(form, message, target) {
  busy = true;
  form.querySelector(".auth-submit").disabled = true;
  tablist.inert = true;
  panelsWrap.inert = true;
  loadingText.textContent = message;
  loading.hidden = false;
  setTimeout(() => location.replace(target), REDIRECT_DELAY);
}

function handleCreate() {
  const form = forms.create;
  const invalid = validate(form, createSchema);
  if (invalid.length) return reject(form, invalid);

  const f = form.elements;
  try {
    const user = createUser({
      fullName: f.fullName.value,
      username: f.username.value,
      phone: cleanPhone(f.phone.value),
      country: f.country.value,
      email: f.email.value,
      password: f.password.value,
      referralId: f.referralId.value,
    });
    startSession(user);
  } catch {
    return setStatus(
      form,
      "Could not save your account. Make sure browser storage is enabled.",
    );
  }
  finish(form, "Creating your account…", ROUTES.dashboard);
}

function handleSignin() {
  const form = forms.signin;
  const invalid = validate(form, signinSchema);
  if (invalid.length) return reject(form, invalid);

  const identity = form.elements.identity;
  const user = findUser(identity.value);
  if (!user) {
    setError(identity, "No account found with that email or username.");
    setStatus(form, "Wrong login. Check your details or create an account.");
    return identity.focus();
  }
  if (user.password !== form.elements.password.value) {
    setError(form.elements.password, "Incorrect password.");
    setStatus(form, "Wrong login. Check your details or create an account.");
    return form.elements.password.focus();
  }
  try {
    startSession(user);
  } catch {
    return setStatus(
      form,
      "Could not start a session. Make sure browser storage is enabled.",
    );
  }
  finish(form, "Signing you in…", ROUTES.dashboard);
}

/* ---------- tabs / URL ---------- */
function readMode() {
  const mode = new URLSearchParams(location.search).get("mode");
  return MODES.includes(mode) ? mode : "create";
}

function setMode(mode) {
  for (const name of MODES) {
    const active = name === mode;
    panels[name].hidden = !active;
    panels[name].classList.toggle("visible", active);
    panels[name].classList.toggle("hidden", !active);
    panels[name].setAttribute("aria-hidden", String(!active));
    if (!active) clearAll(forms[name]);
  }
  tabs.forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  title.textContent = LABELS[mode];
  document.title = `Liora | ${LABELS[mode]}`;
}

function switchTo(mode) {
  setMode(mode);
  const url = new URL(location.href);
  if (url.searchParams.get("mode") !== mode) {
    url.searchParams.set("mode", mode); // other params (like ref) are kept
    history.replaceState(null, "", url);
  }
}

/* ---------- init ---------- */
function init() {
  for (const form of Object.values(forms)) {
    const status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "alert"); // announced when its text changes
    form.prepend(status);

    form.addEventListener("input", (e) => {
      if (e.target.hasAttribute("aria-invalid")) clearError(e.target);
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (busy) return;
      setStatus(form, "");
      (readMode() === "create" ? handleCreate : handleSignin)();
    });
  }

  tabs.forEach((tab) =>
    tab.addEventListener("click", (event) => {
      event.preventDefault();
      switchTo(tab.dataset.mode);
    }),
  );

  tablist.addEventListener("keydown", (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const target = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (target === undefined) return;
    e.preventDefault();
    const next = tabs[(target + tabs.length) % tabs.length];
    next.focus();
    switchTo(next.dataset.mode);
  });

  // "Create one" link keeps its href as a no-JS fallback
  document.querySelectorAll(".auth-switch-link").forEach((link) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTo("create");
      forms.create.elements.fullName.focus();
    }),
  );

  document.querySelectorAll("[data-password-toggle]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const input = document.getElementById(btn.dataset.passwordToggle);
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "View";
      btn.setAttribute("aria-label", show ? "Hide password" : "View password");
    }),
  );

  const ref = new URLSearchParams(location.search).get("ref");
  if (ref)
    forms.create.elements.referralId.value = ref
      .replace(/[^\w-]/g, "")
      .slice(0, 32);

  window.addEventListener("popstate", () => setMode(readMode()));
  switchTo(readMode()); // also normalises a missing or invalid ?mode=
}

/* ---------- bootstrap (keep at the bottom) ---------- */
if (getSession()) {
  location.replace(ROUTES.dashboard);
} else {
  init();
}
window.addEventListener("pageshow", (e) => {
  if (e.persisted && getSession()) location.replace(ROUTES.dashboard);
});
