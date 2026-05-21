// ─── Nav scroll border ───────────────────────────────────
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ─── Mobile menu ─────────────────────────────────────────
burger && burger.addEventListener('click', () => navLinks && navLinks.classList.toggle('open'));
navLinks && navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') navLinks.classList.remove('open');
});

// ─── Active nav link (highlight current page) ────────────
(function() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop().split('#')[0] || 'index.html';
    if (href === path) a.classList.add('active');
  });
})();

// ─── Scroll reveal ───────────────────────────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ─── Waitlist email forms ────────────────────────────────
function handleForm(formId, successId, errorId) {
  const form    = document.getElementById(formId);
  const success = document.getElementById(successId);
  const error   = document.getElementById(errorId);
  if (!form) return;
  const input = form.querySelector('input[type=email]');
  input && input.addEventListener('input', () => error && error.classList.remove('show'));
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input ? input.value.trim().toLowerCase() : '';
    error && error.classList.remove('show');
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isCa  = /\.ca$/.test(val);
    if (!valid || !isCa) {
      error && error.classList.add('show');
      return;
    }
    form.style.display = 'none';
    success && success.classList.add('show');
  });
}
handleForm('heroForm', 'heroSuccess', 'heroError');
handleForm('ctaForm',  'ctaSuccess',  'ctaError');

// ─── FAQ accordion ───────────────────────────────────────
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-btn').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      const body = document.getElementById(b.getAttribute('aria-controls'));
      if (body) body.classList.remove('open');
    });
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      const body = document.getElementById(btn.getAttribute('aria-controls'));
      if (body) body.classList.add('open');
    }
  });
});
