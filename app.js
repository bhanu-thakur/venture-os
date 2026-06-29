/* Venture OS - Application Layer (Mission = the daily founder experience)
   Repository-driven rendering. Hash routing. No backend. No framework.
   Mission is the product; reference is summoned. Compliant with the frozen Experience Architecture v1.0. */

const STATE = { idx: null };
const app = () => document.getElementById('app');
const ic = (name) => `<svg class="ic"><use href="#i-${name}"/></svg>`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const mdBlock = (s) => (window.marked && window.marked.parse) ? window.marked.parse(s) : ('<pre>' + esc(s) + '</pre>');
const mdInline = (s) => (window.marked && window.marked.parseInline) ? window.marked.parseInline(s) : esc(s);

const CATEGORY_ORDER = ['Orientation', 'Doctrine', 'Product & Strategy', 'Architecture', 'Decisions & History'];
const CATEGORY_ICON = { 'Orientation': 'compass', 'Doctrine': 'book', 'Product & Strategy': 'target', 'Architecture': 'layers', 'Decisions & History': 'flag' };
const VENTURE_STATES = ['Idea', 'Research', 'Validation', 'Prototype', 'Execution', 'Revenue', 'Scale'];

async function fetchText(path) {
  try {
    const r = await fetch(path, { cache: 'no-cache' });
    if (!r.ok) throw new Error(path + ' ' + r.status);
    return await r.text();
  } catch (e) {
    console.warn('Optional repository file unavailable:', path, e.message);
    return null;
  }
}

async function loadIndex() {
  if (STATE.idx) return STATE.idx;
  try {
    const r = await fetch('index.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('index.json ' + r.status);
    STATE.idx = await r.json();
  } catch (e) {
    console.error('Failed to load index.json', e);
    STATE.idx = { nav: [], ventures: [] };
  }
  return STATE.idx;
}

/* --- Markdown extractors (read-only, defensive) --- */
function firstTitle(md) { const m = md.match(/^#\s+(.+)$/m); return m ? m[1].trim() : null; }
function fieldLine(md, label) { const m = md.match(new RegExp('\\*\\*' + label + ':?\\*\\*\\s*([^\\n]+)')); return m ? m[1].trim().replace(/\*\*/g, '') : null; }
function frontmatterField(md, key) { const m = md.match(new RegExp('^' + key + ':\\s*(.+)$', 'm')); return m ? m[1].trim() : null; }
function sectionBlock(md, headingIncludes) {
  const lines = md.split('\n');
  const i = lines.findIndex((l) => /^#{1,3}\s/.test(l) && l.toLowerCase().includes(headingIncludes.toLowerCase()));
  if (i < 0) return '';
  const out = [];
  for (let j = i + 1; j < lines.length; j++) { if (/^#{1,3}\s/.test(lines[j])) break; out.push(lines[j]); }
  return out.join('\n').trim();
}
function firstLine(s) { return (s || '').split('\n').map((x) => x.trim()).filter(Boolean)[0] || ''; }
function amount(s) { const n = Number(String(s || '').replace(/[^0-9.]/g, '')); return isFinite(n) ? n : 0; }

/* --- Mission: the complete daily experience --- */
async function renderMission(idx) {
  const venturePath = idx.activeVenture || 'ventures/README.md';
  const missionPath = venturePath.replace(/README\.md$/, 'mission.md');
  const [readme, mission] = await Promise.all([fetchText(venturePath), fetchText(missionPath)]);
  if (!readme && !mission) {
    app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span><b>No active venture yet.</b> Set one in <code>ventures/</code>.</span></div></article>`;
    return;
  }
  const r = readme || '', m = mission || '';
  const ventureName = firstTitle(r) || 'Active venture';
  const state = fieldLine(r, 'State') || (idx.ventures && idx.ventures[0] && idx.ventures[0].state) || '';
  const win = firstLine(sectionBlock(m, "Today's Objective") || sectionBlock(m, 'Today')) || 'Set today’s objective in mission.md';
  const success = firstLine(sectionBlock(m, 'Success Today'));
  const action = firstLine(sectionBlock(m, 'Highest-Leverage Next Action') || sectionBlock(m, 'Next Action')) || 'Open today’s mission';
  const why = firstLine(sectionBlock(m, 'Bottleneck'));
  const proof = firstLine(sectionBlock(m, 'Proof of Execution'));
  const decision = firstLine(sectionBlock(m, 'Decision Needed') || sectionBlock(m, 'Decision Required'));
  const revTarget = fieldLine(r, 'Revenue Target');
  const revCurrent = frontmatterField(m, 'revenue_current');

  // "Since last time" — honest delta from local UI memory vs current repo values
  let deltaMsg = '';
  try {
    const key = 'vos:lastseen:' + venturePath;
    const prev = JSON.parse(localStorage.getItem(key) || 'null');
    const now = { state: state, rev: (revCurrent || '') };
    if (!prev) { deltaMsg = 'First session — set the loop in motion.'; }
    else {
      const parts = [];
      if (prev.state && prev.state !== now.state) parts.push('State advanced to ' + esc(now.state));
      if ((prev.rev || '') !== (now.rev || '')) parts.push('Revenue ' + esc(prev.rev || '₹0') + ' → ' + esc(now.rev || '₹0'));
      deltaMsg = parts.length ? parts.join(' · ') : 'No change since your last visit — today moves it.';
    }
    localStorage.setItem(key, JSON.stringify(now));
  } catch (e) { deltaMsg = ''; }

  const curIdx = VENTURE_STATES.findIndex((x) => x.toLowerCase() === String(state).toLowerCase());
  const path = VENTURE_STATES.map((s, i) => {
    const cur = i === curIdx;
    const cls = cur ? 'seg--good' : 'seg--flat';
    const style = (curIdx >= 0 && i > curIdx) ? 'flex:1;opacity:.45' : 'flex:1';
    return `<div class="seg ${cls}" style="${style}"><span class="sname">${esc(s)}</span></div>`;
  }).join('');

  let revBlock = '';
  if (revTarget) {
    const t = amount(revTarget), c = amount(revCurrent);
    const pct = t > 0 ? Math.max(0, Math.min(100, Math.round(c / t * 100))) : 0;
    revBlock = `<div class="mission-progress"><p class="eyebrow">${ic('cash')} Revenue</p><div class="rev-bar"><div class="rev-fill" style="width:${pct}%"></div></div><div class="rev-meta"><span>${esc(revCurrent || '₹0')}</span><span>${esc(revTarget)}</span></div></div>`;
  }

  app().innerHTML = `
    <div class="mission">
      <p class="eyebrow">${ic('target')} ${esc(ventureName)}${state ? ` · ${esc(state)}` : ''}</p>
      ${decision ? `<div class="note note--watch">${ic('warn')}<span><b>A decision is waiting.</b> ${mdInline(decision)}</span></div>` : ''}
      <h1 class="mission-win">${mdInline(win)}</h1>
      ${success ? `<p class="mission-meaning">${mdInline(success)}</p>` : ''}
      <a class="mission-action" href="#/doc/${encodeURIComponent(missionPath)}">
        <div class="ma-label">${ic('bulb')} The one thing</div>
        <div class="ma-text">${mdInline(action)}</div>
        <div class="ma-go">Begin ${ic('arrow')}</div>
      </a>
      ${deltaMsg ? `<p class="mission-delta">${ic('activity')} <span>${deltaMsg}</span></p>` : ''}
      <button id="vos-capture" class="capture-card" type="button">
        <div class="cap-label">${ic('plus')} Capture</div>
        <div class="cap-text">Bank today’s outcome in one line, then commit it to the repository.</div>
        <div class="cap-go">Copy today’s log entry ${ic('arrow')}</div>
      </button>
      <div class="mission-progress"><p class="eyebrow">${ic('activity')} The journey</p><div class="track statepath">${path}</div></div>
      ${revBlock}
      <div class="mission-stakes">
        ${why ? `<div class="note note--you">${ic('info')}<span><b>Why this matters.</b> ${mdInline(why)}</span></div>` : ''}
        ${proof ? `<div class="note note--done">${ic('check')}<span><b>Proof you’re building.</b> ${mdInline(proof)}</span></div>` : ''}
      </div>
    </div>`;

  const cap = document.getElementById('vos-capture');
  if (cap) cap.addEventListener('click', () => {
    const date = new Date().toISOString().slice(0, 10);
    const entry = '- ' + date + ': [what you did today] — proof: [link or “none yet”]';
    const go = cap.querySelector('.cap-go');
    const done = () => { if (go) go.textContent = 'Copied — paste into mission.md / execution/log.md, then commit'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(entry).then(done).catch(() => { if (go) go.textContent = entry; });
    else if (go) go.textContent = entry;
  });

  document.title = 'Mission · Venture OS';
  window.scrollTo(0, 0);
}

/* --- Knowledge Library (summoned reference) --- */
function tile(d, label, cta) {
  return `
    <a class="tile" href="#/doc/${encodeURIComponent(d.path)}" style="--dc:var(--${d.accent || 'primary'})">
      <div class="tn">${esc(label)} ${ic('arrow')}</div>
      <div class="tt">${esc(d.title)}</div>
      <div class="td">${esc(d.path)}</div>
      <div class="go">${esc(cta)} ${ic('arrow')}</div>
    </a>`;
}
async function renderKnowledge(idx) {
  const nav = idx.nav || [];
  const groups = {};
  nav.forEach((d) => { const c = d.category || 'Other'; (groups[c] = groups[c] || []).push(d); });
  const order = [...CATEGORY_ORDER.filter((c) => groups[c]), ...Object.keys(groups).filter((c) => !CATEGORY_ORDER.includes(c))];
  const sections = order.map((c) => `
    <section>
      <div class="sec-head"><p class="eyebrow">${ic(CATEGORY_ICON[c] || 'book')} ${groups[c].length} document${groups[c].length === 1 ? '' : 's'}</p><h2>${esc(c)}</h2></div>
      <article class="card"><div class="cardgrid">${groups[c].map((d) => tile(d, c.toUpperCase(), 'Read')).join('')}</div></article>
    </section>`).join('');
  app().innerHTML = `
    <header class="hero">
      <p class="eyebrow">Knowledge Layer · repository-driven</p>
      <h1>Knowledge Library</h1>
      <p class="lede">Every piece of durable knowledge in Venture OS, grouped by category and <b>rendered live from the repository</b>. Tap any document to read it.</p>
    </header>
    ${sections}`;
  document.title = 'Knowledge Library · Venture OS';
  window.scrollTo(0, 0);
}

async function renderDoc(path) {
  app().innerHTML = `<article class="card"><p class="lead">${ic('clock')} Loading ${esc(path)} &hellip;</p></article>`;
  try {
    const r = await fetch(path, { cache: 'no-cache' });
    if (!r.ok) throw new Error(path + ' ' + r.status);
    const md = await r.text();
    const html = mdBlock(md);
    app().innerHTML = `
      <div class="pagenav"><a href="#/">${ic('target')}<span class="dir">Mission</span><span class="ttl">Home</span></a><a href="#/knowledge">${ic('layers')}<span class="dir">Library</span><span class="ttl">All documents</span></a></div>
      <article class="card"><div class="doc-body">${html}</div></article>
      <div class="pagenav"><a href="#/">${ic('arrow')}<span class="dir">Back</span><span class="ttl">Mission</span></a></div>`;
    document.title = path + ' · Venture OS';
    window.scrollTo(0, 0);
  } catch (e) {
    console.error('Failed to render doc', e);
    app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span><b>Could not load ${esc(path)}.</b> ${esc(e.message)}</span></div><div class="pagenav"><a href="#/">${ic('arrow')}<span class="dir">Back</span><span class="ttl">Mission</span></a></div></article>`;
  }
}

function setActiveNav(name) {
  document.querySelectorAll('.topbar .nav a[data-nav]').forEach((a) => a.classList.toggle('active', a.getAttribute('data-nav') === name));
}

async function route() {
  const h = location.hash || '#/';
  const idx = await loadIndex();
  if (h.startsWith('#/doc/')) { await renderDoc(decodeURIComponent(h.slice('#/doc/'.length))); setActiveNav(null); }
  else if (h.startsWith('#/knowledge')) { await renderKnowledge(idx); setActiveNav('knowledge'); }
  else { await renderMission(idx); setActiveNav('mission'); }
}

window.addEventListener('hashchange', route);

function showUpdate() {
  if (document.getElementById('vos-update')) return;
  const b = document.createElement('div');
  b.id = 'vos-update';
  b.className = 'note note--you';
  b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:100;max-width:560px;margin:0 auto;cursor:pointer;box-shadow:var(--shadow)';
  b.innerHTML = '<svg class="ic"><use href="#i-info"/></svg><span><b>Update available.</b> Tap to reload.</span>';
  b.onclick = () => location.reload();
  document.body.appendChild(b);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        if (nw) nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
        });
      });
    }).catch((e) => console.error('SW registration failed', e));
  });
}

route();
