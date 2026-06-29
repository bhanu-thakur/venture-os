/* Venture OS - Application Layer (the company HQ you operate).
   Repository = canonical record for durable truth. A local working layer (browser)
   holds the founder's daily working state, now namespaced PER VENTURE so nothing is
   mixed between ventures. HQ is the founder home; each venture is its own workspace.
   (Experience Architecture: Portfolio activates at >=2 ventures; ADR-0018 working layer.) */

const STATE = { idx: null };
const app = () => document.getElementById('app');
const ic = (name) => `<svg class="ic"><use href="#i-${name}"/></svg>`;
const esc = (s) => String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const mdBlock = (s) => (window.marked && window.marked.parse) ? window.marked.parse(s) : ('<pre>' + esc(s) + '</pre>');
const mdInline = (s) => (window.marked && window.marked.parseInline) ? window.marked.parseInline(s) : esc(s);

const CATEGORY_ORDER = ['Operating System'];
const CATEGORY_ICON = { 'Operating System': 'compass', 'Playbook': 'target' };
const VENTURE_STATES = ['Idea', 'Research', 'Validation', 'Prototype', 'Execution', 'Revenue', 'Scale'];
const TYPE_ICON = { 'Learning venture': 'bulb', 'Client venture': 'building' };

/* --- local working layer (browser), namespaced per venture --- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
const vkey = (slug, k) => `vos:${slug}:${k}`;
const todayKey = () => new Date().toISOString().slice(0, 10);
const yesterdayKey = () => new Date(Date.now() - 864e5).toISOString().slice(0, 10);

// One-time migration: legacy global working state -> Venture 001 namespace.
function migrate() {
  if (LS.get('vos:migrated', false)) return;
  const target = 'venture-001-hospitality-media';
  ['checks', 'captures', 'streak', 'pipeline'].forEach((k) => {
    const old = LS.get('vos:' + k, null);
    if (old != null && LS.get(vkey(target, k), null) == null) LS.set(vkey(target, k), old);
  });
  LS.set('vos:migrated', true);
}

function registerWin(slug) {
  const key = vkey(slug, 'streak'), t = todayKey(), s = LS.get(key, { count: 0, last: '' });
  if (s.last === t) return s;
  s.count = (s.last === yesterdayKey()) ? s.count + 1 : 1; s.last = t; LS.set(key, s); return s;
}

async function fetchText(p) { try { const r = await fetch(p, { cache: 'no-cache' }); if (!r.ok) throw 0; return await r.text(); } catch (e) { return null; } }
async function loadIndex() {
  if (STATE.idx) return STATE.idx;
  try { const r = await fetch('index.json', { cache: 'no-cache' }); STATE.idx = await r.json(); } catch (e) { STATE.idx = { nav: [], ventures: [] }; }
  return STATE.idx;
}

/* --- markdown field helpers --- */
function firstTitle(md) { const m = md.match(/^#\s+(.+)$/m); return m ? m[1].trim() : null; }
function fieldLine(md, label) { const m = md.match(new RegExp('\\*\\*' + label + ':?\\*\\*\\s*([^\\n]+)')); return m ? m[1].trim().replace(/\*\*/g, '') : null; }
function frontmatterField(md, key) { const m = md.match(new RegExp('^' + key + ':\\s*(.+)$', 'm')); return m ? m[1].trim() : null; }
function sectionBlock(md, h) { const L = md.split('\n'); const i = L.findIndex((l) => /^#{1,3}\s/.test(l) && l.toLowerCase().includes(h.toLowerCase())); if (i < 0) return ''; const o = []; for (let j = i + 1; j < L.length; j++) { if (/^#{1,3}\s/.test(L[j])) break; o.push(L[j]); } return o.join('\n').trim(); }
function firstLine(s) { return (s || '').split('\n').map((x) => x.trim()).filter(Boolean)[0] || ''; }
// A markdown italic placeholder like "_None yet._" carries no real content.
function realLine(s) { s = (s || '').trim(); return /^_/.test(s) ? '' : s; }
function shortObjective(s) { let h = String(s || '').split(/\s*[\(—:]| so that | so /)[0].trim(); const w = h.split(/\s+/); if (w.length > 9) h = w.slice(0, 9).join(' ') + '…'; return h || String(s || ''); }
function amount(s) { const n = Number(String(s || '').replace(/[^0-9.]/g, '')); return isFinite(n) ? n : 0; }
function inr(n) { return '₹' + (n || 0).toLocaleString('en-IN'); }
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }

/* --- venture resolution + active-focus pointer (working layer) --- */
function slugFromPath(p) { const m = String(p || '').match(/ventures\/([^\/]+)\//); return m ? m[1] : ''; }
function defaultSlug(idx) { return slugFromPath(idx.activeVenture) || ((idx.ventures || [])[0] && idx.ventures[0].slug) || ''; }
function activeSlug(idx) { const d = defaultSlug(idx); const s = LS.get('vos:active', d) || d; return (idx.ventures || []).some((v) => v.slug === s) ? s : d; }
function ventureBySlug(idx, slug) { return (idx.ventures || []).find((v) => v.slug === slug) || null; }

async function snapshot(v) {
  const [readme, mission] = await Promise.all([fetchText(v.path), fetchText(v.path.replace(/README\.md$/, 'mission.md'))]);
  const r = readme || '', m = mission || '';
  const objective = firstLine(sectionBlock(m, "Today's Objective") || sectionBlock(m, 'Today'));
  const action = firstLine(sectionBlock(m, 'Highest-Leverage Next Action') || sectionBlock(m, 'Next Action'));
  return {
    v, r, m,
    name: firstTitle(r) || v.title,
    state: fieldLine(r, 'State') || v.state || '',
    objective: realLine(objective),
    success: realLine(firstLine(sectionBlock(m, 'Success Today'))),
    action: realLine(action) || realLine(objective),
    why: realLine(firstLine(sectionBlock(m, 'Bottleneck'))),
    proof: realLine(firstLine(sectionBlock(m, 'Proof of Execution'))),
    decision: realLine(firstLine(sectionBlock(m, 'Decision Needed') || sectionBlock(m, 'Decision Required'))),
    revTarget: fieldLine(r, 'Revenue Target'),
    revCurrent: frontmatterField(m, 'revenue_current')
  };
}

function statePath(state) {
  const cur = VENTURE_STATES.findIndex((x) => x.toLowerCase() === String(state).toLowerCase());
  return VENTURE_STATES.map((s, i) => `<div class="seg ${i === cur ? 'seg--good' : 'seg--flat'}" style="flex:1${(cur >= 0 && i > cur) ? ';opacity:.45' : ''}"><span class="sname">${esc(s)}</span></div>`).join('');
}
function revBlockHtml(revTarget, revCurrent) {
  if (!revTarget) return '';
  const tv = amount(revTarget), c = amount(revCurrent), rp = tv > 0 ? Math.max(0, Math.min(100, Math.round(c / tv * 100))) : 0;
  return `<div class="mission-progress"><p class="eyebrow">${ic('cash')} Revenue</p><div class="rev-bar"><div class="rev-fill" style="width:${rp}%"></div></div><div class="rev-meta"><span>${esc(revCurrent || '₹0')}</span><span>${esc(revTarget)}</span></div></div>`;
}

/* ============================================================
   HQ — the founder home. Belongs to Bhanu, not to any venture.
   ============================================================ */
async function renderHQ(idx) {
  const ventures = idx.ventures || [];
  const snaps = await Promise.all(ventures.map(snapshot));
  const aSlug = activeSlug(idx);
  const active = snaps.find((s) => s.v.slug === aSlug) || snaps[0];

  // aggregates across the portfolio
  const earned = snaps.reduce((n, s) => n + amount(s.revCurrent), 0);
  const leadsInPlay = LS.get(vkey(aSlug, 'pipeline'), []).filter((l) => l.stage !== 'Won').length;
  const streak = LS.get(vkey(aSlug, 'streak'), { count: 0, last: '' });
  const decisions = snaps.filter((s) => s.decision);

  // what moved recently, across every venture
  const moved = [];
  snaps.forEach((s) => LS.get(vkey(s.v.slug, 'captures'), []).forEach((c) => moved.push({ date: c.date, text: c.text, who: s.v.short })));
  moved.sort((a, b) => (a.date < b.date ? 1 : -1));
  const movedHtml = moved.slice(0, 3).map((c) => `<li><span class="d">${esc(c.date)}</span><span class="who">${esc(c.who)}</span>${esc(c.text)}</li>`).join('');

  const attn = active ? `
    <section class="hq-attention">
      <p class="eyebrow">${ic('target')} Needs you today</p>
      <a class="attn-card" href="#/v/${esc(active.v.slug)}">
        <div class="attn-venture">${esc(active.v.short)} · today's focus</div>
        <h2 class="attn-win">${active.objective ? mdInline(shortObjective(active.objective)) : 'Set today’s objective'}</h2>
        ${active.action ? `<p class="attn-action">${ic('arrow')} ${mdInline(active.action.split('. ')[0])}</p>` : ''}
        <span class="attn-go">Enter workspace ${ic('arrow')}</span>
      </a>
    </section>` : '';

  const decisionHtml = decisions.length ? `
    <section class="hq-decisions">
      <p class="eyebrow">${ic('warn')} Decisions waiting</p>
      ${decisions.map((s) => `<a class="note note--watch hq-dec" href="#/v/${esc(s.v.slug)}">${ic('warn')}<span><b>${esc(s.v.short)}.</b> ${mdInline(s.decision)}</span></a>`).join('')}
    </section>` : '';

  const cards = snaps.map((s) => {
    const isActive = s.v.slug === aSlug;
    const isIdea = String(s.state).toLowerCase() === 'idea';
    const typeIcon = TYPE_ICON[s.v.type] || 'layers';
    let cta;
    if (isActive) cta = `<span class="pill pill--good">Today’s focus</span>`;
    else if (isIdea) cta = `<span class="switch-note">Validate before activating</span>`;
    else cta = `<button class="btn-switch" type="button" data-switch="${esc(s.v.slug)}" data-name="${esc(s.v.short)}">Make today’s focus</button>`;
    return `
      <article class="vcard ${isActive ? 'vcard--active' : ''}" style="--vc:var(--${s.v.accent || 'primary'})">
        <a class="vcard-open" href="#/v/${esc(s.v.slug)}">
          <div class="vcard-top"><span class="vtype">${ic(typeIcon)} ${esc(s.v.type || '')}</span><span class="vstate">${esc(s.state)}</span></div>
          <h3 class="vcard-name">${esc(s.v.short)}</h3>
          <p class="vcard-tag">${esc(s.v.tagline || s.objective || '')}</p>
          <span class="vcard-go">Enter ${ic('arrow')}</span>
        </a>
        <div class="vcard-foot">${cta}</div>
      </article>`;
  }).join('');

  app().innerHTML = `
    <div class="hq">
      <header class="hq-head">
        <p class="hq-greeting">${greeting()}, Bhanu.</p>
        <h1 class="hq-title">Your company</h1>
        <p class="hq-sub">${ventures.length} venture${ventures.length === 1 ? '' : 's'} · today you’re driving <b>${esc(active ? active.v.short : '—')}</b>. Choose where your attention goes, then go deep in one.</p>
      </header>

      <div class="stats" style="--n:3">
        <div class="stat"><div class="big">${streak.count}</div><div class="lbl">Day streak</div><div class="sub">On ${esc(active ? active.v.short : 'your focus')}</div></div>
        <div class="stat" style="--cat:var(--c3)"><div class="big">${leadsInPlay}</div><div class="lbl">Leads in play</div><div class="sub">In the active pipeline</div></div>
        <div class="stat" style="--cat:var(--c2)"><div class="big">${esc(inr(earned))}</div><div class="lbl">Earned</div><div class="sub">Across all ventures</div></div>
      </div>

      ${attn}
      ${decisionHtml}

      <section class="hq-ventures">
        <div class="sec-head"><p class="eyebrow">${ic('grid')} Your ventures</p><h2>The portfolio</h2><p>Every venture is its own room. Enter one and everything adapts to it. Switching focus is a deliberate act — nothing is ever lost.</p></div>
        <div class="vgrid">${cards}</div>
      </section>

      ${movedHtml ? `<section class="hq-moved"><p class="eyebrow">${ic('activity')} What moved recently</p><ul class="moved">${movedHtml}</ul></section>` : ''}
    </div>`;

  document.querySelectorAll('.btn-switch').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    const slug = b.getAttribute('data-switch'), name = b.getAttribute('data-name');
    const cur = active ? active.v.short : 'your current venture';
    if (window.confirm(`Switch today’s focus to ${name}?\n\n${cur} will be paused — nothing is lost, you can switch back anytime.`)) {
      LS.set('vos:active', slug); renderHQ(STATE.idx);
    }
  }));

  document.title = 'Venture OS — HQ'; window.scrollTo(0, 0);
}

/* ============================================================
   VENTURE WORKSPACE — context-aware cockpit for one venture.
   ============================================================ */
async function renderWorkspace(idx, slug) {
  const v = ventureBySlug(idx, slug);
  if (!v) { app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span>That venture isn’t in the portfolio. <a href="#/">Back to HQ</a>.</span></div></article>`; return; }
  const s = await snapshot(v);
  const isActive = activeSlug(idx) === slug;
  const isLearning = (v.type || '').toLowerCase().includes('learning');
  const tracks = venTracks(v);
  if (tracks.length) ensureLearnMigrated(slug, tracks[0].id);
  const trackSums = tracks.length ? await Promise.all(tracks.map((tr) => trackSummary(slug, tr))) : [];
  const t = todayKey();

  // per-venture working state
  const captures = LS.get(vkey(slug, 'captures'), []);
  const pipe = LS.get(vkey(slug, 'pipeline'), []);
  const leadsInPlay = pipe.filter((l) => l.stage !== 'Won').length;
  const wonToday = captures.some((c) => c.date === t);
  const checks = Object.assign({ act: false, second: false }, (LS.get(vkey(slug, 'checks'), {})[t]) || {});
  const streak = LS.get(vkey(slug, 'streak'), { count: 0, last: '' });

  const actionShort = (s.action.split('. ')[0] || s.action).trim() || 'Take the next step';
  const secondLabel = isLearning ? 'Finish one practice rep' : 'Move one lead forward';
  const steps = [
    { id: 'act', label: actionShort, on: !!checks.act },
    { id: 'second', label: secondLabel, on: !!checks.second },
    { id: 'log', label: 'Capture today’s win', on: wonToday, locked: true }
  ];
  const done = steps.filter((x) => x.on).length, pct = Math.round(done / steps.length * 100);

  const modules = (v.modules || []).map((mod) => `<a class="tile" href="#/doc/${encodeURIComponent(mod.path)}" style="--dc:var(--${mod.accent || v.accent || 'primary'})"><div class="tn">${ic(mod.icon || 'book')} OPEN</div><div class="tt">${esc(mod.title)}</div>${mod.desc ? `<div class="td">${esc(mod.desc)}</div>` : ''}<div class="go">Open ${ic('arrow')}</div></a>`).join('');
  const pipeTile = `<a class="tile" href="#/v/${esc(slug)}/pipeline" style="--dc:var(--c3)"><div class="tn">${ic('cash')} TRACK</div><div class="tt">Pipeline</div><div class="td">Leads & opportunities${leadsInPlay ? ` · ${leadsInPlay} in play` : ''}</div><div class="go">Open ${ic('arrow')}</div></a>`;

  const recent = captures.slice(-3).reverse().map((c) => `<li><span class="d">${esc(c.date)}</span>${esc(c.text)}</li>`).join('');
  const detail = [s.why ? `<p><b>Why it matters.</b> ${mdInline(s.why)}</p>` : '', s.proof ? `<p><b>The proof you’re after.</b> ${mdInline(s.proof)}</p>` : ''].join('');
  const typeIcon = TYPE_ICON[v.type] || 'layers';

  app().innerHTML = `
    <div class="ws">
      <div class="ws-bar">
        <a class="ws-back" href="#/">${ic('arrow')} HQ</a>
        ${isActive ? `<span class="pill pill--good">Today’s focus</span>` : `<button class="btn-switch sm" type="button" data-switch="${esc(slug)}" data-name="${esc(v.short)}">Make today’s focus</button>`}
      </div>

      <header class="ws-head" style="--vc:var(--${v.accent || 'primary'})">
        <p class="eyebrow">${ic(typeIcon)} ${esc(v.type || '')} · ${esc(s.state)}</p>
        <h1 class="ws-name">${esc(s.name)}</h1>
        ${v.tagline ? `<p class="ws-tag">${esc(v.tagline)}</p>` : ''}
      </header>

      <div class="stats" style="--n:3">
        <div class="stat"><div class="big">${streak.count}</div><div class="lbl">Day streak</div><div class="sub">Finished work, daily</div></div>
        <div class="stat" style="--cat:var(--c3)"><div class="big">${leadsInPlay}</div><div class="lbl">${isLearning ? 'Opportunities' : 'Leads in play'}</div><div class="sub">In this venture</div></div>
        <div class="stat" style="--cat:var(--c2)"><div class="big">${esc(s.revCurrent || '₹0')}</div><div class="lbl">of ${esc(s.revTarget || '—')}</div><div class="sub">Toward the target</div></div>
      </div>

      <h2 class="mission-win">${s.objective ? mdInline(shortObjective(s.objective)) : 'Set today’s objective'}</h2>
      <p class="mission-meaning">${s.success ? mdInline(s.success) : (s.objective ? mdInline(s.objective) : '')}</p>
      ${detail ? `<button class="ma-toggle" type="button" aria-expanded="false">Why this matters ${ic('chevron')}</button><div class="ma-detail">${detail}</div>` : ''}

      ${trackSums.length ? `<section class="skills"><div class="sec-head"><p class="eyebrow">${ic('bulb')} Skills · learn by doing</p></div><div class="skillgrid">${trackSums.map((s) => { const pct = s.total ? Math.round(s.shipped / s.total * 100) : 0; return `<a class="skill" href="#/v/${esc(slug)}/learn/${esc(s.id)}" style="--vc:var(--${v.accent || 'primary'})"><div class="sk-top">${ic(s.icon || 'layers')} ${esc(s.title)}</div><div class="sk-meta">${s.allDone ? 'Complete' : `Rung ${s.current + 1} of ${s.total}`} · ${s.shipped} shipped</div><div class="sk-bar"><i style="width:${pct}%"></i></div><div class="sk-next">${ic('arrow')} ${esc(s.nextText)}</div></a>`; }).join('')}</div></section>` : ''}

      <section class="plan">
        <p class="eyebrow">${ic('check')} Today’s plan · ${done}/${steps.length}</p>
        <div class="plan-bar"><i style="width:${pct}%"></i></div>
        ${steps.map((x) => `<div class="check-item ${x.on ? 'on' : ''}" ${x.locked ? '' : `data-step="${x.id}"`}><span class="box">${ic('check')}</span> ${esc(x.label)}</div>`).join('')}
      </section>

      <section class="capture-box">
        <p class="eyebrow">${ic('plus')} Capture a win</p>
        <div class="capture-row"><input id="vos-cap-input" placeholder="What moved forward in ${esc(v.short)} today?" autocomplete="off"><button id="vos-cap-save" type="button">Save</button></div>
        ${recent ? `<ul class="recent">${recent}</ul>` : ''}
      </section>

      <section class="ws-modules">
        <p class="eyebrow">${ic('layers')} Workspace</p>
        <div class="cardgrid">${modules}${pipeTile}</div>
      </section>

      <div class="mission-progress"><p class="eyebrow">${ic('activity')} The journey</p><div class="track statepath">${statePath(s.state)}</div></div>
      ${revBlockHtml(s.revTarget, s.revCurrent)}
    </div>`;

  const tog = document.querySelector('.ma-toggle');
  if (tog) tog.addEventListener('click', () => { const o = tog.getAttribute('aria-expanded') === 'true'; tog.setAttribute('aria-expanded', String(!o)); tog.innerHTML = (o ? 'Why this matters ' : 'Hide ') + ic('chevron'); });

  document.querySelectorAll('.check-item[data-step]').forEach((el) => el.addEventListener('click', () => {
    const id = el.getAttribute('data-step'); const c = LS.get(vkey(slug, 'checks'), {}); c[t] = Object.assign({}, c[t]); c[t][id] = !c[t][id]; LS.set(vkey(slug, 'checks'), c); renderWorkspace(STATE.idx, slug);
  }));
  const save = document.getElementById('vos-cap-save'), inp = document.getElementById('vos-cap-input');
  const doSave = () => { const val = (inp.value || '').trim(); if (!val) { inp.focus(); return; } const list = LS.get(vkey(slug, 'captures'), []); list.push({ date: t, text: val }); LS.set(vkey(slug, 'captures'), list); registerWin(slug); renderWorkspace(STATE.idx, slug); };
  if (save) save.addEventListener('click', doSave);
  if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSave(); });
  document.querySelectorAll('.btn-switch').forEach((b) => b.addEventListener('click', () => {
    const sl = b.getAttribute('data-switch'), nm = b.getAttribute('data-name');
    if (window.confirm(`Switch today’s focus to ${nm}?\n\nNothing is lost — you can switch back anytime.`)) { LS.set('vos:active', sl); renderWorkspace(STATE.idx, slug); }
  }));

  document.title = s.name + ' — Venture OS'; window.scrollTo(0, 0);
}

/* ============================================================
   LEARNING ENGINE — curriculum as execution (learning ventures).
   The repository's curriculum.md is the source of truth; the runtime
   parses it into rungs and walks the founder through one loop at a time:
   learn -> do the real challenge -> ship a portfolio piece -> review.
   ============================================================ */
function venTracks(v) { return (v && v.tracks) || []; }
function trackById(v, id) { return venTracks(v).find((t) => t.id === id) || null; }
// Parse a track file into rungs. Each rung: Goal / Lesson / Do (a list of real-world
// actions) / Milestone / Review. The Do list is the interactive, get-off-your-seat core.
function parseTrack(md) {
  const lines = (md || '').split('\n');
  const fld = (blk, name) => { const m = blk.match(new RegExp('\\*\\*' + name + ':?\\*\\*\\s*([^\\n]*)')); return m ? m[1].trim() : ''; };
  const doList = (blk) => {
    const L = blk.split('\n'); const out = []; let on = false;
    for (const l of L) {
      if (/^\s*\*\*Do:?\*\*/i.test(l)) { on = true; continue; }
      if (on) { if (/^\s*-\s+/.test(l)) out.push(l.replace(/^\s*-\s+/, '').trim()); else if (/^\s*\*\*/.test(l) || /^#{1,6}\s/.test(l)) break; }
    }
    return out;
  };
  const idxs = []; lines.forEach((l, i) => { if (/^##\s+Rung\b/i.test(l)) idxs.push(i); });
  return idxs.map((start, k) => {
    const end = (k + 1 < idxs.length) ? idxs[k + 1] : lines.length;
    const head = lines[start].replace(/^##\s+/, '').trim();
    const title = head.replace(/^Rung\s+\d+\s*[—-]\s*/i, '').trim() || head;
    const blk = lines.slice(start, end).join('\n');
    return { title, head, goal: fld(blk, 'Goal'), lesson: fld(blk, 'Lesson'), steps: doList(blk), milestone: fld(blk, 'Milestone'), review: fld(blk, 'Review') };
  });
}
/* progress storage v2: vos:<slug>:learn = { tracks: { <trackId>: { current, done:{<rung>:{do:{i:true},ms:bool}}, portfolio:[] } } } */
function ensureLearnMigrated(slug, firstTid) {
  const d = LS.get(vkey(slug, 'learn'), null);
  if (d && !d.tracks) { const nd = { tracks: {} }; if ((d.current != null || d.portfolio) && firstTid) nd.tracks[firstTid] = { current: d.current || 0, done: {}, portfolio: d.portfolio || [] }; LS.set(vkey(slug, 'learn'), nd); }
}
function getTrackState(slug, tid) { const d = LS.get(vkey(slug, 'learn'), {}); const st = (d.tracks && d.tracks[tid]) || {}; return { current: st.current || 0, done: st.done || {}, portfolio: st.portfolio || [] }; }
function setTrackState(slug, tid, st) { const d = LS.get(vkey(slug, 'learn'), {}); const nd = { tracks: Object.assign({}, d.tracks) }; nd.tracks[tid] = st; LS.set(vkey(slug, 'learn'), nd); }
function rungDone(state, i) { return state.done[i] || { do: {}, ms: false }; }
function rungReady(rung, dr) { return rung.steps.every((s, i) => dr.do[i]) && (rung.steps.length === 0 ? dr.ms : dr.ms); }
function rungFocal(rung, dr) { const i = rung.steps.findIndex((s, ix) => !dr.do[ix]); if (i >= 0) return { type: 'do', i, text: rung.steps[i] }; if (!dr.ms) return { type: 'ms', text: rung.milestone }; return null; }
async function trackSummary(slug, t) {
  const rungs = parseTrack(await fetchText(t.path) || '');
  if (!rungs.length) return { id: t.id, title: t.title, icon: t.icon, desc: t.desc, total: 0, current: 0, nextText: 'Coming soon', shipped: 0, allDone: false };
  const st = getTrackState(slug, t.id), cur = Math.min(st.current || 0, rungs.length - 1), rung = rungs[cur];
  const dr = rungDone(st, cur), allShipped = (st.portfolio || []).length >= rungs.length;
  const f = rungFocal(rung, dr);
  const nextText = allShipped ? 'Track complete' : (f ? f.text : 'Complete the rung');
  return { id: t.id, title: t.title, icon: t.icon, desc: t.desc, total: rungs.length, current: cur, rungTitle: rung.title, nextText, shipped: (st.portfolio || []).length, allDone: allShipped };
}

// Skills chooser: all of a venture's tracks with live progress + next action.
async function renderSkills(idx, slug) {
  const v = ventureBySlug(idx, slug);
  if (!v) { app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span>Unknown venture. <a href="#/">HQ</a>.</span></div></article>`; return; }
  const tracks = venTracks(v);
  if (!tracks.length) { app().innerHTML = `<div class="ws-bar"><a class="ws-back" href="#/v/${esc(slug)}">${ic('arrow')} ${esc(v.short)}</a></div><article class="card"><div class="note note--warn">${ic('warn')}<span>No skill tracks for this venture yet.</span></div></article>`; return; }
  ensureLearnMigrated(slug, tracks[0].id);
  const sums = await Promise.all(tracks.map((t) => trackSummary(slug, t)));
  const cards = sums.map((s) => { const pct = s.total ? Math.round(s.shipped / s.total * 100) : 0; return `<a class="skill" href="#/v/${esc(slug)}/learn/${esc(s.id)}" style="--vc:var(--${v.accent || 'primary'})"><div class="sk-top">${ic(s.icon || 'layers')} ${esc(s.title)}</div>${s.desc ? `<div class="sk-desc">${esc(s.desc)}</div>` : ''}<div class="sk-meta">${s.allDone ? 'Complete' : `Rung ${s.current + 1} of ${s.total}`} · ${s.shipped} shipped</div><div class="sk-bar"><i style="width:${pct}%"></i></div><div class="sk-next">${ic('arrow')} ${esc(s.nextText)}</div></a>`; }).join('');
  app().innerHTML = `
    <div class="ws">
      <div class="ws-bar"><a class="ws-back" href="#/v/${esc(slug)}">${ic('arrow')} ${esc(v.short)}</a></div>
      <header class="ws-head" style="--vc:var(--${v.accent || 'primary'})">
        <p class="eyebrow">${ic('bulb')} Skills · ${esc(v.short)}</p>
        <h1 class="ws-name">Learn by doing</h1>
        <p class="ws-tag">Pick a skill. Each one is a ladder of real-world actions — climb a rung today.</p>
      </header>
      <div class="skillgrid big">${cards}</div>
    </div>`;
  document.title = 'Skills · ' + v.short; window.scrollTo(0, 0);
}

// A single skill track: current rung with a focal action, the DO checklist, the milestone, portfolio.
async function renderTrack(idx, slug, tid) {
  const v = ventureBySlug(idx, slug); const t = v && trackById(v, tid);
  if (!v || !t) { app().innerHTML = `<div class="ws-bar"><a class="ws-back" href="#/v/${esc(slug)}/learn">${ic('arrow')} back</a></div><article class="card"><div class="note note--warn">${ic('warn')}<span>Unknown skill track.</span></div></article>`; return; }
  ensureLearnMigrated(slug, venTracks(v)[0].id);
  const rungs = parseTrack(await fetchText(t.path) || '');
  if (!rungs.length) { app().innerHTML = `<div class="ws-bar"><a class="ws-back" href="#/v/${esc(slug)}/learn">${ic('arrow')} back</a></div><article class="card"><div class="note note--warn">${ic('warn')}<span>This track couldn’t be read.</span></div></article>`; return; }
  const st = getTrackState(slug, tid), cur = Math.min(st.current || 0, rungs.length - 1), rung = rungs[cur];
  const dr = rungDone(st, cur);
  const doneCount = rung.steps.filter((s, i) => dr.do[i]).length + (dr.ms ? 1 : 0), totalCount = rung.steps.length + 1;
  const allShipped = (st.portfolio || []).length >= rungs.length;
  const ready = rungReady(rung, dr);
  const focal = rungFocal(rung, dr);
  const today = todayKey();

  const bar = rungs.map((r, i) => { const shipped = (st.portfolio || []).some((x) => x.rung === i); const cls = shipped ? 'seg--good' : (i === cur ? 'seg--watch' : 'seg--flat'); return `<div class="seg ${cls}" style="flex:1"><span class="sname">${i + 1}</span></div>`; }).join('');
  const portfolio = (st.portfolio || []).slice().reverse().map((x) => `<li><span class="d">${esc(x.date)}</span><span class="who">Rung ${x.rung + 1}</span>${esc(x.title)}${x.note ? ` — ${esc(x.note)}` : ''}</li>`).join('');

  const focalHtml = allShipped
    ? `<div class="learn-focal done"><p class="lf-label">${ic('star')} Track complete</p><p class="lf-verb">You’ve cleared all ${rungs.length} rungs of ${esc(t.title)}.</p><p class="lf-body">Put it to work for real — or revisit a rung to sharpen it.</p></div>`
    : `<div class="learn-focal"><p class="lf-label">${ic('target')} Do this now</p><p class="lf-verb">${focal ? mdInline(focal.text) : 'Complete this rung'}</p><p class="lf-body">${focal && focal.type === 'ms' ? 'This is the milestone — finish it and the rung is done.' : 'One concrete action. Do it in the real world, then check it off.'}</p>${focal ? `<button class="lf-do" type="button" data-do="${focal.type}" data-i="${focal.type === 'do' ? focal.i : ''}">Mark done ${ic('check')}</button>` : ''}</div>`;

  const steplist = rung.steps.map((s, i) => `<div class="learn-step ${dr.do[i] ? 'on' : ''}" data-do="do" data-i="${i}"><span class="box">${ic('check')}</span><div class="ls-main"><div class="ls-body">${mdInline(s)}</div></div></div>`).join('');
  const msRow = `<div class="learn-step ms ${dr.ms ? 'on' : ''}" data-do="ms"><span class="box">${ic('flag')}</span><div class="ls-main"><div class="ls-verb">Milestone</div><div class="ls-body">${mdInline(rung.milestone || '')}</div></div></div>`;

  app().innerHTML = `
    <div class="ws">
      <div class="ws-bar"><a class="ws-back" href="#/v/${esc(slug)}/learn">${ic('arrow')} ${esc(t.title)}</a><span class="pill pill--brand">Rung ${cur + 1} of ${rungs.length}</span></div>
      <header class="ws-head" style="--vc:var(--${v.accent || 'primary'})">
        <p class="eyebrow">${ic(t.icon || 'bulb')} ${esc(t.title)} · ${esc(v.short)}</p>
        <h1 class="ws-name">${esc(rung.title)}</h1>
        ${rung.goal ? `<p class="ws-tag">${mdInline(rung.goal)}</p>` : ''}
      </header>
      <div class="mission-progress"><div class="track statepath learn-track">${bar}</div></div>
      ${focalHtml}
      ${rung.lesson ? `<div class="learn-lesson"><p class="ll-label">${ic('book')} Lesson</p><p>${mdInline(rung.lesson)}</p></div>` : ''}
      <section class="learn-loop">
        <p class="eyebrow">${ic('check')} Your actions · ${doneCount}/${totalCount}</p>
        ${steplist}
        ${msRow}
      </section>
      <section class="learn-complete">
        ${(ready && !allShipped) ? `<div class="capture-row"><input id="learn-note" placeholder="Link or note for this piece (optional)" autocomplete="off"><button id="learn-done" type="button">Complete Rung ${cur + 1} ${ic('arrow')}</button></div><p class="learn-hint">Banks this as a portfolio piece and ${cur + 1 < rungs.length ? 'opens the next rung' : 'finishes the track'}.</p>` : (!allShipped ? `<p class="learn-hint">${ic('info')} Do every action and the milestone to complete this rung.</p>` : '')}
      </section>
      ${portfolio ? `<section class="learn-portfolio"><p class="eyebrow">${ic('star')} Portfolio · milestones hit</p><ul class="moved">${portfolio}</ul></section>` : ''}
    </div>`;

  const toggle = (type, i) => {
    const s = getTrackState(slug, tid); const d = Object.assign({ do: {}, ms: false }, s.done[cur]); d.do = Object.assign({}, d.do);
    if (type === 'ms') d.ms = !d.ms; else d.do[i] = !d.do[i];
    s.done = Object.assign({}, s.done); s.done[cur] = d; setTrackState(slug, tid, s); renderTrack(STATE.idx, slug, tid);
  };
  document.querySelectorAll('.learn-step[data-do]').forEach((el) => el.addEventListener('click', () => toggle(el.getAttribute('data-do'), Number(el.getAttribute('data-i')))));
  const df = document.querySelector('.lf-do'); if (df) df.addEventListener('click', () => toggle(df.getAttribute('data-do'), Number(df.getAttribute('data-i'))));
  const done = document.getElementById('learn-done');
  if (done) done.addEventListener('click', () => {
    const s = getTrackState(slug, tid); const note = (document.getElementById('learn-note').value || '').trim();
    if (!(s.portfolio || []).some((x) => x.rung === cur)) { s.portfolio = (s.portfolio || []); s.portfolio.push({ rung: cur, title: rung.title, date: today, note }); }
    s.current = Math.min(cur + 1, rungs.length - 1); setTrackState(slug, tid, s); registerWin(slug); renderTrack(STATE.idx, slug, tid);
  });
  document.title = t.title + ' · ' + v.short; window.scrollTo(0, 0);
}

/* ============================================================
   PIPELINE — scoped to a single venture.
   ============================================================ */
const PIPE_STAGES = ['To reach', 'In talks', 'Won'];
function renderPipeline(idx, slug) {
  const v = ventureBySlug(idx, slug);
  if (!v) { app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span>Unknown venture. <a href="#/">Back to HQ</a>.</span></div></article>`; return; }
  const key = vkey(slug, 'pipeline');
  const leads = LS.get(key, []);
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
    <div class="ws-bar"><a class="ws-back" href="#/v/${esc(slug)}">${ic('arrow')} ${esc(v.short)}</a></div>
    <header class="hero"><p class="eyebrow">${ic('cash')} Pipeline · ${esc(v.short)}</p><h1>Who you’re chasing</h1><p class="lede">Leads for this venture only — from first contact to paid. Move one forward every day.</p></header>
    <div class="stats" style="--n:3">${stats}</div>
    <article class="card">
      <div class="card-title"><span class="ico">${ic('plus')}</span><div><h3>Add a lead</h3></div></div>
      <div class="lead-form">
        <input id="pl-name" placeholder="Name or codename" autocomplete="off">
        <input id="pl-type" placeholder="Type — e.g. boutique hotel / couple / studio" autocomplete="off">
        <input id="pl-next" placeholder="Next action — e.g. send the free-reel offer" autocomplete="off">
        <button id="pl-add" type="button">Add to pipeline</button>
      </div>
    </article>
    ${sections}`;
  const add = document.getElementById('pl-add');
  if (add) add.addEventListener('click', () => {
    const name = (document.getElementById('pl-name').value || '').trim(); if (!name) { document.getElementById('pl-name').focus(); return; }
    const list = LS.get(key, []);
    list.push({ id: Date.now(), name, type: (document.getElementById('pl-type').value || '').trim(), next: (document.getElementById('pl-next').value || '').trim(), stage: 'To reach' });
    LS.set(key, list); renderPipeline(STATE.idx, slug);
  });
  document.querySelectorAll('.adv').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.getAttribute('data-id')); const list = LS.get(key, []); const l = list.find((x) => x.id === id);
    if (l) { const i = PIPE_STAGES.indexOf(l.stage); l.stage = PIPE_STAGES[Math.min(i + 1, PIPE_STAGES.length - 1)]; LS.set(key, list); renderPipeline(STATE.idx, slug); }
  }));
  document.querySelectorAll('.del').forEach((b) => b.addEventListener('click', () => {
    const id = Number(b.getAttribute('data-id')); LS.set(key, LS.get(key, []).filter((x) => x.id !== id)); renderPipeline(STATE.idx, slug);
  }));
  document.title = 'Pipeline · ' + v.short; window.scrollTo(0, 0);
}

/* --- Library: the OS knowledge shelf (summoned, not daily) --- */
function tile(d) {
  return `<a class="tile" href="#/doc/${encodeURIComponent(d.path)}" style="--dc:var(--${d.accent || 'primary'})"><div class="tn">${esc((d.category || '').toUpperCase())} ${ic('arrow')}</div><div class="tt">${esc(d.title)}</div>${d.desc ? `<div class="td">${esc(d.desc)}</div>` : ''}<div class="go">Open ${ic('arrow')}</div></a>`;
}
async function renderKnowledge(idx) {
  const nav = idx.nav || [], groups = {};
  nav.forEach((d) => { const c = d.category || 'Reference'; (groups[c] = groups[c] || []).push(d); });
  const order = [...CATEGORY_ORDER.filter((c) => groups[c]), ...Object.keys(groups).filter((c) => !CATEGORY_ORDER.includes(c))];
  const sections = order.map((c) => `<section><div class="sec-head"><p class="eyebrow">${ic(CATEGORY_ICON[c] || 'book')} ${esc(c)}</p><h2>${esc(c)}</h2></div><article class="card"><div class="cardgrid">${groups[c].map(tile).join('')}</div></article></section>`).join('');
  app().innerHTML = `<header class="hero"><p class="eyebrow">${ic('book')} Library</p><h1>The thinking behind Venture OS</h1><p class="lede">Doctrine and system specs. Venture playbooks live inside each venture’s workspace.</p></header>${sections}`;
  document.title = 'Library · Venture OS'; window.scrollTo(0, 0);
}
async function renderDoc(idx, path) {
  app().innerHTML = `<article class="card"><p class="lead">${ic('clock')} Opening &hellip;</p></article>`;
  const back = (function () {
    const sl = slugFromPath(path); const v = sl && ventureBySlug(idx, sl);
    return v ? `<a href="#/v/${esc(sl)}">${ic('arrow')}<span class="dir">Back to</span><span class="ttl">${esc(v.short)}</span></a>` : `<a href="#/">${ic('grid')}<span class="dir">Back to</span><span class="ttl">HQ</span></a>`;
  })();
  try {
    const r = await fetch(path, { cache: 'no-cache' }); if (!r.ok) throw 0; const md = await r.text();
    app().innerHTML = `<div class="pagenav">${back}<a href="#/knowledge">${ic('book')}<span class="dir">Open</span><span class="ttl">Library</span></a></div><article class="card"><div class="doc-body">${mdBlock(md)}</div></article><div class="pagenav">${back}</div>`;
    document.title = 'Venture OS'; window.scrollTo(0, 0);
  } catch (e) { app().innerHTML = `<article class="card"><div class="note note--warn">${ic('warn')}<span>That page isn’t available.</span></div></article>`; }
}

function setActiveNav(name) { document.querySelectorAll('.topbar .nav a[data-nav]').forEach((a) => a.classList.toggle('active', a.getAttribute('data-nav') === name)); }
async function route() {
  const h = location.hash || '#/'; const idx = await loadIndex();
  if (h.startsWith('#/doc/')) { await renderDoc(idx, decodeURIComponent(h.slice('#/doc/'.length))); setActiveNav(null); }
  else if (h.startsWith('#/v/')) {
    const rest = h.slice('#/v/'.length); const parts = rest.split('/'); const slug = decodeURIComponent(parts[0]);
    if (parts[1] === 'pipeline') renderPipeline(idx, slug);
    else if (parts[1] === 'learn') { if (parts[2]) await renderTrack(idx, slug, decodeURIComponent(parts[2])); else await renderSkills(idx, slug); }
    else await renderWorkspace(idx, slug);
    setActiveNav(null);
  }
  else if (h.startsWith('#/knowledge')) { await renderKnowledge(idx); setActiveNav('library'); }
  else { await renderHQ(idx); setActiveNav('hq'); }
}
window.addEventListener('hashchange', route);
function showUpdate() { if (document.getElementById('vos-update')) return; const b = document.createElement('div'); b.id = 'vos-update'; b.className = 'note note--you'; b.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:100;max-width:560px;margin:0 auto;cursor:pointer;box-shadow:var(--shadow)'; b.innerHTML = '<svg class="ic"><use href="#i-info"/></svg><span><b>Update available.</b> Tap to refresh.</span>'; b.onclick = () => location.reload(); document.body.appendChild(b); }
if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').then((reg) => { reg.addEventListener('updatefound', () => { const nw = reg.installing; if (nw) nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate(); }); }); }).catch(() => {}); }); }
migrate();
route();
