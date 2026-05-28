// ─── Nav scroll border ───────────────────────────────────
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

(function setupNavCta() {
  const navInner = document.querySelector('.nav-inner');
  if (!navInner) return;
  const waitlist = navInner.querySelector('.nav-links a.btn-pill, .nav-links a.btn-brand');
  const burger = navInner.querySelector('.nav-burger');
  if (!waitlist || navInner.querySelector('.nav-cta')) return;

  waitlist.classList.remove('btn-pill');
  waitlist.classList.add('btn-brand', 'nav-cta');
  if (burger) navInner.insertBefore(waitlist, burger);
  else navInner.appendChild(waitlist);
  waitlist.closest('li')?.remove();
})();

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

// ─── Waitlist API ────────────────────────────────────────
const LOOT_CONFIG = window.LOOT_CONFIG || {
  supabaseUrl: 'https://oaqynilpclowkulomjjw.supabase.co',
  supabaseAnonKey: 'sb_publishable_4Ug4FvMfkO2jCbTRxzZuZQ_elrqWWIA',
};

const TIER_LABELS = {
  founding_100: 'Founding 100',
  early_300: 'Early 300',
  launch_crew: 'Launch Crew',
  standard: 'Waitlist',
};

function tierMessage(tier) {
  const label = TIER_LABELS[tier] || TIER_LABELS.standard;
  if (tier === 'founding_100' || tier === 'early_300' || tier === 'launch_crew') {
    return `You're on the list — ${label} tier unlocked. We'll email you when Loot opens at your school.`;
  }
  return "You're on the list. We'll email you when Loot opens at your school.";
}

async function submitWaitlist(payload) {
  const { supabaseUrl, supabaseAnonKey } = LOOT_CONFIG;
  const res = await fetch(`${supabaseUrl}/functions/v1/waitlist-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.code = data.code;
    throw err;
  }
  return data;
}

function showWaitlistSuccess(form, success, error, tier) {
  form.style.display = 'none';
  if (success) {
    const textNode = [...success.childNodes].find(
      (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
    );
    if (textNode) textNode.textContent = ' ' + tierMessage(tier);
    success.classList.add('show');
  }
  error && error.classList.remove('show');
}

function showWaitlistError(error, message) {
  if (!error) return;
  const textNode = [...error.childNodes].find(
    (n) => n.nodeType === Node.TEXT_NODE && n.textContent.trim(),
  );
  if (textNode) textNode.textContent = ' ' + message;
  error.classList.add('show');
}

function setFormBusy(form, busy) {
  const btn = form.querySelector('button[type=submit]');
  if (btn) {
    btn.disabled = busy;
    btn.dataset.defaultLabel = btn.dataset.defaultLabel || btn.textContent;
    btn.textContent = busy ? 'Submitting…' : btn.dataset.defaultLabel;
  }
}

function handleForm(formId, successId, errorId) {
  const form    = document.getElementById(formId);
  const success = document.getElementById(successId);
  const error   = document.getElementById(errorId);
  if (!form) return;
  const input = form.querySelector('input[type=email]');
  input && input.addEventListener('input', () => error && error.classList.remove('show'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = input ? input.value.trim().toLowerCase() : '';
    error && error.classList.remove('show');
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const isCa  = /\.ca$/.test(val);
    if (!valid || !isCa) {
      error && error.classList.add('show');
      return;
    }

    setFormBusy(form, true);
    try {
      const data = await submitWaitlist({
        university_email: val,
        personal_email: val,
        source: window.location.pathname.split('/').pop() || 'index.html',
      });
      showWaitlistSuccess(form, success, error, data.tier);
    } catch (err) {
      showWaitlistError(
        error,
        err.code === 'validation'
          ? 'Please use your university .ca email'
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setFormBusy(form, false);
    }
  });
}

function handleWaitlistForm(formId, successId, errorId) {
  const form    = document.getElementById(formId);
  const success = document.getElementById(successId);
  const error   = document.getElementById(errorId);
  if (!form) return;

  form.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', () => error && error.classList.remove('show'));
    el.addEventListener('change', () => error && error.classList.remove('show'));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error && error.classList.remove('show');

    const uniEmail = form.querySelector('[name="university_email"]');
    const personalEmail = form.querySelector('[name="personal_email"]');
    const uniVal = uniEmail ? uniEmail.value.trim().toLowerCase() : '';
    const personalVal = personalEmail ? personalEmail.value.trim().toLowerCase() : '';
    const emailOk = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    const requiredOk = [...form.querySelectorAll('[required]')].every(el => el.value.trim());
    const universitySelect = form.querySelector('[name="university"]');
    const universityOther = form.querySelector('[name="university_other"]');
    const universityOk = universitySelect && universitySelect.value.trim()
      && (universitySelect.value !== 'Other' || (universityOther && universityOther.value.trim()));

    if (!requiredOk || !universityOk || !emailOk(uniVal) || !/\.ca$/.test(uniVal) || !emailOk(personalVal)) {
      error && error.classList.add('show');
      return;
    }

    const payload = {
      first_name: form.querySelector('[name="first_name"]')?.value.trim(),
      last_name: form.querySelector('[name="last_name"]')?.value.trim(),
      university_email: uniVal,
      personal_email: personalVal,
      university: universitySelect.value.trim(),
      university_other: universityOther?.value.trim() || null,
      pronouns: form.querySelector('[name="pronouns"]')?.value.trim() || null,
      referral: form.querySelector('[name="referral"]')?.value.trim(),
      source: 'index.html#waitlist',
    };

    setFormBusy(form, true);
    try {
      const data = await submitWaitlist(payload);
      showWaitlistSuccess(form, success, error, data.tier);
    } catch (err) {
      showWaitlistError(
        error,
        err.code === 'validation'
          ? 'Check your details — university email must end in .ca'
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setFormBusy(form, false);
    }
  });
}

handleWaitlistForm('waitlistForm', 'waitlistSuccess', 'waitlistError');
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
