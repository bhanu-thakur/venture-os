/* Venture OS - Application Layer (the cockpit you operate).
   Repository = canonical record for durable truth. A local working layer (browser)
   holds the founder's daily working state (plan checks, captured wins, streak). ADR-0018. */

const STATE = { idx: null };
const app = () => document.getElementById('app');
const ic = (name) => `<svg class="ic"><use href="#i-${name}"/></svg>`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const mdBlock = (s) => (window.marked && window.marked.parse) ? window.marked.parse(s) : ('<pre>' + esc(s) + '</pre>');
const mdInline = (s) => (window.marked && window.marked.parseInline) ? window.marked.parseInline(s) : esc(s);

const CATEGORY_ORDER = ['Playbook', 'Operating System'];
const CATEGORY_ICON = { 'Playbook': 'target', 'Operating System': 'compass' };
const VENTURE_STATES = ['Idea', 'Research', 'Validation', 'Prototype', 'Execution', 'Revenue', 'Scale'];

/* --- local working layer (browser) --- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const todayKey = () => new Date().toISOString().slice(0, 10);
function registerWin() {
  const t = todayKey(), s = LS.get('vos:streak', { count: 0, last: '' });
  if (s.last === t) return s;
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  s.count = (s.last === y) ? s.count + 1 : 1; s.last = t; LS.set('vos:streak', s); return s;
}

async function fetchText(p) { try { const r = await fetch(p, { cache: 'no-cache' }); if (!r.ok) throw 0; return await r.text(); } catch (e) { return null; } }
async function loadIndex() {
  if (STATE.idx) return STATE.idx;
  try { const r = await fetch('index.json', { cache: 'no-cache' }); STATE.idx = await r.json(); } catch (e) { STATE.idx = { nav: [], ventures: [] }; }
  return STATE.idx;
}
function firstTitle(md) { const m = md.match(/^#\s+(.+)$/m); return m ? m[1].trim() : null; }
function fieldLine(md, label) { const m = md.match(new RegExp('\\*\\*' + label + ':?\\*\\*\\s*([^\\n]+)')); return m ? m[1].trim().replace(/\*\*/g, '') : null; }
function frontmatterField(md, key) { const m = md.match(new RegExp('^' + key + ':\\s*(.+)$', 'm')); return m ? m[1].trim() : null; }
function sectionBlock(md, h) { const L = md.split('\n'); const i = L.findIndex((l) => /^#{1,3}\s/.test(l) && l.toLowerCase().includes(h.toLowerCase())); if (i < 0) return ''; const o = []; for (let j = i + 1; j < L.length; j++) { if (/^#{1,3}\s/.test(L[j])) break; o.push(L[j]); } return o.join('\n').trim(); }
function firstLine(s) { return (s || '').split('\n').map((x) => x.trim()).filter(Boolean)[0] || ''; }
function amount(s) { const n = Number(String(s || '').replace(/[^0-9.]/g, '')); return isFinite(n) ? n : 0; }
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

async function renderMission(idx) {
  const venturePath = idx.activeVenture || 'ventures/README.md';
  const missionPath = venturePath.replace(/README\.md$/, 'mission.md');
  const [readme, mission] = await Promise.all([fetchText(venturePath), fetchText(missionPath)]);
  const r = readme || '', m = mission || '';
  const ventureName = firstTitle(r) || 'Your venture';
  const state = fieldLine(r, 'State') || (idx.ventures && idx.ventures[0] && idx.ventures[0].state) || '';
  const win = firstLine(sectionBlock(m, "Today's Objective") || sectionBlock(m, 'Today')) || 'Set today’s objective';
  const success = firstLine(sectionBlock(m, 'Success Today'));
  const action = firstLine(sectionBlock(m, 'Highest-Leverage Next Action') || sectionBlock(m, 'Next Action')) || win;
  const why = firstLine(sectionBlock(m, 'Bottleneck'));
  const proof = firstLine(sectionBlock(m, 'Proof of Execution'));
  const decision = firstLine(sectionBlock(m, 'Decision Needed') || sectionBlock(m, 'Decision Required'));
  const revTarget = fieldLine(r, 'Revenue Target');
  const revCurrent = frontmatterField(m, 'revenue_current');

  // working-layer state
  const t = todayKey();
  const captures = LS.get('vos:captures', []);
  const pipeCount = LS.get('vos:pipeline', []).length;
  const leadsInPlay = LS.get('vos:pipeline', []).filter((l) => l.stage !== 'Won').length;
  const wonToday = captures.some((c) => c.date === t);
  const allChecks = LS.get('vos:checks', {});
  const checks = Object.assign({ act: false, reach: false }, allChecks[t] || {});
  const streak = LS.get('vos:streak', { count: 0, last: '' });
  const steps = [
    { id: 'act', label: 'Do the one thing', on: !!checks.act },
    { id: 'reach', label: 'Move one lead forward', on: !!checks.reach },
    { id: 'log', label: 'Capture today’s win', on: wonToday, locked: true }
  ];
  const done = steps.filter((s) => s.on).length;
  const pct = Math.round(done / steps.length * 100);

  const curIdx = VENTURE_STATES.findIndex((x) => x.toLowerCase() === String(state).toLowerCase());
  const path = VENTURE_STATES.map((s, i) => `<div class="seg ${i === curIdx ? 'seg--good' : 'seg--flat'}" style="flex:1${(curIdx >= 0 && i > curIdx) ? ';opacity:.45' : ''}"><span class="sname">${esc(s)}</span></div>`).join('');
  let revBlock = '';
  if (revTarget) { const tv = amount(revTarget), c = amount(revCurrent); const rp = tv > 0 ? Math.max(0, Math.min(100, Math.round(c / tv * 100))) : 0; revBlock = `<div class="mission-progress"><p class="eyebrow">${ic('cash')} Revenue</p><div class="rev-bar"><div class="rev-fill" style="width:${rp}%"></div></div><div class="rev-meta"><span>${esc(revCurrent || '₹0')}</span><span>${esc(revTarget)}</span></div></div>`; }
  const detail = [why ? `<p><b>Why it matters.</b> ${mdInline(why)}</p>` : '', proof ? `<p><b>The proof you’re after.</b> ${mdInline(proof)}</p>` : ''].join('');
  const recent = captures.slice(-3).reverse().map((c) => `<li><span class="d">${esc(c.date)}</span>${esc(c.text)}</li>`).join('');
  const waQ = encodeURIComponent(firstLine(sectionBlock(m, 'Outreach')) || 'Hi, I make short reels for hotels & cafés here in the hills — could I make one for your place?');
  const research = 'https://www.pinterest.com/search/pins/?q=' + encodeURIComponent('boutique hotel reel hospitality');

  app().innerHTML = `
    <div class="mission">
      <p class="mission-greeting">${greeting()}, Bhanu.</p>
      <p class="eyebrow">${ic('target')} ${esc(ventureName)}${state ? ` · ${esc(state)}` : ''}</p>
      <div class="stats standing" style="--n:3">
        <div class="stat"><div class="big">${streak.count}</div><div class="lbl">Day streak</div><div class="sub">Real progress, daily</div></div>
        <div class="stat" style="--cat:var(--c3)"><div class="big">${leadsInPlay}</div><div class="lbl">Leads in play</div><div class="sub">In your pipeline</div></div>
        <div class="stat" style="--cat:var(--c2)"><div class="big">${esc(revCurrent || '₹0')}</div><div class="lbl">of ${esc(revTarget || '—')}</div><div class="sub">Toward your milestone</div></div>
      </div>
      ${decision ? `<div class="note note--watch">${ic('warn')}<span><b>A decision is waiting.</b> ${mdInline(decision)}</span></div>` : ''}
      <h1 class="mission-win">${mdInline(win)}</h1>
      ${success ? `<p class="mission-meaning">${mdInline(success)}</p>` : ''}
      <div class="mission-action">
        <div class="ma-label">${ic('bulb')} The one thing</div>
        <div class="ma-text">${mdInline(action)}</div>
        ${detail ? `<button class="ma-toggle" type="button" aria-expanded="false">Why this matters ${ic('chevron')}</button><div class="ma-detail">${detail}</div>` : ''}
      </div>

      <section class="plan">
        <p class="eyebrow">${ic('check')} Today’s plan · ${done}/${steps.length}</p>
        <div class="plan-bar"><i style="width:${pct}%"></i></div>
        ${steps.map((s) => `<div class="check-item ${s.on ? 'on' : ''}" ${s.locked ? '' : `data-step="${s.id}"`}><span class="box">${ic('check')}</span> ${esc(s.label)}</div>`).join('')}
      </section>

      <section class="capture-box">
        <p class="eyebrow">${ic('plus')} Capture a win</p>
        <div class="capture-row"><input id="vos-cap-input" placeholder="What moved forward today?" autocomplete="off"><button id="vos-cap-save" type="button">Save</button></div>
        ${recent ? `<ul class="recent">${recent}</ul>` : ''}
      </section>

      <div class="launchpads">
        <a class="launch" href="#/pipeline">${ic('cash')} Pipeline${pipeCount ? ` · ${pipeCount}` : ''}</a>
        <a class="launch" href="https://web.whatsapp.com/" target="_blank" rel="noopener">${ic('arrow')} Message on WhatsApp</a>
        <a class="launch" href="${research}" target="_blank" rel="noopener">${ic('compass')} Research references</a>
      </div>

      <div class="mission-progress"><p class="eyebrow">${ic('activity')} The journey</p><div class="track statepath">${path}</div></div>
    </div>`;

  const tog = document.querySelector('.ma-toggle');
  if (tog) tog.addEventListener('click', () => { const o = tog.getAttribute('aria-expanded') === 'true'; tog.setAttribute('aria-expanded', String(!o)); tog.innerHTML = (o ? 'Why this matters ' : 'Hide ') + ic('chevron'); });

  document.querySelectorAll('.check-item[data-step]').forEach((el) => el.addEventListener('click', () => {
    const id = el.getAttribute('data-step'); const c = LS.get('vos:checks', {}); c[t] = Object.assign({}, c[t]); c[t][id] = !c[t][id]; LS.set('vos:checks', c); renderMission(STATE.idx);
  }));

  const save = document.getElementById('vos-cap-save'), inp = document.getElementById('vos-cap-input');
  const doSave = () => { const v = (inp.value || '').trim(); if (!v) { inp.focus(); return; } const list = LS.get('vos:captures', []); list.push({ date: t, text: v }); LS.set('vos:captures', list); registerWin(); renderMission(STATE.idx); };
  if (save) save.addEventListener('click', doSave);
  if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSave(); });

  document.title = 'Venture OS';
  window.scrollTo(0, 0);
}

const PIPE_STAGES = ['To reach', 'In talks', 'Won'];
function renderPipeline() {
  const leads = LS.get('vos:pipeline', []);
  const counts = PIPE_STAGES.map((st) => leads.filter((l) => l.stage === st).length);
  const tone = ['c3', 'c2', 'primary'];
  const stats = PIPE_STAGES.map((st, i) => `<div class="stat" style="--cat:var(--${tone[i]})"><div class="big">${counts[i]}</div><div class="lbl">${esc(st)}</div></div>`).join('');
  const sections = PIPE_STAGES.map((st, si) => {
    const rows = leads.filter((l) => l.stage === st).map((l) => `
      <div class="lead">
        <div class="lead-main"><div class="lead-name">${esc(l.name)}</div>${l.type ? `<div class="lead-type">${esc(l.type)}</div>` : ''}${l.next ? `<div class="lead-next">${ic('arrow')} ${esc(l.next)}</div>` : ''}</div>
        <div class="lead-act">${si < PIPE_STAGES.length - 1 ? `<button class="btn-sm adv" data-id="${l.id}">Advance ${ic('arrow')}</button>` : `<span class="pill pill--good">won</span>`}<button class="btn-sm del" data-id="${l.id}">Remove</button></div>
      </div>`).join('');
    return `<section><div class="sec-head"><p class="eyebrow">${counts[si]} · ${esc(st)}</p></div><article class="card">${rows || `<p class="lead-empty">Nothing here yet.</p>`}</article></section>`;
  }).join('');
  app().innerHTML = `
    <header class="hero"><p class="eyebrow">${ic('cash')} Pipeline</p><h1>Who you\u2019re chasing</h1><p class="lede">Your leads, from first contact to paid. Move one forward every day.</p></header>
    <div class="stats" style="--n:3">${stats}</div>
    <article class="card">
      <div class="card-title"><span class="ico">${ic('plus')}</span><div><h3>Add a lead</h3></div></div>
      <div class="lead-form">
        <input id="pl-name" placeholder="Hotel / caf\u00e9 name (or codename)" autocomplete="off">
        <input id="pl-type" placeholder="Type \u2014 e.g. boutique hotel" autocomplete="off">
        <input id="pl-next" placeholder="Next action \u2014 e.g. send the free-reel offer" autocomplete="off">
        <button id="pl-add" type="button">Add to pipeline</button>
      </div>
    </article>
    ${sections}`;
  const add = document.getElementById('pl-add');
  if (add) add.addEventListener('click', () => {
    const name = (document.getElementById('pl-name').value || '').trim(); if (!name) { document.getElementById('pl-name').focus(); return; }
    const list = LS.get('vos:pipeline', []);
    list.push({ id: Date.now(), name, type: (document.getElementById('pl-type').value || '').trim(), next: (document.getElementById('pl-next').value || '').trim(), stage: 'To reach' });
    LS.set('vos:pipeline', list); renderPipeline();
  });
  document.querySelectorAll('.adv').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.getAttribute('data-id')); const list = LS.get('vos:pipeline', []); const l = list.find((x) => x.id === id);
    if (l) { const i = PIPE_STAGES.indexOf(l.stage); l.stage = PIPE_STAGES[Math.min(i + 1, PIPE_STAGES.length - 1)]; LS.set('vos:pipeline', list); renderPipeline(); }
  }));
  document.querySelectorAll('.del').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.getAttribute('data-id')); LS.set('vos:pipeline', LS.get('vos:pipeline', []).filter((x) => x.id !== id)); renderPipeline();
  }));
  document.title = 'Pipeline \u00b7 Venture OS'; window.scrollTo(0, 0);
}

/* --- Library: the founder's playbook --- */
function tile(d) {
  return `<a class="tile" href="#/doc/${encodeURIComponent(d.path)}" style="--dc:var(--${d.accent || 'primary'})"><div class="tn">${esc((d.category || '').toUpperCase())} ${ic('arrow')}</div><div class="tt">${esc(d.title)}</div>${d.desc ? `<div class="td">${esc(d.desc)}</div>` : ''}<div class="go">Open ${ic('arrow')}</div></a>`;
}
async function renderKnowledge(idx) {
  const nav = idx.nav || [], groups = {};
  nav.forEach((d) => { const c = d.category || 'Reference'; (groups[c] = groups[c] || []).push(d); });
  const order = [...CATEGORY_ORDER.filter((c) => groups[c]), ...Object.keys(groups).filter((c) => !CATEGORY_ORDER.includes(c))];
  const sections = order.map((c) => `<section><div class="sec-head"><p class="eyebrow">${ic(CATEGORY_ICON[c] || 'book')} ${esc(c)}</p><h2>${c === 'Playbook' ? 'Your playbook' : esc(c)}</h2></div><article class="card"><div class="cardgrid">${groups[c].map(tile).join('')}</div></article></section>`).join('');
  app().innerHTML = `<header class="hero"><p class="eyebrow">${ic('book')} Library</p><h1>Everything you’re building on</h1><p class="lede">Your venture’s playbook up top; the thinking behind Venture OS below.</p></header>${sections}`;
  document.title = 'Library · Venture OS'; window.scrollTo(0, 0);
}
async function renderDoc(path) {
  app().innerHTML = `<article class="card"><p class="lead">${ic('clock')} Opening &hellip;</p></article>`;
  try {
    const r = await fetch(path, { cache: 'no-cache' }); if (!r.ok) throw 0; const md = await r.text();
    app().innerHTML = `<div class="pagenav"><a href="#/">${ic('target')}<span class="dir">Back to</span><span class="ttl">Mission</span></a><a href="#/knowledge">${ic('book')}<span class="dir">Open</span><span class="ttl">Library</span></a></div><article class="card"><div class="doc-body">${mdBlock(md)}</div></article><div class="pagenav"><a href="#/">${ic('arrow')}<span class="dir">Back to</span><span class="ttl">Mission</span></a></div>`;
    document.title = 'Venture OS'; window.scrollTo(0, 0);
  } catch (e) { app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span>That page isn’t available.</span></div></article>`; }
}
function setActiveNav(name) { document.querySelectorAll('.topbar .nav a[data-nav]').forEach((a) => a.classList.toggle('active', a.getAttribute('data-nav') === name)); }
async function route() {
  const h = location.hash || '#/'; const idx = await loadIndex();
  if (h.startsWith('#/doc/')) { await renderDoc(decodeURIComponent(h.slice('#/doc/'.length))); setActiveNav(null); }
  else if (h.startsWith('#/pipeline')) { renderPipeline(); setActiveNav('pipeline'); }
  else if (h.startsWith('#/knowledge')) { await renderKnowledge(idx); setActiveNav('knowledge'); }
  else { await renderMission(idx); setActiveNav('mission'); }
}
window.addEventListener('hashchange', route);
function showUpdate() { if (document.getElementById('vos-update')) return; const b = document.createElement('div'); b.id = 'vos-update'; b.className = 'note note--you'; b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:100;max-width:560px;margin:0 auto;cursor:pointer;box-shadow:var(--shadow)'; b.innerHTML = '<svg class="ic"><use href="#i-info"/></svg><span><b>Update available.</b> Tap to refresh.</span>'; b.onclick = () => location.reload(); document.body.appendChild(b); }
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').then((reg) => { reg.addEventListener('updatefound', () => { const nw = reg.installing; if (nw) nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(); }); }); }).catch(() => {}); }); }
route();
