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
/**
 * ===============================
 *  GLOBAL.JS – Web đọc truyện
 * ===============================
 */

/**
 * Lấy số chap hiện tại từ URL
 * Hỗ trợ cả query (?chapter=5) và pathname (/chapter-5.html)
 */
function getCurrentChapter() {
  const url = new URL(window.location.href);

  // Ưu tiên lấy từ query
  let chap = parseInt(url.searchParams.get("chapter"));

  // Nếu không có query, thử parse từ pathname
  if (isNaN(chap)) {
    const match = url.pathname.match(/chapter-(\d+)/i);
    if (match) {
      chap = parseInt(match[1]);
    }
  }

  return isNaN(chap) ? null : chap;
}

/**
 * Điều hướng chap
 * @param {number} direction -1 = chap trước, +1 = chap sau
 */
function navigateChapter(direction) {
  const chap = getCurrentChapter();
  if (!chap) return;

  const newChap = chap + direction;
  if (newChap < 1) return; // Không cho nhỏ hơn chap 1

  // 👉 Nếu bạn dùng query param (?chapter=5)
  // window.location.href = `?chapter=${newChap}`;

  // 👉 Nếu bạn dùng file tĩnh (chapter-5.html)
  window.location.href = `/truyen/chapter-${newChap}.html`;
}

/**
 * Bắt phím tắt đọc truyện
 */
document.addEventListener("keydown", function(event) {
  // Bỏ qua nếu đang gõ trong input/textarea
  if (["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;

  switch (event.key) {
    // ---- Điều hướng chap ----
    case "ArrowLeft": // chap trước
      navigateChapter(-1);
      break;

    case "ArrowRight": // chap sau
      navigateChapter(1);
      break;

    // ---- Cuộn đọc ngắn ----
    case "ArrowUp":
      window.scrollBy({ top: -200, behavior: "smooth" });
      break;

    case "ArrowDown":
      window.scrollBy({ top: 200, behavior: "smooth" });
      break;

    // ---- Cuộn đọc dài ----
    case "PageUp":
      window.scrollBy({ top: -window.innerHeight * 0.9, behavior: "smooth" });
      break;

    case "PageDown":
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
      break;

    // ---- Space: cuộn xuống ----
    case " ":
      event.preventDefault(); // chặn nhảy trang mặc định
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
      break;

    // ---- Home / End ----
    case "Home":
      window.scrollTo({ top: 0, behavior: "smooth" });
      break;

    case "End":
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      break;
  }
});

/**
 * ===============================
 *  Popup hướng dẫn hotkey (bấm ?)
 * ===============================
 */
function createHotkeyPopup() {
  if (document.getElementById("hotkey-popup")) return;

  const popup = document.createElement("div");
  popup.id = "hotkey-popup";
  popup.innerHTML = `
    <div style="
      background: rgba(0,0,0,0.85);
      color: #fff;
      padding: 20px;
      border-radius: 12px;
      max-width: 400px;
      margin: auto;
      font-size: 14px;
      line-height: 1.6;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    ">
      <h2 style="margin-top:0; font-size:18px; text-align:center;">📖 Hướng dẫn phím tắt</h2>
      <ul style="list-style:none; padding-left:0;">
        <li><b>← / →</b> : Chap trước / sau</li>
        <li><b>↑ / ↓</b> : Cuộn ngắn lên / xuống</li>
        <li><b>PageUp / PageDown</b> : Cuộn dài</li>
        <li><b>Space</b> : Cuộn xuống</li>
        <li><b>Home / End</b> : Về đầu / cuối trang</li>
        <li><b>?</b> : Hiện/Ẩn bảng hướng dẫn</li>
      </ul>
      <div style="text-align:center; margin-top:10px;">
        <button id="close-hotkey" style="
          padding: 6px 12px;
          border: none;
          border-radius: 6px;
          background: #ff4757;
          color: white;
          cursor: pointer;
        ">Đóng</button>
      </div>
    </div>
  `;

  const overlay = document.createElement("div");
  overlay.id = "hotkey-overlay";
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;
  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Đóng khi bấm nút hoặc click nền
  document.getElementById("close-hotkey").onclick = () => overlay.remove();
  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });
}

// Toggle popup khi bấm ?
document.addEventListener("keydown", function(event) {
  if (event.key === "?" || (event.shiftKey && event.key === "/")) {
    event.preventDefault();
    const existing = document.getElementById("hotkey-overlay");
    if (existing) {
      existing.remove();
    } else {
      createHotkeyPopup();
    }
  }
});
// Hiện popup hướng dẫn ngay khi vào chap
window.addEventListener("DOMContentLoaded", () => {
  createHotkeyPopup();
});
/**
 * ===============================
 *  Nút cuộn về đầu trang
 * ===============================
 */
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
/**
 * Lấy số chap hiện tại từ URL
 * Hỗ trợ dạng: /chapters/chapter-2/index.html
 */
function getCurrentChapter() {
  const path = window.location.pathname;
  const match = path.match(/chapter-(\d+)/i);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

/**
 * Điều hướng chap theo direction
 * @param {number} direction -1 = chap trước, +1 = chap sau
 */
function navigateChapter(direction) {
  const chap = getCurrentChapter();
  if (!chap) return;

  const newChap = chap + direction;
  if (newChap < 1) return; // Không cho nhỏ hơn chap 1

  // Dẫn tới file index.html trong thư mục chap mới
  window.location.href = `../chapter-${newChap}/index.html`;
}
// ==== LẤY SỐ CHAP TỪ URL: /chapters/chapter-2/index.html ====
function getCurrentChapter() {
  const m = window.location.pathname.match(/chapter-(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

// ==== NHỚ VỊ TRÍ CUỘN TRONG CHAP (có throttle) ====
function saveScrollPosition() {
  const chap = getCurrentChapter();
  if (!chap) return;
  // chỉ lưu khi > 0 để tránh lưu 0
  const y = Math.max(0, Math.round(window.scrollY));
  try {
    localStorage.setItem(`scroll-chapter-${chap}`, String(y));
  } catch {}
}

let __scrollTimer = null;
function saveScrollPositionThrottled() {
  clearTimeout(__scrollTimer);
  __scrollTimer = setTimeout(saveScrollPosition, 200); // throttle 200ms
}

// Sự kiện lưu
window.addEventListener("scroll", saveScrollPositionThrottled, { passive: true });
window.addEventListener("beforeunload", saveScrollPosition);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") saveScrollPosition();
});

// ==== KHÔI PHỤC VỊ TRÍ CUỘN (gọi nhiều lần cho chắc sau khi ảnh load) ====
function restoreScrollPosition() {
  const chap = getCurrentChapter();
  if (!chap) return;
  let saved = null;
  try {
    saved = localStorage.getItem(`scroll-chapter-${chap}`);
  } catch {}
  const y = saved ? parseInt(saved, 10) : NaN;
  if (!isNaN(y) && y > 0) {
    // dùng "auto" để không bị lỗi ở trình duyệt cũ
    window.scrollTo({ top: y, behavior: "auto" });
  }
}

// Gọi restore sau DOM ready, và lại gọi sau khi trang/ảnh load xong
window.addEventListener("DOMContentLoaded", () => {
  // gọi sớm
  restoreScrollPosition();
  // gọi lại trễ một chút để chắc ảnh đã có kích thước
  setTimeout(restoreScrollPosition, 400);
});
window.addEventListener("load", () => {
  // gọi lần nữa khi mọi thứ đã load xong
  restoreScrollPosition();
});

// ==== NÚT "TIẾP TỤC ĐỌC" (tự ẩn sau 5s) ====
function createContinueButton() {
  const chap = getCurrentChapter();
  if (!chap) return;

  let saved = null;
  try {
    saved = localStorage.getItem(`scroll-chapter-${chap}`);
  } catch {}
  const y = saved ? parseInt(saved, 10) : NaN;

  if (isNaN(y) || y <= 0) return; // chưa có vị trí thì không hiện nút

  // Tránh tạo trùng
  if (document.getElementById("continue-btn")) return;

  const btn = document.createElement("button");
  btn.id = "continue-btn";
  btn.textContent = "⬇ Tiếp tục đọc";
  btn.style.cssText = `
    position: fixed; left: 16px; bottom: 70px; z-index: 100000;
    padding: 10px 14px; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(0,0,0,0.75); color: #fff;
    box-shadow: 0 4px 18px rgba(0,0,0,0.4);
    backdrop-filter: blur(6px);
    transition: opacity 0.5s ease, transform .2s, background .2s;
  `;
  btn.onmouseenter = () => {
    btn.style.transform = "scale(1.1)";
    btn.style.background = "rgba(0,0,0,0.9)";
  };
  btn.onmouseleave = () => {
    btn.style.transform = "scale(1)";
    btn.style.background = "rgba(0,0,0,0.75)";
  };
  btn.onclick = () => {
    const savedPos = parseInt(localStorage.getItem(`scroll-chapter-${chap}`) || "0", 10);
    if (savedPos > 0) window.scrollTo({ top: savedPos, behavior: "smooth" });
  };
  document.body.appendChild(btn);

  // Tự ẩn sau 5 giây
  setTimeout(() => {
    if (!btn.isConnected) return;
    btn.style.opacity = "0";
    setTimeout(() => btn.remove(), 600);
  }, 5000);
}

// Tạo nút sau DOM ready, và gọi lại một nhịp sau để chắc có savedPos
window.addEventListener("DOMContentLoaded", () => {
  createContinueButton();
  setTimeout(createContinueButton, 500);
});
// ==== TOOLBAR CHỈ HIỆN TRONG CHAP ====
function createReaderToolbar() {
  const chap = getCurrentChapter();
  if (!chap) return; // chỉ hiện khi ở trong chap

  // Nếu đã có toolbar thì không tạo lại
  if (document.getElementById("reader-toolbar")) return;

  const bar = document.createElement("div");
  bar.id = "reader-toolbar";
  bar.style.cssText = `
    position: fixed; left: 16px; bottom: 16px;
    display: flex; flex-direction: column; gap: 10px;
    z-index: 10000;
  `;

  // === Nút đổi theme ===
  const themeBtn = document.createElement("button");
  themeBtn.textContent = "🌙";
  themeBtn.style.cssText = baseBtnStyle();
  themeBtn.onclick = toggleTheme;
  bar.appendChild(themeBtn);

  // === Nút auto scroll ===
  const autoBtn = document.createElement("button");
  autoBtn.textContent = "⇩ Auto";
  autoBtn.style.cssText = baseBtnStyle();
  autoBtn.onclick = () => toggleAutoScroll(autoBtn);
  bar.appendChild(autoBtn);

  document.body.appendChild(bar);
}

// ==== STYLE DÙNG CHUNG ====
function baseBtnStyle() {
  return `
    padding: 10px 14px; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(0,0,0,0.7); color: #fff;
    box-shadow: 0 4px 18px rgba(0,0,0,0.4);
    backdrop-filter: blur(6px);
    transition: transform .2s, background .2s;
  `;
}

// ==== AUTO SCROLL ====
let autoScrollInterval = null;
function toggleAutoScroll(btn) {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
    btn.textContent = "⇩ Auto";
    btn.style.background = "rgba(0,0,0,0.7)";
  } else {
    autoScrollInterval = setInterval(() => {
      window.scrollBy(0, 4);
      if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 30) {
        toggleAutoScroll(btn); // auto dừng khi hết trang
      }
    }, 30);
    btn.textContent = "⏸ Stop";
    btn.style.background = "rgba(0,180,0,0.8)";
  }
}

// ==== GỌI TẠO TOOLBAR KHI VÀO CHAP ====
window.addEventListener("DOMContentLoaded", () => {
  createReaderToolbar();
});

// ==== THANH TIẾN ĐỘ ĐỌC ỔN ĐỊNH (VẠCH CHIA + HIGHLIGHT + CLICK) ====
(function () {
  let io = null;                // IntersectionObserver
  let currentPage = 1;          // trang hiện tại (1-based)
  let indexMap = new Map();     // img -> index
  let visibleRatios = new Map();// img -> tỉ lệ hiển thị

  function getImgs() {
    // Chỉ đếm ảnh trang truyện: có thể giới hạn phạm vi nếu bạn có container riêng
    return Array.from(document.querySelectorAll("img"));
  }

  function ensureUI() {
    if (document.getElementById("progress-wrapper")) return;

    // Wrapper thanh
    const wrapper = document.createElement("div");
    wrapper.id = "progress-wrapper";
    wrapper.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%;
      height: 10px; background: rgba(0,0,0,0.15);
      z-index: 99999;
    `;

    // Lớp trong (để đặt bar phía dưới và vạch phía trên)
    const inner = document.createElement("div");
    inner.id = "progress-inner";
    inner.style.cssText = `position: relative; width: 100%; height: 100%;`;

    // Thanh % nền dưới
    const bar = document.createElement("div");
    bar.id = "reading-progress";
    bar.style.cssText = `
      position: absolute; inset: 0 0 0 0;
      width: 0%; height: 100%;
      background: linear-gradient(90deg,#4cafef,#2196f3,#673ab7);
      transition: width .1s linear;
      pointer-events: none;
    `;

    // Hàng vạch chia
    const segRow = document.createElement("div");
    segRow.id = "progress-segs";
    segRow.style.cssText = `
      position: relative; z-index: 1;
      display: flex; width: 100%; height: 100%;
      cursor: pointer;
    `;

    inner.appendChild(bar);
    inner.appendChild(segRow);
    wrapper.appendChild(inner);
    document.body.appendChild(wrapper);

    // Nhãn %
    const label = document.createElement("div");
    label.id = "progress-label";
    label.style.cssText = `
      position: fixed; top: 12px; right: 16px;
      font-size: 13px; color: #fff; font-weight: 600;
      background: rgba(0,0,0,0.6);
      padding: 2px 8px; border-radius: 6px;
      backdrop-filter: blur(4px);
      z-index: 100000;
    `;
    document.body.appendChild(label);
  }

  function buildSegments() {
    const segRow = document.getElementById("progress-segs");
    if (!segRow) return;
    segRow.innerHTML = "";

    const imgs = getImgs();
    const frag = document.createDocumentFragment();
    imgs.forEach((img, i) => {
      const seg = document.createElement("div");
      seg.className = "progress-seg";
      seg.style.cssText = `
        flex: 1; background: transparent;
        border-right: 1px solid rgba(0,0,0,0.35);
        transition: background .15s;
      `;
      if (i === imgs.length - 1) seg.style.borderRight = "none";
      seg.addEventListener("click", () => {
        img.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      frag.appendChild(seg);
    });
    segRow.appendChild(frag);
  }

  function observeImages() {
    // Hủy observer cũ (nếu có)
    if (io) {
      io.disconnect();
      io = null;
    }

    const imgs = getImgs();
    indexMap.clear();
    visibleRatios.clear();
    imgs.forEach((img, i) => indexMap.set(img, i));

    // Dùng IntersectionObserver để chọn ảnh đang hiện nhiều nhất
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!indexMap.has(e.target)) return;
          visibleRatios.set(e.target, e.intersectionRatio);
        });

        // Tìm ảnh có tỉ lệ hiển thị lớn nhất trong viewport
        let bestIdx = currentPage - 1;
        let bestRatio = -1;
        visibleRatios.forEach((ratio, el) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestIdx = indexMap.get(el);
          }
        });

        // Nếu không có cái nào > 0 (ở sát viền), fallback: gần top nhất
        if (bestRatio <= 0) {
          let minOffset = Infinity;
          imgs.forEach((img, i) => {
            const offset = Math.abs(img.getBoundingClientRect().top);
            if (offset < minOffset) {
              minOffset = offset;
              bestIdx = i;
            }
          });
        }

        currentPage = Math.max(1, Math.min(imgs.length, bestIdx + 1));
        updateUI(); // chỉ cập nhật highlight/label, % do scroll quyết
      },
      {
        root: null,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    imgs.forEach((img) => io.observe(img));
  }

  function updateUI() {
    const bar = document.getElementById("reading-progress");
    const label = document.getElementById("progress-label");
    const segs = document.querySelectorAll(".progress-seg");
    const imgs = getImgs();
    if (!bar || !label || !imgs.length) return;

    const docHeight = Math.max(0, document.body.scrollHeight - window.innerHeight);
    const scrolled = docHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / docHeight)) : 0;
    const percent = (scrolled * 100).toFixed(1);
    bar.style.width = percent + "%";

    // Highlight đúng trang
    segs.forEach((seg, i) => {
      seg.style.background = i === currentPage - 1 ? "rgba(76,175,239,0.85)" : "transparent";
    });

    label.textContent = `${percent}% • ${currentPage}/${imgs.length} trang`;
  }

  function maybeRebuild() {
    // Nếu số ảnh thay đổi → rebuild vạch + observer
    const currentSegCount = document.querySelectorAll(".progress-seg").length;
    const imgCount = getImgs().length;
    if (currentSegCount !== imgCount) {
      buildSegments();
      observeImages();
      updateUI();
    }
  }

  function init() {
    const imgs = getImgs();
    if (!imgs.length) return; // không có ảnh thì thôi

    ensureUI();
    buildSegments();
    observeImages();
    updateUI();

    // Cập nhật % khi scroll/resize
    window.addEventListener("scroll", () => requestAnimationFrame(updateUI), { passive: true });
    window.addEventListener("resize", () => requestAnimationFrame(updateUI), { passive: true });

    // Nếu ảnh được thêm/xóa sau này (lazy render) → tự rebuild
    const mo = new MutationObserver(() => {
      maybeRebuild();
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("DOMContentLoaded", init);
  window.addEventListener("load", () => {
    // đảm bảo sau khi ảnh tính kích thước xong vẫn khớp
    maybeRebuild();
    updateUI();
  });
})();
// ==== TOGGLE ẨN/HIỆN UI NGOẠI TRỪ THANH PROGRESS ====
(function () {
  let uiHidden = false;

  // Liệt kê tất cả UI cần ẩn/hiện khi đọc (trừ progress bar)
  const uiSelectors = [
    "#progress-label",     // nhãn % trang
    "#dark-toggle",        // nút dark mode
    "#scroll-toggle",      // nút auto scroll
    "#shortcut-popup",     // popup hướng dẫn
    "#continue-reading",   // nút tiếp tục đọc
    "#corner-icon"         // icon góc trái
  ];

  function toggleUI() {
    uiHidden = !uiHidden;
    uiSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        el.style.display = uiHidden ? "none" : "";
      });
    });
  }

  // Click nền (tránh click chính vào các UI)
  document.addEventListener(
    "click",
    (e) => {
      const ignoreWithin = uiSelectors.join(",");
      if (ignoreWithin && e.target.closest(ignoreWithin)) return;
      toggleUI();
    },
    true
  );
})();
document.addEventListener("DOMContentLoaded", () => {
  const reader = document.getElementById("reader");

  // Lazy load với IntersectionObserver
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        // tạo ảnh thật
        const realImg = new Image();
        realImg.src = img.dataset.src;
        realImg.className = "page-img";

        realImg.onload = () => {
          // khi load xong, thay placeholder bằng ảnh thật
          img.replaceWith(realImg);
        };

        obs.unobserve(img);
      }
    });
  }, { rootMargin: "200px 0px" });

  // Cấu hình
  const maxPages = 23;
  const loadingGif = "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExejc3YXUwN2NpNWp4cXRzY3I5dXd0bjlldXhlODkzOTRidWdiaHR2dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gx54W1mSpeYMg/giphy.gif"; // đường dẫn gif load

  // Tạo ảnh placeholder gif + lazy load
  for (let i = 0; i < maxPages; i++) {
    const placeholder = document.createElement("img");
    placeholder.src = loadingGif;
    placeholder.dataset.src = `pages/page-${String(i).padStart(3,'0')}.png`;
    placeholder.className = "page-img placeholder";
    reader.appendChild(placeholder);
    observer.observe(placeholder);
  }
});
window.addEventListener("DOMContentLoaded", () => {
  const prev = document.getElementById("prev-chap");
  const next = document.getElementById("next-chap");
  if (prev) prev.onclick = (e) => { e.preventDefault(); navigateChapter(-1); };
  if (next) next.onclick = (e) => { e.preventDefault(); navigateChapter(1); };
});
window.addEventListener("DOMContentLoaded", () => {
  const prev = document.getElementById("prev-chap");
  const next = document.getElementById("next-chap");
  if (prev) prev.onclick = (e) => { e.preventDefault(); navigateChapter(-1); };
  if (next) next.onclick = (e) => { e.preventDefault(); navigateChapter(1); };
});


