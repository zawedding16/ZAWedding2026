// ── Dark Mode Toggle ──────────────────────────────────────────
(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('main-nav');
    if (!nav) return;

    const btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.id = 'theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.title = 'Toggle dark mode';

    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';
    const updateIcon = () => { btn.textContent = isDark() ? '☀' : '☽'; };
    updateIcon();

    btn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      document.documentElement.classList.add('theme-transitioning');
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 450);
    });

    // Respond to system preference changes only if user hasn't manually overridden
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (localStorage.getItem('theme')) return;
      const next = e.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      updateIcon();
    });

    nav.appendChild(btn);
  });
})();

// ── Back to Top ───────────────────────────────────────────────
(function () {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 200);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── Hamburger Nav Toggle ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    // Close menu when any nav link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
    // Close on outside click
    document.addEventListener('click', e => {
      if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// ── Page fade-in ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Double rAF ensures the browser has painted opacity:0 first,
  // so the transition to opacity:1 actually animates
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.documentElement.classList.add('page-loaded');
    });
  });
});

// ── Page fade-out on nav links ────────────────────────────────
document.addEventListener('click', e => {
  const link = e.target.closest('a');
  if (!link) return;
  const href = link.getAttribute('href');
  // Only handle same-site .html links
  if (!href || href.startsWith('http') || href.startsWith('#') || !href.endsWith('.html')) return;
  e.preventDefault();
  document.documentElement.classList.add('page-fade-out');
  setTimeout(() => { window.location.href = href; }, 270);
});

// ── Countdown timer ───────────────────────────────────────────
function updateCountdown() {
  const el = document.querySelector('[data-countdown]');
  if (!el) return;

  const target = new Date(el.dataset.countdown).getTime();
  const now = Date.now();
  const diff = target - now;

  const spans = el.querySelectorAll('.countdown-item span');
  if (spans.length < 4) return;

  if (diff <= 0) {
    spans[0].textContent = 0;
    spans[1].textContent = 0;
    spans[2].textContent = 0;
    spans[3].textContent = 0;
    return;
  }

  spans[0].textContent = Math.floor(diff / (1000 * 60 * 60 * 24));
  spans[1].textContent = Math.floor((diff / (1000 * 60 * 60)) % 24);
  spans[2].textContent = Math.floor((diff / (1000 * 60)) % 60);
  spans[3].textContent = Math.floor((diff / 1000) % 60);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── Scroll reveal ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
});

// ── Lightbox (highlights / memory cells) ─────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');

// Scroll-lock helpers — prevent background scroll without affecting layout
let _scrollY = 0;
function lockScroll() {
  _scrollY = window.scrollY;
  document.body.style.overflow = 'hidden';
  document.body.style.height = '100%';
}
function unlockScroll() {
  document.body.style.overflow = '';
  document.body.style.height = '';
  window.scrollTo(0, _scrollY);
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  if (lightboxImg) lightboxImg.src = '';
  unlockScroll();
}

// Person lightbox (bridesmaids / groomsmen)
const lightboxName  = document.getElementById('lightbox-name');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxBio   = document.getElementById('lightbox-bio');

function openPersonLightbox(card) {
  if (!lightbox) return;
  lightboxImg.src         = card.dataset.img   || '';
  lightboxImg.alt         = card.dataset.name  || '';
  if (lightboxName)  lightboxName.textContent  = card.dataset.name  || '';
  if (lightboxTitle) lightboxTitle.textContent = card.dataset.title || '';
  if (lightboxBio)   lightboxBio.textContent   = card.dataset.bio   || '';
  // Apply per-photo position (reads data-pos from card, e.g. data-pos="25% center")
  lightboxImg.style.objectPosition = card.dataset.pos || 'center top';
  lockScroll();
  lightbox.classList.add('open');
}

// Standard lightbox (memory cells / feature cards)
const lightboxCap = document.getElementById('lightbox-caption');

function openLightbox(imgSrc, caption) {
  if (!lightbox) return;
  lightboxImg.src = imgSrc;
  lightboxImg.alt = caption;
  if (lightboxCap) lightboxCap.textContent = caption;
  lockScroll();
  lightbox.classList.add('open');
}

// Wire up person cards
document.querySelectorAll('.person-card[data-name]').forEach(card => {
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.addEventListener('click', () => openPersonLightbox(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPersonLightbox(card);
    }
  });
});

// Wire up memory/feature cards (highlights)
document.querySelectorAll('.memory-cell[data-name], .feature-card[data-name]').forEach(cell => {
  cell.addEventListener('click', () => {
    if (!lightbox) return;
    lightboxImg.src = cell.dataset.img || '';
    lightboxImg.alt = cell.dataset.name || '';
    if (lightboxName) lightboxName.textContent  = cell.dataset.name    || '';
    if (lightboxBio)  lightboxBio.textContent   = cell.dataset.caption || '';
    if (lightboxTitle) lightboxTitle.textContent = '';
    lockScroll();
    lightbox.classList.add('open');
  });
});

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightbox) lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });