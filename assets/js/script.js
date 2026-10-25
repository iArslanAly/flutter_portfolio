/* ── SCROLL PROGRESS ── */
const prog = document.getElementById('prog');
const nav = document.querySelector('nav');

/* ── FAST SECTION NAVIGATION ── */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function scrollToSection(target, updateHistory = true) {
  const navOffset = nav.offsetHeight + 12;
  const start = window.scrollY;
  const destination = Math.max(target.getBoundingClientRect().top + start - navOffset, 0);
  const distance = destination - start;

  if (prefersReducedMotion.matches || Math.abs(distance) < 80) {
    window.scrollTo(0, destination);
  } else {
    const duration = Math.min(560, Math.max(280, Math.abs(distance) * 0.18));
    const startedAt = performance.now();

    function animateScroll(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      window.scrollTo(0, start + distance * eased);
      if (progress < 1) requestAnimationFrame(animateScroll);
    }

    requestAnimationFrame(animateScroll);
  }

  if (updateHistory) history.pushState(null, '', `#${target.id}`);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.getAttribute('href').slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    event.preventDefault();
    if (mobileMenu?.classList.contains('open')) setMenu(false);
    scrollToSection(target);
  });
});

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
const menuButton = document.getElementById('ham');
const mobileMenu = document.getElementById('mob');
const closeMenuButton = document.getElementById('mobX');

function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  mobileMenu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) closeMenuButton.focus();
  else menuButton.focus({ preventScroll: true });
}

menuButton.addEventListener('click', () => setMenu(true));
closeMenuButton.addEventListener('click', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (!mobileMenu.classList.contains('open')) return;
  if (event.key === 'Escape') setMenu(false);
  if (event.key === 'Tab') {
    const items = mobileMenu.querySelectorAll('button, a[href]');
    const first = items[0], last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});
function cM() { setMenu(false); }
document.querySelectorAll('#mob a').forEach(link => link.addEventListener('click', cM));

/* ── TYPEWRITER ── */
const roles  = ['Flutter Developer', 'Mobile App Builder', 'UI/UX Designer', 'Cross-Platform Expert'];
let ri = 0, ci = 0, deleting = false;
const twEl   = document.getElementById('tw-text');
function tick() {
  if (prefersReducedMotion.matches) { twEl.textContent = roles[0]; return; }
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
if (!prefersReducedMotion.matches) tick();

/* ── ANIMATED COUNTERS ── */
// HTML contains the final values: animation is only a progressive enhancement.
const counters = document.querySelectorAll('[data-count]');
const activeCounters = new Map();
function finishCounter(el) {
  const animation = activeCounters.get(el);
  if (animation) {
    cancelAnimationFrame(animation.frame);
    clearTimeout(animation.timeout);
    activeCounters.delete(el);
  }
  el.textContent = el.dataset.count + '+';
}
function countUp(el) {
  const target = Number(el.dataset.count);
  if (!Number.isFinite(target) || target < 0) return;
  if (prefersReducedMotion.matches || document.hidden) { finishCounter(el); return; }
  const startedAt = performance.now();
  const animation = { frame: 0, timeout: setTimeout(() => finishCounter(el), 2000) };
  activeCounters.set(el, animation);
  // Keep the accessible value stable while the visible digits animate.
  el.setAttribute('aria-label', target + '+');
  function frame(now) {
    const progress = Math.min((now - startedAt) / 1800, 1);
    if (progress >= 1 || prefersReducedMotion.matches || document.hidden) {
      finishCounter(el);
      return;
    }
    el.textContent = Math.floor(target * progress) + '+';
    animation.frame = requestAnimationFrame(frame);
  }
  animation.frame = requestAnimationFrame(frame);
}
if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      cObs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => cObs.observe(el));
}
function settleCounters() { counters.forEach(finishCounter); }
document.addEventListener('visibilitychange', () => { if (document.hidden) settleCounters(); });
window.addEventListener('pagehide', settleCounters);
prefersReducedMotion.addEventListener('change', () => {
  if (prefersReducedMotion.matches) settleCounters();
});

/* ── SCROLL REVEAL — content stays visible without JavaScript or observers ── */
if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
  const rObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        rObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '-16px 0px -16px 0px' });
  document.querySelectorAll('.reveal').forEach(el => {
    rObs.observe(el);
    el.classList.add('reveal-pending');
  });
}

/* ── PREMIUM CARD SPOTLIGHT — CSS variables only, fine pointers ── */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.proj, .proc-card').forEach(card => {
    let raf;
    card.addEventListener('pointermove', e => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  });
}

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
const emailJsConfig = {
  serviceId: 'service_jnciz4n',
  templateId: 'template_wopl08o',
  publicKey: 'oniDNUwiE3_GWxJ8m',
  endpoint: 'https://api.emailjs.com/api/v1.0/email/send'
};

async function submitForm(event) {
  event.preventDefault();
  const n = document.getElementById('fn').value.trim();
  const e = document.getElementById('fe').value.trim();
  const p = document.getElementById('fp').value.trim();
  const s = document.getElementById('fs').value.trim();
  const m = document.getElementById('fm').value.trim();
  const msg = document.getElementById('fmsg');
  const btn = document.getElementById('submitBtn');
  if (!n || !e || !s || !m) { msg.textContent = 'Please fill in name, email, subject & message.'; msg.className = 'err'; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { msg.textContent = 'Please enter a valid email address.'; msg.className = 'err'; return; }

  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = 'Sending...';
  msg.textContent = 'Sending your message...';
  msg.className = '';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(emailJsConfig.endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: emailJsConfig.serviceId,
        template_id: emailJsConfig.templateId,
        user_id: emailJsConfig.publicKey,
        template_params: {
          name: n,
          email: e,
          phone: p,
          subject: s,
          message: m,
          time: new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    msg.textContent = 'Message sent successfully. I will get back to you shortly.';
    msg.className = 'ok';
    ['fn','fe','fp','fs','fm'].forEach(id => document.getElementById(id).value = '');
  } catch (error) {
    msg.textContent = 'Message could not be sent. Please email contact@iarslanaly.dev directly.';
    msg.className = 'err';
  } finally {
    clearTimeout(timeout);
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = 'Send message';
  }
}
document.getElementById('contactForm').addEventListener('submit', submitForm);
document.getElementById('submitBtn').disabled = false;

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
