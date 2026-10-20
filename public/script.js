const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const nav = document.querySelector('.gooey-nav');
const navLinks = [...document.querySelectorAll('.gooey-nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const scrollMotionItems = [...document.querySelectorAll('.reveal')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const imageExpand = document.querySelector('.image-expand');
const imageDialog = document.querySelector('.image-dialog');
const imageDialogClose = document.querySelector('.image-dialog-close');
let scrollMotionFrame = 0;

function setTheme(theme) {
  root.dataset.theme = theme;
  themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#121417' : '#f3f0eb';
  try {
    localStorage.setItem('student-profile-theme', theme);
  } catch {
    // Continue to allow theme changes when local storage is unavailable.
  }
}

function setActiveLink(link) {
  if (!link) return;
  navLinks.forEach((navLink) => {
    const isActive = navLink === link;
    navLink.classList.toggle('is-active', isActive);
    if (isActive) navLink.setAttribute('aria-current', 'location');
    else navLink.removeAttribute('aria-current');
  });
  nav.style.setProperty('--active-left', `${link.offsetLeft}px`);
  nav.style.setProperty('--active-width', `${link.offsetWidth}px`);
}

let savedTheme = 'dark';
try {
  savedTheme = localStorage.getItem('student-profile-theme') || savedTheme;
} catch {
  // Use the default theme when local storage is unavailable.
}
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});
imageExpand.addEventListener('click', () => {
  imageDialog.showModal();
});
imageDialogClose.addEventListener('click', () => {
  imageDialog.close();
});
imageDialog.addEventListener('cancel', () => {
  imageDialog.close();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && imageDialog.open) imageDialog.close();
});
imageDialog.addEventListener('click', (event) => {
  if (event.target === imageDialog) imageDialog.close();
});
navLinks.forEach((link) => link.addEventListener('click', () => {
  setActiveLink(link);
}));

const initialLink = navLinks.find((link) => link.hash === window.location.hash)
  || navLinks.find((link) => link.hash === '#profile');
setActiveLink(initialLink);
window.addEventListener('resize', () => {
  setActiveLink(navLinks.find((link) => link.classList.contains('is-active')));
  scheduleScrollMotion();
});

function updateScrollMotion() {
  scrollMotionFrame = 0;
  const viewportHeight = window.innerHeight || 1;
  const travel = reducedMotion.matches ? 36 : 72;

  scrollMotionItems.forEach((item) => {
    const bounds = item.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (viewportHeight - bounds.top) / (viewportHeight + bounds.height)));
    const offset = (0.5 - progress) * travel;
    item.style.setProperty('--scroll-shift', `${offset.toFixed(1)}px`);
  });
}

function scheduleScrollMotion() {
  if (scrollMotionFrame) return;
  scrollMotionFrame = window.requestAnimationFrame(updateScrollMotion);
}

window.addEventListener('scroll', scheduleScrollMotion, { passive: true });
reducedMotion.addEventListener('change', scheduleScrollMotion);
scheduleScrollMotion();

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visibleSection = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
    if (visibleSection) {
      setActiveLink(navLinks.find((link) => link.hash === `#${visibleSection.target.id}`));
    }
  }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.2, 0.5] });
  sections.forEach((section) => sectionObserver.observe(section));
}