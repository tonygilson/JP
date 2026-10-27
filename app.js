// 1. Paste your keys from Supabase: Project Settings > API
const SUPABASE_URL = "https://kecsjvvprwihwainpivd.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlY3NqdnZwcndpaHdhaW5waXZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzAyNjAsImV4cCI6MjEwODY0NjI2MH0.QGH-GOZhcTm_-91IEbe3ZvB5H5Bg19iZiCv2jD0maCo";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (iso) => new Date(iso).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const fmtEnd = (iso) => new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const fmtDuration = (a, b) => {
  const m = Math.round((new Date(b) - new Date(a)) / 60000);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};
const statusLabel = (s) => s[0].toUpperCase() + s.slice(1);

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("on");
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("on"), 2800);
}
function authErrorMessage(error) {
  const m = String(error?.message ?? "").toLowerCase();
  if (m.includes("rate") && m.includes("email")) {
    return "Email limit reached for this Supabase project. Wait ~1 hour, log in with an account you already created, or in Supabase go to Authentication → Providers → Email and turn off Confirm email (for testing).";
  }
  if (m.includes("not confirmed") || m.includes("email confirmation")) {
    return "This account is not confirmed yet. Use the link in your email, or turn off Confirm email in Supabase (Authentication → Providers → Email) for instant sign-up.";
  }
  return error.message;
}
async function getProfile() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) return null;
  const { data } = await db.from("profiles").select("*").eq("id", session.user.id).single();
  return data;
}
function homeForRole(role) {
  return role === "faculty" ? "faculty.html" : "student.html";
}
async function guard(role) {
  const p = await getProfile();
  if (!p) { location.href = "index.html"; return null; }
  if (p.role !== role) { location.href = homeForRole(p.role); return null; }
  document.body.dataset.role = role;
  const who = $("#who");
  if (who) who.textContent = p.full_name;
  const dept = $("#dept");
  if (dept) dept.textContent = p.department || (role === "faculty" ? "Faculty" : "Student");
  return p;
}
async function logout() { await db.auth.signOut(); location.href = "index.html"; }
async function deleteAccount() {
  if (!confirm("Delete your account and all your booking requests? This cannot be undone.")) return;
  const { error } = await db.rpc("delete_own_account");
  if (error) { toast(error.message); return; }
  await logout();
}

// header: scroll shadow, live clock, user menu
(function () {
  const hdr = document.querySelector(".app-hdr, .fac-hdr");
  if (!hdr) return;
  const onScroll = () => hdr.classList.toggle("scrolled", scrollY > 12);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const clock = $("#clock");
  if (clock) {
    const tick = () => { const d = new Date();
      clock.innerHTML = `<b>${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</b><span>${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>`; };
    tick(); setInterval(tick, 15000);
  }
  const menu = $("#menu"), btn = $("#menuBtn");
  if (menu && btn) {
    const set = (o) => { menu.classList.toggle("open", o); btn.setAttribute("aria-expanded", o); };
    btn.onclick = (e) => { e.stopPropagation(); set(!menu.classList.contains("open")); };
    document.addEventListener("click", (e) => { if (!menu.contains(e.target) || e.target.closest(".menu-pop button")) set(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }
})();
