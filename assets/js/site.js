/* =========================================================
   Chip Koele — portfolio site script
   1. Mobile menu   2. Project cards from data/projects.json
   To add a project: edit data/projects.json only.
   ========================================================= */

// 1. Mobile menu: open/close the nav on small screens
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
}

// Footer year
document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

// 2. Project cards
// Any element with data-projects gets filled with cards.
// data-limit="2" shows only the first 2 (used on Home).
const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
));

const statusClass = status => 'status-' + String(status).toLowerCase().split(' ')[0];

function cardHtml(p) {
  const tags = (p.stack || []).map(t => `<li>${escapeHtml(t)}</li>`).join('');
  const demo = p.demoUrl
    ? `<a class="btn btn-primary" href="${escapeHtml(p.demoUrl)}">${escapeHtml(p.demoLabel || 'View demo')} →</a>` : '';
  const code = p.codeUrl
    ? `<a class="btn btn-secondary" href="${escapeHtml(p.codeUrl)}">View code</a>` : '';
  const img = p.image
    ? `<div class="thumb"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.imageAlt || p.title)}" width="800" height="500" loading="lazy"></div>` : '';
  return `
    <article class="card project-card">
      ${img}
      <div class="body">
        <div class="project-top">
          <h3>${escapeHtml(p.title)}</h3>
          <span class="status ${statusClass(p.status)}">${escapeHtml(p.status)}</span>
        </div>
        <p class="problem"><span class="label">Problem</span>${escapeHtml(p.problem)}</p>
        <p class="built"><span class="label">What I built</span>${escapeHtml(p.built)}</p>
        <ul class="tags" aria-label="Stack">${tags}</ul>
        <div class="project-links">${demo}${code}</div>
      </div>
    </article>`;
}

const targets = document.querySelectorAll('[data-projects]');
if (targets.length) {
  fetch('data/projects.json')
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(projects => {
      targets.forEach(el => {
        const limit = parseInt(el.dataset.limit, 10) || projects.length;
        el.innerHTML = projects.slice(0, limit).map(cardHtml).join('');
      });
    })
    .catch(err => {
      console.error('Could not load projects.json:', err);
      targets.forEach(el => {
        el.innerHTML = '<p class="muted">Projects could not be loaded. See them on <a href="https://github.com/chipkoele/portfolio">GitHub</a>.</p>';
      });
    });
}
