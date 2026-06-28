/* Venture OS - Application Layer (Phase 0 foundation shell)
   Repository-driven rendering. Hash routing. No backend. No framework.
   Compliant with TECHNICAL_ARCHITECTURE.md v2.0. */

const STATE = { idx: null };
const app = () => document.getElementById('app');
const ic = (name) => `<svg class="ic"><use href="#i-${name}"/></svg>`;

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

function renderHome(idx) {
  const tiles = (idx.nav || []).map((d) => `
    <a class="tile" href="#/doc/${encodeURIComponent(d.path)}" style="--dc:var(--${d.accent || 'primary'})">
      <div class="tn">${(d.type || 'DOC').toUpperCase()} ${ic('arrow')}</div>
      <div class="tt">${d.title}</div>
      <div class="td">${d.path}</div>
      <div class="go">Open ${ic('arrow')}</div>
    </a>`).join('');
  app().innerHTML = `
    <header class="hero">
      <p class="eyebrow">Repository-driven · offline-capable</p>
      <h1>Venture OS</h1>
      <p class="lede">The operating system for building and scaling ventures. This shell renders the repository directly &mdash; <b>every document below is fetched live from the source of truth.</b></p>
      <div class="stats" style="--n:3">
        <div class="stat"><div class="big">5</div><div class="lbl">Layers</div><div class="sub">Knowledge · Domain · Application · Reasoning · Execution</div></div>
        <div class="stat" style="--cat:var(--c3)"><div class="big">${(idx.nav || []).length}</div><div class="lbl">Core documents</div><div class="sub">Rendered live from the repository</div></div>
        <div class="stat" style="--cat:var(--c2)"><div class="big">&#8377;0</div><div class="lbl">Infra cost</div><div class="sub">Static PWA on GitHub Pages</div></div>
      </div>
    </header>
    <section id="docs">
      <div class="sec-head num"><span class="sec-num">OS</span><div><p class="eyebrow">The repository</p><h2>Core operating system</h2><p>Tap any document to render it live from the repository.</p></div></div>
      <article class="card"><div class="cardgrid">${tiles}</div></article>
    </section>`;
  document.title = 'Venture OS';
}

async function renderDoc(path) {
  app().innerHTML = `<article class="card"><p class="lead">${ic('clock')} Loading ${path} &hellip;</p></article>`;
  try {
    const r = await fetch(path, { cache: 'no-cache' });
    if (!r.ok) throw new Error(path + ' ' + r.status);
    const md = await r.text();
    const html = (window.marked && window.marked.parse)
      ? window.marked.parse(md)
      : '<pre>' + md.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])) + '</pre>';
    app().innerHTML = `
      <div class="pagenav"><a href="#/">${ic('home')}<span class="dir">Index</span><span class="ttl">All documents</span></a></div>
      <article class="card"><div class="doc-body">${html}</div></article>
      <div class="pagenav"><a href="#/">${ic('arrow')}<span class="dir">Back</span><span class="ttl">Index</span></a></div>`;
    document.title = path + ' · Venture OS';
    window.scrollTo(0, 0);
  } catch (e) {
    console.error('Failed to render doc', e);
    app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span><b>Could not load ${path}.</b> ${e.message}</span></div><div class="pagenav"><a href="#/">${ic('arrow')}<span class="dir">Back</span><span class="ttl">Index</span></a></div></article>`;
  }
}

async function route() {
  const h = location.hash || '#/';
  const idx = await loadIndex();
  if (h.startsWith('#/doc/')) {
    await renderDoc(decodeURIComponent(h.slice('#/doc/'.length)));
  } else {
    renderHome(idx);
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
