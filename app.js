/* Venture OS - Application Layer (Phase 1 dashboard)
   Repository-driven rendering. Hash routing. No backend. No framework.
   Compliant with TECHNICAL_ARCHITECTURE.md v2.0. */

const STATE = { idx: null };
const app = () => document.getElementById('app');
const ic = (name) => `<svg class="ic"><use href="#i-${name}"/></svg>`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const mdBlock = (s) => (window.marked && window.marked.parse) ? window.marked.parse(s) : ('<pre>' + esc(s) + '</pre>');
const mdInline = (s) => (window.marked && window.marked.parseInline) ? window.marked.parseInline(s) : esc(s);

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

/* --- lightweight Markdown field extractors (read-only, defensive) --- */
function firstTitle(md) { const m = md.match(/^#\s+(.+)$/m); return m ? m[1].trim() : null; }
function fieldLine(md, label) { const m = md.match(new RegExp('\\*\\*' + label + ':?\\*\\*\\s*([^\\n]+)')); return m ? m[1].trim().replace(/\*\*/g, '') : null; }
function sectionBlock(md, headingIncludes) {
  const lines = md.split('\n');
  const i = lines.findIndex((l) => /^#{1,3}\s/.test(l) && l.toLowerCase().includes(headingIncludes.toLowerCase()));
  if (i < 0) return '';
  const out = [];
  for (let j = i + 1; j < lines.length; j++) { if (/^#{1,3}\s/.test(lines[j])) break; out.push(lines[j]); }
  return out.join('\n').trim();
}
function firstHeadingBlock(md, marker) {
  const lines = md.split('\n');
  const start = lines.findIndex((l) => l.startsWith(marker));
  if (start < 0) return null;
  const out = [lines[start]];
  for (let j = start + 1; j < lines.length; j++) { if (lines[j].startsWith(marker)) break; out.push(lines[j]); }
  return out.join('\n').trim();
}
function firstTask(md) {
  const sec = sectionBlock(md, 'Immediate Tasks') || md;
  const m = sec.match(/^\s*(?:\d+\.|[-*])\s*(?:\[[ xX]\]\s*)?(.+)$/m);
  return m ? m[1].trim() : null;
}

function docTiles(idx) {
  return (idx.nav || []).map((d) => `
    <a class="tile" href="#/doc/${encodeURIComponent(d.path)}" style="--dc:var(--${d.accent || 'primary'})">
      <div class="tn">${esc((d.type || 'DOC').toUpperCase())} ${ic('arrow')}</div>
      <div class="tt">${esc(d.title)}</div>
      <div class="td">${esc(d.path)}</div>
      <div class="go">Open ${ic('arrow')}</div>
    </a>`).join('');
}

async function renderDashboard(idx) {
  const [nextMd, ventureMd, contextMd, changelogMd] = await Promise.all(
    ['NEXT.md', 'CURRENT_VENTURE.md', 'CURRENT_CONTEXT.md', 'CHANGELOG.md'].map(fetchText)
  );

  const task = nextMd ? firstTask(nextMd) : null;
  const focusPanel = task ? `
    <section id="focus">
      <div class="sec-head"><p class="eyebrow">Right now</p><h2>Current focus</h2></div>
      <div class="note note--you">${ic('bulb')}<span><b>Next action.</b> ${mdInline(task)}</span></div>
    </section>` : '';

  let venturePanel = '';
  if (ventureMd) {
    const title = firstTitle(ventureMd) || 'Active venture';
    const status = fieldLine(ventureMd, 'Status');
    const objSec = sectionBlock(ventureMd, 'Objective');
    const objLine = objSec ? objSec.split('\n').map((l) => l.trim()).filter(Boolean)[0] : '';
    venturePanel = `
      <article class="card cat" style="--bc:var(--c4)">
        <div class="card-top"><div class="card-title"><span class="ico">${ic('building')}</span><div><h3>${esc(title)}</h3><div class="val">CURRENT_VENTURE.md</div></div></div>${status ? `<span class="pill pill--brand">${esc(status)}</span>` : ''}</div>
        ${objLine ? `<p class="lead">${mdInline(objLine)}</p>` : ''}
      </article>`;
  }

  let realityPanel = '';
  if (contextMd) {
    const block = sectionBlock(contextMd, 'Reality Grounding');
    if (block) realityPanel = `
      <article class="card">
        <div class="card-title"><span class="ico">${ic('compass')}</span><div><h3>Reality</h3><div class="val">CURRENT_CONTEXT.md</div></div></div>
        <div class="doc-body">${mdBlock(block)}</div>
      </article>`;
  }

  const statusSection = (venturePanel || realityPanel) ? `
    <section id="status">
      <div class="sec-head num"><span class="sec-num">ST</span><div><p class="eyebrow">Live state</p><h2>Active venture &amp; reality</h2></div></div>
      <div class="grid g2">${venturePanel}${realityPanel}</div>
    </section>` : '';

  let activityPanel = '';
  if (changelogMd) {
    const blk = firstHeadingBlock(changelogMd, '## ');
    if (blk) activityPanel = `
      <section id="activity">
        <div class="sec-head"><p class="eyebrow">History</p><h2>Recent activity</h2></div>
        <article class="card"><div class="card-title"><span class="ico">${ic('activity')}</span><div><h3>Latest changelog entry</h3><div class="val">CHANGELOG.md</div></div></div><div class="doc-body">${mdBlock(blk)}</div></article>
      </section>`;
  }

  app().innerHTML = `
    <header class="hero">
      <p class="eyebrow">Live dashboard · repository-driven</p>
      <h1>Venture OS</h1>
      <p class="lede">The operating system for building and scaling ventures. <b>Everything on this dashboard is read live from the repository</b> &mdash; the source of truth.</p>
      <div class="stats" style="--n:3">
        <div class="stat"><div class="big">5</div><div class="lbl">Layers</div><div class="sub">Knowledge · Domain · Application · Reasoning · Execution</div></div>
        <div class="stat" style="--cat:var(--c3)"><div class="big">${(idx.nav || []).length}</div><div class="lbl">Core documents</div><div class="sub">Rendered live from the repository</div></div>
        <div class="stat" style="--cat:var(--c2)"><div class="big">&#8377;0</div><div class="lbl">Infra cost</div><div class="sub">Static PWA on GitHub Pages</div></div>
      </div>
    </header>
    ${focusPanel}
    ${statusSection}
    ${activityPanel}
    <section id="docs">
      <div class="sec-head num"><span class="sec-num">OS</span><div><p class="eyebrow">The repository</p><h2>Core operating system</h2><p>Tap any document to render it live from the repository.</p></div></div>
      <article class="card"><div class="cardgrid">${docTiles(idx)}</div></article>
    </section>`;
  document.title = 'Venture OS · Dashboard';
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
      <div class="pagenav"><a href="#/">${ic('home')}<span class="dir">Dashboard</span><span class="ttl">All documents</span></a></div>
      <article class="card"><div class="doc-body">${html}</div></article>
      <div class="pagenav"><a href="#/">${ic('arrow')}<span class="dir">Back</span><span class="ttl">Dashboard</span></a></div>`;
    document.title = path + ' · Venture OS';
    window.scrollTo(0, 0);
  } catch (e) {
    console.error('Failed to render doc', e);
    app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span><b>Could not load ${esc(path)}.</b> ${esc(e.message)}</span></div><div class="pagenav"><a href="#/">${ic('arrow')}<span class="dir">Back</span><span class="ttl">Dashboard</span></a></div></article>`;
  }
}

async function route() {
  const h = location.hash || '#/';
  const idx = await loadIndex();
  if (h.startsWith('#/doc/')) {
    await renderDoc(decodeURIComponent(h.slice('#/doc/'.length)));
  } else {
    await renderDashboard(idx);
  }
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
