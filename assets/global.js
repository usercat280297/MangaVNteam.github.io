// Chặn chuột phải trên ảnh
document.addEventListener('contextmenu', e => {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

// Ngăn kéo-thả ảnh
document.addEventListener('dragstart', e => {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});
// ==== THEME (dark / light) ====
const THEME_KEY = "readerTheme";

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  const prefersDark = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || getPreferredTheme();
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
  const btn = document.getElementById("theme-toggle");
  if (btn) btn.textContent = next === "dark" ? "🌞" : "🌙";
}

function createThemeToggleButton() {
  if (document.getElementById("theme-toggle")) return; // tránh tạo trùng
  const btn = document.createElement("button");
  btn.id = "theme-toggle";
  btn.title = "Chuyển chế độ Sáng/Tối (phím T)";
  btn.textContent = (document.documentElement.getAttribute("data-theme") || getPreferredTheme()) === "dark" ? "🌞" : "🌙";
  btn.style.cssText = `
    position: fixed; left: 16px; bottom: 16px; z-index: 10000;
    padding: 10px 12px; border-radius: 12px; border: none; cursor: pointer;
    box-shadow: 0 4px 18px rgba(0,0,0,.25); background: rgba(0,0,0,.6); color: #fff;
    backdrop-filter: blur(6px);
    transition: transform 0.2s ease, background 0.2s ease;
  `;
  btn.onmouseenter = () => {
    btn.style.transform = "scale(1.15)";
    btn.style.background = "rgba(0,0,0,.8)";
  };
  btn.onmouseleave = () => {
    btn.style.transform = "scale(1)";
    btn.style.background = "rgba(0,0,0,.6)";
  };
  btn.onclick = toggleTheme;
  document.body.appendChild(btn);
}

// Đặt theme khi trang load
window.addEventListener("DOMContentLoaded", () => {
  applyTheme(getPreferredTheme());
  createThemeToggleButton();
});

// Theo hệ thống nếu user chưa chọn tay
if (window.matchMedia) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener?.("change", (e) => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? "dark" : "light");
  });
}

// Phím tắt: T để chuyển theme
document.addEventListener("keydown", (e) => {
  if (["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
  if (e.key.toLowerCase() === "t") toggleTheme();
});
// ==== NHỚ CHAP ĐANG ĐỌC ====
const LAST_CHAP_KEY = "lastChapter";

function saveLastChapter(chapId) {
  localStorage.setItem(LAST_CHAP_KEY, chapId);
}

function getLastChapter() {
  return localStorage.getItem(LAST_CHAP_KEY);
}

function showContinueReading(containerSelector = "#chapter-list") {
  const lastChap = getLastChapter();
  if (!lastChap) return;

  const container = document.querySelector(containerSelector);
  if (!container) return;

  const link = document.createElement("div");
  link.innerHTML = `
    <div style="padding: 12px; margin: 8px 0; background: var(--bg); border: 1px solid #ccc; border-radius: 8px;">
      📖 Bạn đang đọc dở: <a href="${lastChap}" style="color: var(--link); font-weight: bold;">Tiếp tục chap này</a>
    </div>
  `;
  container.prepend(link);
}

