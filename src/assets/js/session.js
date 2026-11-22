// DEMO ONLY: localStorage is editable by anyone with devtools.
// This gates the UI; it is not security.
const USERS_KEY = "demo:users";
const SESSION_KEY = "demo:session";

export const ROUTES = {
  auth: "/src/auth/",
  payment: "/src/payment/",
  dashboard: "/src/dashboard/",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const norm = (v) =>
  String(v ?? "")
    .trim()
    .toLowerCase();
const makeId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function getUsers() {
  const users = read(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

// Case-insensitive uniqueness check for 'username' or 'email'.
export function isTaken(field, value) {
  const key = norm(value);
  return getUsers().some((u) => norm(u[field]) === key);
}

// Email or username (a leading @ is ignored for usernames).
export function findUser(identity) {
  const key = norm(identity);
  const handle = key.replace(/^@/, "");
  return (
    getUsers().find(
      (u) => norm(u.email) === key || norm(u.username) === handle,
    ) ?? null
  );
}

export function createUser({
  fullName,
  username,
  email,
  phone,
  country,
  referralId,
  password,
}) {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  if (isTaken("username", cleanUsername) || isTaken("email", cleanEmail)) {
    throw new Error("Account already exists");
  }

  const user = {
    id: makeId(),
    fullName: fullName.trim(),
    username: cleanUsername,
    email: cleanEmail,
    password,
    phone,
    country,
    subscription: "premium",
    referralId: referralId.trim() || null,
    memberSince: new Date().toISOString(),
    avatarUrl: null,
    balance: "$00",
  };
  write(USERS_KEY, [...getUsers(), user]);
  return user;
}

export function startSession(user) {
  write(SESSION_KEY, { userId: user.id, startedAt: Date.now() });
}

export function getSession() {
  const session = read(SESSION_KEY, null);
  return session && getUsers().some((u) => u.id === session.userId)
    ? session
    : null;
}

export function getCurrentUser() {
  const session = getSession();
  return session
    ? (getUsers().find((u) => u.id === session.userId) ?? null)
    : null;
}

// Returns the user, or redirects to sign in and returns null.
export function requireSession() {
  const user = getCurrentUser();
  if (!user) {
    location.replace(`${ROUTES.auth}?mode=signin`);
    return null;
  }
  return user;
}

export function signOut({ redirect = true } = {}) {
  localStorage.removeItem(SESSION_KEY);
  if (redirect) location.replace(`${ROUTES.auth}?mode=signin`);
}

// For the payment page and profile edits.
export function updateCurrentUser(patch) {
  const session = getSession();
  if (!session) return null;
  write(
    USERS_KEY,
    getUsers().map((u) => (u.id === session.userId ? { ...u, ...patch } : u)),
  );
  return getCurrentUser();
}
