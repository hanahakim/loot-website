// Shared nav + scroll reveal + form validation

// Hamburger
const ham = document.getElementById('hamburger');
const mm = document.getElementById('mobileMenu');
if (ham && mm) {
  ham.addEventListener('click', () => {
    const open = mm.classList.toggle('open');
    ham.setAttribute('aria-expanded', String(open));
  });
  mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mm.classList.remove('open')));
}

// Scroll reveal
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// .ca email form validation
function wireForm(formId, noteId) {
  const form = document.getElementById(formId);
  const note = document.getElementById(noteId);
  if (!form || !note) return;
  const input = form.querySelector('input[type=email]');
  const defaultHTML = note.innerHTML;

  input && input.addEventListener('input', () => {
    if (note.classList.contains('error')) { note.className = 'form-note'; note.innerHTML = defaultHTML; }
  });

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const v = (input ? input.value : '').trim();
    if (!v) { note.className = 'form-note error'; note.textContent = 'Please enter your campus email.'; input && input.focus(); return; }
    if (!/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.ca$/i.test(v)) {
      note.className = 'form-note error'; note.textContent = 'Loot is .ca-only — use your campus email (e.g. you@mcmaster.ca).';
      input && input.focus(); return;
    }
    note.className = 'form-note success';
    note.textContent = "✓ You're on the list. We'll ping you when your campus goes live.";
    if (input) { input.value = ''; input.blur(); }
  });
}
