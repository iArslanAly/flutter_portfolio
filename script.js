/* ── SCROLL PROGRESS ── */
const prog = document.getElementById('prog');
const nav = document.querySelector('nav');
function updateScrollUI() {
  const scrollable = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  prog.style.width = (window.scrollY / scrollable * 100) + '%';
  nav.classList.toggle('scrolled', window.scrollY > 24);
}
window.addEventListener('scroll', updateScrollUI, { passive: true });
updateScrollUI();

/* ── FLOATING HIRE BTN ── */
const fh = document.getElementById('fhire');
window.addEventListener('scroll', () => fh.classList.toggle('show', window.scrollY > 420), { passive: true });

/* ── MOBILE MENU ── */
document.getElementById('ham').addEventListener('click', () => document.getElementById('mob').classList.add('open'));
document.getElementById('mobX').addEventListener('click', () => document.getElementById('mob').classList.remove('open'));
function cM() { document.getElementById('mob').classList.remove('open'); }
document.querySelectorAll('#mob a').forEach(link => link.addEventListener('click', cM));

/* ── TYPEWRITER ── */
const roles  = ['Flutter Developer', 'Mobile App Builder', 'UI/UX Designer', 'Cross-Platform Expert'];
let ri = 0, ci = 0, deleting = false;
const twEl   = document.getElementById('tw-text');
function tick() {
  const word = roles[ri];
  if (!deleting) {
    twEl.textContent = word.slice(0, ++ci);
    if (ci === word.length) { deleting = true; setTimeout(tick, 2000); return; }
    setTimeout(tick, 85);
  } else {
    twEl.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, 350); return; }
    setTimeout(tick, 42);
  }
}
tick();

/* ── ANIMATED COUNTERS ── */
function countUp(el, target) {
  const dur = 1800, step = target / (dur / 16);
  let v = 0;
  const t = setInterval(() => {
    v = Math.min(v + step, target);
    el.textContent = Math.floor(v) + '+';
    if (v >= target) clearInterval(t);
  }, 16);
}
const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    countUp(e.target, parseInt(e.target.dataset.count));
    cObs.unobserve(e.target);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => cObs.observe(el));

/* ── SCROLL REVEAL — no JS stagger, clean class add ── */
const rObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); rObs.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '-16px 0px -16px 0px' });
document.querySelectorAll('.reveal').forEach(el => rObs.observe(el));

/* ── 3D CARD TILT — smooth, transform only ── */
document.querySelectorAll('.tilt').forEach(card => {
  let raf;
  card.addEventListener('mousemove', e => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r  = card.getBoundingClientRect();
      const x  = (e.clientX - r.left) / r.width  - 0.5;
      const y  = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'none';
      card.style.transform  = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg) translateY(-6px) scale(1.01)`;
    });
  });
  card.addEventListener('mouseleave', () => {
    cancelAnimationFrame(raf);
    card.style.transition = 'transform 0.55s cubic-bezier(0.16,1,0.3,1), border-color .3s, box-shadow .3s';
    card.style.transform  = 'perspective(900px) rotateX(0) rotateY(0) translateY(0) scale(1)';
  });
});

/* ── ACTIVE NAV ── */
const sects = document.querySelectorAll('section[id]');
const nLinks = document.querySelectorAll('.nav-links a');
function updateActiveNav() {
  let cur = '';
  sects.forEach(s => { if (window.scrollY >= s.offsetTop - 110) cur = s.id; });
  nLinks.forEach(a => {
    const on = a.getAttribute('href') === '#' + cur;
    a.classList.toggle('active', on);
  });
}
window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

/* ── CONTACT FORM ── */
function submitForm() {
  const n = document.getElementById('fn').value.trim();
  const e = document.getElementById('fe').value.trim();
  const m = document.getElementById('fm').value.trim();
  const msg = document.getElementById('fmsg');
  if (!n || !e || !m) { msg.textContent = 'Please fill in name, email & message.'; msg.className = 'err'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { msg.textContent = 'Please enter a valid email address.'; msg.className = 'err'; return; }
  msg.textContent = '✓ Sent! I\'ll get back to you shortly.'; msg.className = 'ok';
  ['fn','fe','fp','fs','fm'].forEach(id => document.getElementById(id).value = '');
}
document.getElementById('submitBtn').addEventListener('click', submitForm);
