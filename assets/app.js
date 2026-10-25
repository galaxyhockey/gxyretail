/* ============================================================
   app.js — router, auth gate, and everything that renders.
   One deep program: units are
   full reading pages, labs mount inside them, every quiz question
   feeds the daily question, and the field notebook keeps what you
   saw in real stores.
   ============================================================ */
import { boot, state, signInGoogle, signInEmail, signOutNow, load, save, saveSoon } from './store.js';
import { COURSES, STAGES } from './content/index.js';
import { SRC, SRC_GROUPS } from './content/sources.js';
import { LABS, labById } from './labs.js';
import { mountKit, defaultKit } from './fieldkit.js';
import { initPWA } from './pwa.js';
import { HOME, ALLOWED_UIDS } from './config.js';

window.__endcapBooted = true;   // the boot check in index.html watches for this

const $   = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const key = (c,n) => `${c}:${n}`;
const cssId = k => k.replace(/[^\w]/g,'-');
const dayNum = (t=Date.now()) => { const d=new Date(t); return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/86400000); };
const dayStr = (t=Date.now()) => { const d=new Date(t); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const strDay = s => { const [y,m,d]=s.split('-').map(Number); return Math.floor(Date.UTC(y,m-1,d)/86400000); };
const hash = s => { let h=2166136261; for(const ch of s){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return h>>>0; };

let PROGRESS = {};   // { "r101:1.1": true }
let OPENED   = {};   // { "r101:1.1": firstOpenedTs }
let NOTES    = {};   // { "r101:1.1": "text" }
let SRS      = {};   // { cardId: {box, due} }
let DAILY    = { log:{}, miss:{} };
let QUIZ     = {};   // { "r101": {best, last}, "r101:1.1": {best,last} }
let ASSIGN   = {};   // { "r101": {ans:{i:v}, done:{i:bool}, best, ts} }
let FIELD    = { drafts:{}, reports:[] };
let NOTEBOOK = [];   // [{t, b, tag, ts}]
let KIT      = defaultKit();
let PREFS    = { vocab:true, pool:'met' };
let LAST     = null;

/* ---------- indexes over the content ---------- */
const UNITS = [];                         // flat, in program order
COURSES.forEach(c => c.units.forEach(u => UNITS.push({ c, u, k:key(c.id,u.n) })));
const UNIT = Object.fromEntries(UNITS.map(x => [x.k, x]));
const COURSE = Object.fromEntries(COURSES.map(c => [c.id, c]));

/* Every multiple-choice item in the program, for the daily question. */
const QBANK = [];
COURSES.forEach(c => {
  c.units.forEach(u => u.qs.forEach((q,i) => QBANK.push({ id:`${key(c.id,u.n)}#${i}`, q:q[0], o:q[1], a:q[2], why:q[3], cid:c.id, uk:key(c.id,u.n), tag:`${c.code} · ${u.n} ${u.title}`, color:c.color })));
  c.quiz.forEach((q,i) => QBANK.push({ id:`${c.id}#q${i}`, q:q[0], o:q[1], a:q[2], why:q[3], cid:c.id, uk:null, tag:`${c.code} · course review`, color:c.color }));
});
const QB = Object.fromEntries(QBANK.map(q => [q.id, q]));

const met = k => !!(OPENED[k] || PROGRESS[k]);
const courseMet = cid => COURSE[cid].units.some(u => met(key(cid,u.n)));
const courseDone = c => c.units.filter(u => PROGRESS[key(c.id,u.n)]).length;
const srcLink = k => { const s=SRC[k]; return s ? `<a href="${esc(s.u)}" target="_blank" rel="noopener">${esc(s.t)}</a>` : ''; };

/* ============================================================
   AUTH GATE
   ============================================================ */
boot(async (res) => {
  if(res.denied){
    $('gate-msg').innerHTML =
      `This account is not on the allowlist.<br>Signed in as ${esc(res.email||'')}<br>` +
      `UID <b>${esc(res.uid)}</b><br>Add that UID to ALLOWED_UIDS in assets/config.js and to firestore.rules, then redeploy.`;
    return;
  }
  if(!res.signedIn){ $('gate').classList.remove('hide'); $('app').classList.add('hide'); return; }
  $('gate').classList.add('hide');
  $('app').classList.remove('hide');
  if(res.warn) console.warn(res.warn);
  await startApp();
});

$('gate-google').onclick = async () => { try { await signInGoogle(); } catch(e){ $('gate-msg').innerHTML = authHelp(e); } };
$('gate-emailbtn').onclick = async () => { try { await signInEmail($('gate-email').value.trim(), $('gate-pass').value); } catch(e){ $('gate-msg').innerHTML = authHelp(e); } };
$('gate-pass').addEventListener('keydown', e => { if(e.key==='Enter') $('gate-emailbtn').click(); });

function authHelp(err){
  const code = err?.code || '';
  if(code === 'auth/unauthorized-domain') return `<b>This address is not on Firebase’s authorised list.</b> Add <code>${esc(location.hostname)}</code> under Authentication → Settings → Authorised domains.`;
  if(code === 'auth/operation-not-allowed') return '<b>The Google sign-in provider is switched off.</b> Firebase console → Authentication → Sign-in method → Google → Enable.';
  if(code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return 'Sign-in window was closed before finishing. Try again.';
  if(code === 'auth/network-request-failed') return '<b>Could not reach Firebase.</b> Check your connection.';
  if(code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Email or password not recognised.';
  return `${esc(err?.message || String(err))}${code?` <code>(${esc(code)})</code>`:''}`;
}

/* ============================================================
   START
   ============================================================ */
async function startApp(){
  [PROGRESS, OPENED, NOTES, SRS, DAILY, QUIZ, ASSIGN, FIELD, NOTEBOOK, KIT, PREFS, LAST] = await Promise.all([
    load('progress', {}), load('opened', {}), load('notes', {}), load('srs', {}),
    load('daily', {log:{}, miss:{}}), load('quiz', {}), load('assign', {}),
    load('field', {drafts:{}, reports:[]}), load('notebook', []), load('kit', defaultKit()),
    load('prefs', {vocab:true, pool:'met'}), load('last', null)
  ]);
  DAILY.log ||= {}; DAILY.miss ||= {}; FIELD.drafts ||= {}; FIELD.reports ||= [];
  KIT = Object.assign(defaultKit(), KIT || {});

  $('mast-who').innerHTML = state.mode==='firebase'
    ? `Signed in as ${esc(state.user?.email || 'you')}<button id="hdr-out">Sign out</button>`
    : `Local-only mode — saved in this browser<button id="hdr-out" disabled>Sign out</button>`;
  const out = $('hdr-out'); if(out) out.onclick = () => signOutNow().then(()=>location.reload());

  $('nav').addEventListener('click', e => { const b = e.target.closest('button[data-v]'); if(b) go(b.dataset.v); });
  window.addEventListener('hashchange', route);
  document.addEventListener('click', e => {        // in-page anchors that should scroll, not route
    const a = e.target.closest('[data-scroll]'); if(!a) return;
    e.preventDefault(); document.getElementById(a.dataset.scroll)?.scrollIntoView({block:'start'});
  });

  buildSettings();
  initPWA();
  route();
}

/* ============================================================
   ROUTER — #view/arg/arg
   ============================================================ */
let VIEW = 'home', ARGS = [], kitStop = null;
const go = (...parts) => { const h = '#' + parts.filter(Boolean).join('/'); if(location.hash === h) route(); else location.hash = h; };

function route(){
  const parts = (location.hash || '#home').slice(1).split('/').map(decodeURIComponent);
  let v = parts[0] || 'home';
  if(!$('v-'+v)) v = 'home';
  VIEW = v; ARGS = parts.slice(1);
  if(kitStop){ kitStop(); kitStop = null; }
  document.querySelectorAll('.view').forEach(el => el.classList.toggle('on', el.id === 'v-'+v));
  document.body.classList.toggle('compact', v !== 'home');   // the full masthead only on the Console
  document.querySelectorAll('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.v===v));
  ({ home:renderHome, program:renderProgram, labs:renderLabs, field:renderField, reference:renderReference, settings:()=>{} })[v]();
  window.scrollTo({top:0, behavior:'instant'});
  buildRail();
}

function buildRail(){
  const view = $('v-'+VIEW);
  let html = '';
  const due = dueCards().length;
  const dq = DAILY.log[dayStr()];
  html += `<h3>Today</h3><ul>
    <li><a href="#home" class="${dq && dq.ok!=null?'done':'here'}">Daily question${dq && dq.ok!=null?' ✓':''}</a></li>
    <li><a href="#reference/review" class="${due?'here':''}">Review — ${due} due</a></li></ul>`;
  const secs = [...view.querySelectorAll('section[data-rail]')].filter(s => !s.closest('.hide'));
  if(secs.length) html += '<h3>On this page</h3><ul>' + secs.map(s => `<li><a href="#" data-scroll="${s.id}">${esc(s.dataset.rail)}</a></li>`).join('') + '</ul>';
  if(VIEW==='program' && ARGS[0] && COURSE[ARGS[0]]){
    const c = COURSE[ARGS[0]];
    html += `<h3>${c.code}</h3><ol>` + c.units.map(u => { const k=key(c.id,u.n);
      return `<li><a href="#program/${c.id}/${u.n}" class="${PROGRESS[k]?'done':''} ${ARGS[1]===u.n?'here':''}">${u.n} · ${esc(u.title)}</a></li>`; }).join('') + '</ol>';
  } else {
    html += '<h3>The program</h3><ol>' + COURSES.map(c => { const d=courseDone(c);
      return `<li><a href="#program/${c.id}" class="${d===c.units.length?'done':''}">${c.code} · ${d}/${c.units.length}</a></li>`; }).join('') + '</ol>';
  }
  $('rail-body').innerHTML = html;
  const total = UNITS.length, done = UNITS.filter(x => PROGRESS[x.k]).length;
  $('barfill').style.width = (done/total*100)+'%';
  $('bartext').textContent = `${done} / ${total} units`;
}

/* ============================================================
   CONSOLE
   ============================================================ */
function renderHome(){
  renderDaily();
  renderToday();
  renderTranscript();
}

/* ---------- the daily question ----------
   One question a day, chosen from the units you have opened, stable
   for the whole day on every device. Miss it and it comes back in two
   days; miss the retry and it comes back in three. A short bonus round
   is always available but does not count toward the streak.          */
function dailyPool(){
  let pool = PREFS.pool === 'all' ? QBANK : QBANK.filter(q => q.uk ? met(q.uk) : courseMet(q.cid));
  if(pool.length < 8) pool = QBANK.filter(q => q.cid === COURSES[0].id || (q.uk ? met(q.uk) : courseMet(q.cid)));
  return pool;
}
function pickDaily(){
  const d = dayStr(), today = dayNum();
  const have = DAILY.log[d];
  if(have && QB[have.id]) return have;
  const retry = Object.entries(DAILY.miss).filter(([id,due]) => due <= today && QB[id]).sort((a,b) => a[1]-b[1])[0];
  let id, why = 'new';
  if(retry){ id = retry[0]; why = 'retry'; }
  else {
    const pool = dailyPool();
    const recent = new Set(Object.entries(DAILY.log).filter(([s]) => today - strDay(s) < 30).map(([,r]) => r.id));
    const cand = pool.filter(q => !recent.has(q.id));
    const list = cand.length ? cand : pool;
    id = list[hash(d) % list.length].id;
  }
  DAILY.log[d] = { id, why, ok:null };
  save('daily', DAILY);
  return DAILY.log[d];
}
const daysAgo = i => { const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-i); return d.getTime(); };
function streak(){
  let s = 0, i = DAILY.log[dayStr()]?.ok != null ? 0 : 1;   // today not answered yet: count from yesterday
  for(;; i++){ const e = DAILY.log[dayStr(daysAgo(i))]; if(e && e.ok != null) s++; else break; }
  return s;
}
function renderDaily(){
  const entry = pickDaily(), q = QB[entry.id], answered = entry.ok != null;
  const strip = [];
  for(let i=13;i>=0;i--){ const t = daysAgo(i), e = DAILY.log[dayStr(t)];
    strip.push(`<i class="${e?.ok===true?'ok':e?.ok===false?'no':''}" title="${dayStr(t)}${e?.ok===true?' — right':e?.ok===false?' — missed':''}"></i>`); }
  const answeredDays = Object.values(DAILY.log).filter(e => e.ok != null);
  const acc = answeredDays.length ? answeredDays.filter(e => e.ok).length / answeredDays.length : null;
  $('s-daily').innerHTML = `
    <div class="daily" style="--c:${q.color}">
      <div class="daily-head">
        <span class="k">Question of the day · ${new Date().toLocaleDateString([], {weekday:'long', month:'long', day:'numeric'})}${entry.why==='retry'?' · <b class="retry">back for another try</b>':''}</span>
        <span class="daily-stats"><b>${streak()}</b> day streak${acc!=null?` · ${Math.round(acc*100)}% right over ${answeredDays.length} day${answeredDays.length===1?'':'s'}`:''}</span>
      </div>
      <div class="daily-strip" aria-label="last 14 days">${strip.join('')}</div>
      <p class="daily-tag">${esc(q.tag)}</p>
      <h3>${q.q}</h3>
      <div class="daily-opts">${q.o.map((o,i) => `<button class="opt ${answered ? (i===q.a?'right':(i===entry.choice?'wrong':'')) : ''}" data-i="${i}" ${answered?'disabled':''}>${o}</button>`).join('')}</div>
      <div id="daily-why">${answered ? dailyWhy(q, entry.ok) : ''}</div>
    </div>`;
  if(!answered) $('s-daily').querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const i = +b.dataset.i, ok = i === q.a, today = dayNum();
    entry.ok = ok; entry.choice = i; entry.ts = Date.now();
    if(ok) delete DAILY.miss[q.id];
    else DAILY.miss[q.id] = today + (entry.why === 'retry' ? 3 : 2);
    save('daily', DAILY);
    renderDaily(); buildRail();
  });
  bindDailyExtras(q);
}
function dailyWhy(q, ok){
  return `<div class="daily-ans ${ok?'ok':'no'}"><b>${ok?'Right.':'Not quite.'}</b> ${q.why}
    ${ok?'':'<span class="fine"> This one will come back in a couple of days.</span>'}</div>
    <div class="daily-more">
      ${q.uk ? `<a class="btn ghost" href="#program/${q.cid}/${UNIT[q.uk].u.n}">Reread unit ${UNIT[q.uk].u.n}</a>` : `<a class="btn ghost" href="#program/${q.cid}">Open ${COURSE[q.cid].code}</a>`}
      <button class="btn ghost" id="daily-bonus">Bonus question</button>
      <button class="btn ghost" id="daily-keep">Keep in notebook</button></div>
    <div id="daily-bonus-box"></div>`;
}
function bindDailyExtras(q){
  const keep = $('daily-keep');
  if(keep) keep.onclick = () => { addNote(`Daily question: ${stripTags(q.q)}`, `Answer: ${stripTags(q.o[q.a])}\n${stripTags(q.why)}`, 'Daily question'); keep.textContent = 'Kept'; keep.disabled = true; };
  const bonus = $('daily-bonus');
  if(bonus) bonus.onclick = () => bonusRound($('daily-bonus-box'), q.id);
}
function bonusRound(box, avoid){
  const pool = dailyPool().filter(x => x.id !== avoid);
  const missed = pool.filter(x => DAILY.miss[x.id]);
  const list = missed.length && Math.random() < 0.5 ? missed : pool;
  const q = list[Math.floor(Math.random()*list.length)];
  box.innerHTML = `<div class="bonus"><p class="daily-tag">Bonus · ${esc(q.tag)}</p><p class="qt">${q.q}</p>
    <div class="daily-opts">${q.o.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}</div><div class="bwhy"></div></div>`;
  box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
    const i=+b.dataset.i, ok=i===q.a;
    box.querySelectorAll('.opt').forEach((x,j) => { x.disabled=true; if(j===q.a) x.classList.add('right'); else if(j===i) x.classList.add('wrong'); });
    if(!ok && !DAILY.miss[q.id]){ DAILY.miss[q.id] = dayNum()+2; save('daily', DAILY); }
    box.querySelector('.bwhy').innerHTML = `<div class="daily-ans ${ok?'ok':'no'}"><b>${ok?'Right.':'Not quite.'}</b> ${q.why}</div>
      <button class="btn ghost" id="bonus-next">Another</button>`;
    box.querySelector('#bonus-next').onclick = () => bonusRound(box, q.id);
  });
}
const stripTags = s => String(s).replace(/<[^>]+>/g,'');

function renderToday(){
  // Continue: next incomplete unit, preferring the course last touched.
  const lastC = LAST ? LAST.split(':')[0] : null;
  const order = lastC ? [COURSE[lastC], ...COURSES] : COURSES;
  let next = null;
  for(const c of order){ if(!c) continue; const u = c.units.find(u => !PROGRESS[key(c.id,u.n)]); if(u){ next = {c,u}; break; } }
  const due = dueCards().length;
  const fieldNext = COURSES.map(c => c.field).find(f => !FIELD.reports.some(r => r.aid === f.id));
  const cards = [];
  cards.push(next
    ? `<a href="#program/${next.c.id}/${next.u.n}"><span class="c" style="color:${next.c.color}">Continue · ${next.c.code}</span><h4>${next.u.n} · ${esc(next.u.title)}</h4><p>${esc(next.u.sub)}</p></a>`
    : `<a href="#program"><span class="c" style="color:var(--green)">All ${UNITS.length} units complete</span><h4>Revisit anything — and keep reviewing</h4></a>`);
  cards.push(`<a href="#reference/review"><span class="c">${due?`Review · ${due} card${due>1?'s':''} due`:'Review · all caught up'}</span><h4>${due?'Ten minutes keeps it from fading':'Nothing due right now'}</h4><p>Check questions and vocabulary from the units you have opened.</p></a>`);
  if(fieldNext) cards.push(`<a href="#field/${fieldNext.id}"><span class="c" style="color:var(--magenta)">Next field assignment</span><h4>${esc(fieldNext.title)}</h4><p>${esc(fieldNext.where)}</p></a>`);
  $('s-today-cards').innerHTML = cards.join('');
}

function renderTranscript(){
  const totalU = UNITS.length, doneU = UNITS.filter(x => PROGRESS[x.k]).length;
  const filed = new Set(FIELD.reports.map(r => r.aid)).size;
  const mastered = Object.values(SRS).filter(s => s.box >= 4).length;
  $('s-stats').innerHTML = `
    <div class="tiles">
      <div class="tile"><dt>Units complete</dt><dd>${doneU}<small> / ${totalU}</small></dd></div>
      <div class="tile"><dt>Daily streak</dt><dd>${streak()}<small> day${streak()===1?'':'s'}</small></dd></div>
      <div class="tile"><dt>Field reports filed</dt><dd>${filed}<small> / ${COURSES.length}</small></dd></div>
      <div class="tile"><dt>Cards in long-term boxes</dt><dd>${mastered}</dd></div>
    </div>`;
  $('s-transcript-body').innerHTML = `<div class="scroller"><table class="transcript">
    <tr><th>Course</th><th>Units</th><th>Unit checks</th><th>Course quiz</th><th>Assignment</th><th>Field</th></tr>
    ${COURSES.map(c => {
      const d = courseDone(c), t = c.units.length;
      const uq = c.units.map(u => QUIZ[key(c.id,u.n)]).filter(Boolean);
      const uqs = uq.length ? Math.round(uq.reduce((a,x)=>a+x.best,0)/uq.length*100)+'%' : '—';
      const cq = QUIZ[c.id] ? Math.round(QUIZ[c.id].best*100)+'%' : '—';
      const as = ASSIGN[c.id]?.best != null ? Math.round(ASSIGN[c.id].best*100)+'%' : '—';
      const f = FIELD.reports.some(r => r.aid === c.field.id) ? '✓ filed' : (FIELD.drafts[c.field.id] ? 'draft' : '—');
      return `<tr><td><a href="#program/${c.id}"><b style="color:${c.color}">${c.code}</b> ${esc(c.title)}</a></td>
        <td><span class="minibar inline"><i style="width:${d/t*100}%"></i></span> ${d}/${t}</td><td class="n">${uqs}</td><td class="n">${cq}</td><td class="n">${as}</td><td>${f}</td></tr>`;
    }).join('')}</table></div>`;
}

/* ============================================================
   PROGRAM — catalogue, course, unit
   ============================================================ */
function renderProgram(){
  const [cid, n] = ARGS;
  $('prog-cat').classList.toggle('hide', !!cid);
  $('prog-course').classList.toggle('hide', !cid || !!n);
  $('prog-unit').classList.toggle('hide', !n);
  if(!cid || !COURSE[cid]) return renderCatalogue();
  if(!n) return renderCourse(COURSE[cid]);
  const x = UNIT[key(cid,n)];
  if(!x) return go('program', cid);
  renderUnit(x);
}

function renderCatalogue(){
  $('prog-cat').classList.remove('hide'); $('prog-course').classList.add('hide'); $('prog-unit').classList.add('hide');
  $('catalogue').innerHTML = STAGES.map((s,i) => `
    <div class="stage"><div class="stage-h"><span class="eyebrow">Stage ${i+1}</span><h3>${esc(s.t)}</h3><p>${esc(s.sub)}</p></div>
    <div class="catalogue">${s.ids.map(id => { const c=COURSE[id], d=courseDone(c), t=c.units.length;
      return `<a class="course-card" href="#program/${c.id}">
        <span class="band" style="background:${c.color}"></span>
        <span class="inner"><span class="code">${c.code} · ${t} units</span><h3>${esc(c.title)}</h3><p>${esc(c.blurb)}</p>
        <span class="meta"><span>${d===t?'Complete':d?'In progress':'Not started'}</span><b>${d} / ${t}</b></span>
        <span class="minibar"><i style="width:${d/t*100}%"></i></span></span></a>`; }).join('')}</div></div>`).join('');
}

function renderCourse(c){
  const i = COURSES.indexOf(c);
  $('cd-head').innerHTML = `
    <a class="btn ghost" href="#program">← The program</a>
    <div class="cd-head"><span class="code">${c.code} · ${c.units.length} units · course ${i+1} of ${COURSES.length}</span>
    <h2 style="color:${c.color}">${esc(c.title)}</h2><p>${esc(c.blurb)}</p></div>`;
  $('cd-units').innerHTML = c.units.map(u => { const k = key(c.id,u.n);
    return `<a class="unit-row" href="#program/${c.id}/${u.n}" data-done="${!!PROGRESS[k]}">
      <span class="num" style="color:${c.color}">${u.n}</span>
      <span class="ttl">${esc(u.title)}<small>${esc(u.sub)}</small></span>
      <span class="tags">${u.lab?'<em>lab</em>':''}${u.kase?.kind==='fact'?'<em>case</em>':''}${u.math?'<em>math</em>':''}</span>
      <span class="mark">${PROGRESS[k]?'✓ done':met(k)?'opened':'—'}</span></a>`; }).join('');
  const labs = [...new Set(c.units.flatMap(u => [].concat(u.lab||[])))].map(labById).filter(Boolean);
  $('cd-tools').innerHTML = `
    <div class="tool-grid">
      <a class="tool" href="#program/${c.id}" data-scroll="cd-assign-sec"><span class="k">Assignment</span><b>${esc(c.assign.title)}</b>
        <span>${ASSIGN[c.id]?.best!=null?`Best score ${Math.round(ASSIGN[c.id].best*100)}%`:'Not attempted'}</span></a>
      <a class="tool" href="#field/${c.field.id}"><span class="k">Field assignment</span><b>${esc(c.field.title)}</b>
        <span>${FIELD.reports.some(r=>r.aid===c.field.id)?'Filed ✓':FIELD.drafts[c.field.id]?'Draft saved':'Not started'}</span></a>
      ${labs.map(l => `<a class="tool" href="#labs/${l.id}"><span class="k">Lab</span><b>${esc(l.title)}</b><span>${esc(l.blurb)}</span></a>`).join('')}
    </div>`;
  renderAssignment(c);
  renderMCQ($('cd-quiz'), c.quiz, c.id, 'Course review');
}

function renderUnit(x){
  const { c, u, k } = x;
  if(!OPENED[k]){ OPENED[k] = Date.now(); save('opened', OPENED); }
  LAST = k; save('last', k);
  const idx = c.units.indexOf(u);
  const prev = c.units[idx-1] ? {c, u:c.units[idx-1]} : (COURSES[COURSES.indexOf(c)-1] ? {c:COURSES[COURSES.indexOf(c)-1], u:COURSES[COURSES.indexOf(c)-1].units.at(-1)} : null);
  const next = c.units[idx+1] ? {c, u:c.units[idx+1]} : (COURSES[COURSES.indexOf(c)+1] ? {c:COURSES[COURSES.indexOf(c)+1], u:COURSES[COURSES.indexOf(c)+1].units[0]} : null);
  const labs = [].concat(u.lab||[]).map(labById).filter(Boolean);
  const kase = u.kase;
  $('prog-unit').innerHTML = `
    <div class="crumbs"><a href="#program">Program</a> / <a href="#program/${c.id}">${c.code} ${esc(c.title)}</a> / Unit ${u.n}</div>
    <article class="lesson" style="--c:${c.color}">
      <header class="lesson-h"><span class="code">${c.code} · Unit ${u.n}</span><h2>${esc(u.title)}</h2><p class="sub">${esc(u.sub)}</p>
        <p class="goal"><b>By the end you can</b> ${u.goal}</p></header>

      <section id="ls-read" data-rail="The lesson" class="lesson-body">${u.body.map(p => `<p>${p}</p>`).join('')}</section>

      <aside class="ask"><span class="k">In the store, ask</span><p>${u.ask}</p></aside>

      <section id="ls-terms" data-rail="Key terms"><h3 class="sub">Key terms</h3>
        <dl class="terms">${u.terms.map(t => `<div><dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd></div>`).join('')}</dl></section>

      ${u.math ? `<section id="ls-math" data-rail="The math"><h3 class="sub">The math: ${esc(u.math.h)}</h3>
        <div class="formulas">${u.math.f.map(f => `<div class="fx"><code>${esc(f[0])}</code><span>${esc(f[1])}</span></div>`).join('')}</div>
        <div class="worked"><b>Worked numbers.</b> ${u.math.b}</div></section>` : ''}

      ${kase ? `<section id="ls-case" data-rail="${kase.kind==='fact'?'Case study':'Example'}"><h3 class="sub">${kase.kind==='fact'?'Case study':'Worked scenario'}</h3>
        <div class="case ${kase.kind}"><span class="badge-k">${kase.kind==='fact'?'Factual case — sourced':'Hypothetical — invented for teaching'}</span>
        <h4>${esc(kase.h)}</h4><p>${kase.b}</p>
        ${kase.src?.length ? `<p class="src">Sources: ${kase.src.map(srcLink).join(' · ')}</p>` : ''}</div></section>` : ''}

      ${labs.length ? `<section id="ls-lab" data-rail="Lab"><h3 class="sub">Lab</h3>${labs.map(l => `
        <div class="lab-card"><div class="lab-h"><b>${esc(l.title)}</b><span>${esc(l.blurb)}</span></div><div class="lab-mount" data-lab="${l.id}"></div></div>`).join('')}</section>` : ''}

      <section id="ls-field" data-rail="In the field"><h3 class="sub">In the field</h3>
        <div class="fieldbox"><span class="k">Observation</span><p>${u.field}</p>
        <textarea id="ls-obs" placeholder="What did you see? Which store, when? (saved to your field notebook)"></textarea>
        <button class="btn" id="ls-obs-save">File to notebook</button> <span class="ok" id="ls-obs-ok"></span></div></section>

      <section id="ls-check" data-rail="Check yourself"><h3 class="sub">Check yourself</h3>
        <div class="check"><b>${u.check.q}</b><p class="fine">Answer it in your head (or in your notes) before you look.</p>
          <button type="button" id="ls-show">Show answer</button><div class="ans">${u.check.a}</div></div>
        <h3 class="sub">Quick quiz</h3><div id="ls-quiz"></div></section>

      <section id="ls-readings" data-rail="Read further"><h3 class="sub">Read further</h3>
        <ul class="readings">${u.read.map(r => SRC[r] ? `<li>${srcLink(r)} <span>— ${esc(SRC[r].by)}${SRC[r].open?'':' · <i>may require access</i>'}</span></li>` : '').join('')}</ul></section>

      <section id="ls-notes" data-rail="Your notes"><h3 class="sub">Your notes</h3>
        <textarea class="note-area" id="ls-note" placeholder="What clicked, what didn’t, what you want to chase down in a store">${esc(NOTES[k]||'')}</textarea>
        <button class="done-btn" id="ls-done">${PROGRESS[k]?'Completed — click to undo':'Mark unit complete'}</button></section>
    </article>
    <nav class="pager">
      ${prev?`<a href="#program/${prev.c.id}/${prev.u.n}">← ${prev.u.n} ${esc(prev.u.title)}</a>`:'<span></span>'}
      ${next?`<a href="#program/${next.c.id}/${next.u.n}">${next.u.n} ${esc(next.u.title)} →</a>`:'<span></span>'}
    </nav>`;
  $('prog-unit').querySelectorAll('.lab-mount').forEach(m => labById(m.dataset.lab).mount(m));
  $('ls-show').onclick = e => e.target.closest('.check').classList.add('open');
  $('ls-note').addEventListener('input', e => { NOTES[k] = e.target.value; saveSoon('notes', NOTES); });
  $('ls-done').onclick = () => {
    PROGRESS[k] = !PROGRESS[k]; save('progress', PROGRESS);
    $('ls-done').textContent = PROGRESS[k] ? 'Completed — click to undo' : 'Mark unit complete';
    buildRail();
  };
  $('ls-obs-save').onclick = () => {
    const t = $('ls-obs').value.trim(); if(!t) return;
    addNote(`${c.code} ${u.n} — ${u.title}`, `Prompt: ${stripTags(u.field)}\n\n${t}`, 'Observation');
    $('ls-obs').value = ''; $('ls-obs-ok').textContent = 'Filed to your notebook.'; setTimeout(()=>$('ls-obs-ok').textContent='', 2500);
  };
  renderMCQ($('ls-quiz'), u.qs, k, 'Unit');
}

/* ---------- multiple-choice (unit quiz and course review) ---------- */
function renderMCQ(el, bank, qkey, label){
  el.innerHTML = bank.map((q,i) => `<div class="q" data-i="${i}"><p class="qt">${i+1}. ${q[0]}</p>
    ${q[1].map((o,j) => `<label><input type="radio" name="q-${cssId(qkey)}-${i}" value="${j}">${o}</label>`).join('')}
    <div class="why">${q[3]}</div></div>`).join('') +
    `<div class="quiz-foot"><button class="btn" data-g>Grade</button><button class="btn ghost" data-r>Reset</button>
     <span class="score"></span><span class="fine">${QUIZ[qkey]?`Best so far: ${Math.round(QUIZ[qkey].best*100)}%`:''}</span></div>`;
  el.querySelector('[data-g]').onclick = () => {
    let s = 0;
    bank.forEach((q,i) => {
      const box = el.querySelector(`.q[data-i="${i}"]`); box.classList.add('graded');
      box.querySelectorAll('label').forEach((L,j) => { const inp=L.querySelector('input'); L.classList.remove('right','wrong');
        if(j===q[2]) L.classList.add('right'); if(inp.checked && j!==q[2]) L.classList.add('wrong'); if(inp.checked && j===q[2]) s++; });
    });
    const r = s/bank.length, sc = el.querySelector('.score');
    sc.textContent = `${s} / ${bank.length}`;
    sc.style.color = r>=1 ? 'var(--green)' : r>=0.6 ? 'var(--amber)' : 'var(--red)';
    QUIZ[qkey] = { best: Math.max(r, QUIZ[qkey]?.best||0), last:r, ts:Date.now() }; save('quiz', QUIZ);
    // Missed questions feed the daily retry queue.
    bank.forEach((q,i) => {
      const id = qkey.includes(':') ? `${qkey}#${i}` : `${qkey}#q${i}`;
      const chosen = el.querySelector(`.q[data-i="${i}"] input:checked`);
      if(chosen && +chosen.value !== q[2] && QB[id] && !DAILY.miss[id]) DAILY.miss[id] = dayNum()+2;
    });
    save('daily', DAILY);
  };
  el.querySelector('[data-r]').onclick = () => renderMCQ(el, bank, qkey, label);
}

/* ---------- assignments ---------- */
function renderAssignment(c){
  const A = c.assign, S = ASSIGN[c.id] || { ans:{}, done:{} };
  $('cd-assign').innerHTML = `<h3 class="sub" style="border:0;margin-top:0;padding-top:0">${esc(A.title)}</h3><div class="brief">${A.brief}</div>
    ${A.items.map((it,i) => `<div class="ai" data-i="${i}"><p class="qt">${i+1}. ${it.q}</p>${
      it.t==='num' ? `<div class="ai-row"><input type="number" step="any" inputmode="decimal" value="${esc(S.ans[i]??'')}" placeholder="answer"><span class="unit">${esc(it.unit||'')}</span><button class="btn ghost" data-chk>Check</button></div><div class="ai-fb"></div>` :
      it.t==='mc' ? `${it.o.map((o,j)=>`<label class="ai-opt"><input type="radio" name="as-${c.id}-${i}" value="${j}" ${S.ans[i]==j?'checked':''}>${o}</label>`).join('')}<button class="btn ghost" data-chk>Check</button><div class="ai-fb"></div>` :
      `<textarea placeholder="Write your answer before you compare.">${esc(S.ans[i]??'')}</textarea><button class="btn ghost" data-chk>Compare with a model answer</button><div class="ai-fb"></div>`
    }</div>`).join('')}
    <div class="quiz-foot"><button class="btn" id="as-grade">Check all & save score</button><span class="score" id="as-score"></span>
      <span class="fine">${S.best!=null?`Best so far: ${Math.round(S.best*100)}% of auto-checked items`:''}</span></div>`;
  const box = $('cd-assign');
  const check = (i, reveal=false) => {
    const it = A.items[i], el = box.querySelector(`.ai[data-i="${i}"]`), fb = el.querySelector('.ai-fb');
    let ok = null, v;
    if(it.t==='num'){ v = el.querySelector('input').value; const x = parseFloat(v);
      ok = isFinite(x) && Math.abs(x - it.a) <= Math.max(it.tol ?? 0, 1e-9) + 1e-9; }
    else if(it.t==='mc'){ const r = el.querySelector('input:checked'); v = r ? +r.value : null; ok = v === it.a; }
    else { v = el.querySelector('textarea').value; }
    S.ans[i] = v;
    const empty = v === '' || v == null;
    if(it.t==='text') fb.innerHTML = empty && !reveal ? '<div class="daily-ans no">Write your answer first — comparing is the point.</div>' : `<div class="model"><b>Model answer.</b> ${it.model}</div>`;
    else if(ok || reveal) fb.innerHTML = `<div class="daily-ans ${ok?'ok':'no'}"><b>${ok?'Correct.':'Worked solution.'}</b> ${it.why}</div>`;
    else fb.innerHTML = `<div class="daily-ans no"><b>${empty?'Enter an answer first.':'Not yet.'}</b> ${empty?'':'Write the formula out, check your units, and try again.'} <button class="linkish" data-sol>Show worked solution</button></div>`;
    fb.querySelector('[data-sol]')?.addEventListener('click', () => check(i, true));
    return ok;
  };
  box.querySelectorAll('[data-chk]').forEach(b => b.onclick = () => { const i = +b.closest('.ai').dataset.i; check(i); ASSIGN[c.id] = S; save('assign', ASSIGN); });
  box.querySelectorAll('textarea').forEach(t => t.addEventListener('input', () => { const i=+t.closest('.ai').dataset.i; S.ans[i]=t.value; ASSIGN[c.id]=S; saveSoon('assign', ASSIGN); }));
  $('as-grade').onclick = () => {
    let right = 0, n = 0;
    A.items.forEach((it,i) => { const ok = check(i, true); if(it.t!=='text'){ n++; if(ok) right++; } });
    const r = n ? right/n : 0;
    S.best = Math.max(r, S.best ?? 0); S.last = r; S.ts = Date.now();
    ASSIGN[c.id] = S; save('assign', ASSIGN);
    $('as-score').textContent = n ? `${right} / ${n} auto-checked` : 'Saved';
    $('as-score').style.color = r>=1 ? 'var(--green)' : r>=0.6 ? 'var(--amber)' : 'var(--red)';
  };
}

/* ============================================================
   LABS
   ============================================================ */
function renderLabs(){
  const id = ARGS[0], lab = id && labById(id);
  $('labs-index').classList.toggle('hide', !!lab);
  $('labs-one').classList.toggle('hide', !lab);
  if(!lab){
    $('labs-grid').innerHTML = COURSES.map(c => {
      const ls = LABS.filter(l => l.course === c.id); if(!ls.length) return '';
      return `<div class="lab-group"><h3 class="sub"><span style="color:${c.color}">${c.code}</span> ${esc(c.title)}</h3>
        <div class="linkgrid">${ls.map(l => `<a href="#labs/${l.id}"><b>${esc(l.title)}</b><span>${esc(l.blurb)}</span></a>`).join('')}</div></div>`;
    }).join('');
    return;
  }
  const used = UNITS.filter(x => [].concat(x.u.lab||[]).includes(lab.id));
  $('labs-one').innerHTML = `<a class="btn ghost" href="#labs">← All labs</a>
    <section id="lab-sec" data-rail="${esc(lab.title)}"><h2 style="margin-top:14px">${esc(lab.title)}</h2><p class="lede-2">${esc(lab.blurb)}</p>
    <div class="lab-card"><div class="lab-mount" id="lab-mount"></div></div>
    ${used.length ? `<p class="fine">Taught in ${used.map(x => `<a href="#program/${x.c.id}/${x.u.n}">${x.c.code} ${x.u.n} ${esc(x.u.title)}</a>`).join(' · ')}</p>` : ''}</section>`;
  lab.mount($('lab-mount'));
}

/* ============================================================
   FIELD — assignments, kit, notebook
   ============================================================ */
function renderField(){
  const id = ARGS[0];
  const fa = COURSES.map(c => ({ c, f:c.field })).find(x => x.f.id === id);
  $('field-index').classList.toggle('hide', !!fa);
  $('field-one').classList.toggle('hide', !fa);
  if(fa) return renderFieldAssignment(fa.c, fa.f);
  $('fa-list').innerHTML = COURSES.map(c => { const f = c.field, filed = FIELD.reports.filter(r => r.aid === f.id);
    return `<a class="fa-row" href="#field/${f.id}"><span class="code" style="color:${c.color}">${c.code}</span>
      <span class="ttl">${esc(f.title)}<small>${esc(f.where)} · ${esc(f.time)}</small></span>
      <span class="mark">${filed.length?`✓ ${filed.length} filed`:FIELD.drafts[f.id]?'draft':'—'}</span></a>`; }).join('');
  kitStop = mountKit($('kit-box'), KIT, () => saveSoon('kit', KIT, 300), (t,b,tag) => { addNote(t,b,tag); paintNotebook(); });
  paintNotebook();
}

function renderFieldAssignment(c, f){
  const D = FIELD.drafts[f.id] || { data:{}, reflect:[] };
  const filed = FIELD.reports.filter(r => r.aid === f.id);
  $('field-one').innerHTML = `<a class="btn ghost" href="#field">← Field school</a>
    <section id="fa-sec" data-rail="Assignment"><span class="eyebrow" style="color:${c.color};display:block;margin-top:14px">${c.code} · field assignment</span>
    <h2>${esc(f.title)}</h2><p class="lede-2">${f.brief}</p>
    <div class="fa-meta"><div><span class="k">Where</span>${esc(f.where)}</div><div><span class="k">Time</span>${esc(f.time)}</div>
      ${f.tool?`<div><span class="k">Field kit</span><a href="#field" data-kit="${f.tool}">${({tally:'Tally counter',queue:'Queue timer',audit:'Price audit'})[f.tool]}</a></div>`:''}</div>
    <h3 class="sub">Steps</h3><ol class="steps">${f.steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <div class="callout warn"><b>Field manners.</b> Observe without getting in anyone’s way. Do not photograph shoppers or staff, do not interview busy employees, and respect any store policy on photography. If a manager asks what you are doing, tell them: you are studying retail.</div></section>
    <section id="fa-form-sec" data-rail="Report"><h3 class="sub">Your report</h3>
    <div class="fa-form">${f.fields.map(x => `<label class="fa-f ${x.t==='area'?'wide':''}"><span>${esc(x.l)}</span>${
      x.t==='area' ? `<textarea data-k="${x.k}">${esc(D.data[x.k]??'')}</textarea>` :
      `<input type="${x.t==='num'?'number':'text'}" step="any" data-k="${x.k}" value="${esc(D.data[x.k]??'')}">`}</label>`).join('')}</div>
    <h3 class="sub">Reflect</h3>${f.reflect.map((r,i) => `<label class="fa-f wide"><span>${esc(r)}</span><textarea data-r="${i}">${esc(D.reflect[i]??'')}</textarea></label>`).join('')}
    <div class="quiz-foot"><button class="btn big" id="fa-file">File report</button><span class="fine" id="fa-state">${FIELD.drafts[f.id]?'Draft saved':''}</span></div></section>
    ${filed.length ? `<section id="fa-filed" data-rail="Filed reports"><h3 class="sub">Filed reports</h3>${filed.map(r => reportHTML(f, r)).join('')}</section>` : ''}`;
  const box = $('field-one');
  const persist = () => {
    box.querySelectorAll('[data-k]').forEach(i => D.data[i.dataset.k] = i.value);
    box.querySelectorAll('[data-r]').forEach(i => D.reflect[+i.dataset.r] = i.value);
    FIELD.drafts[f.id] = D; saveSoon('field', FIELD); $('fa-state').textContent = 'Draft saved';
  };
  box.querySelectorAll('[data-k],[data-r]').forEach(i => i.addEventListener('input', persist));
  box.querySelector('[data-kit]')?.addEventListener('click', e => { e.preventDefault(); go('field'); setTimeout(()=>{ document.querySelector(`#kit-box .tabs button[data-t="${f.tool}"]`)?.click(); $('s-kit')?.scrollIntoView({block:'start'}); }, 30); });
  $('fa-file').onclick = () => {
    persist();
    if(!Object.values(D.data).some(v => String(v).trim())) { $('fa-state').textContent = 'Fill in at least one field first.'; return; }
    FIELD.reports.unshift({ aid:f.id, ts:Date.now(), data:{...D.data}, reflect:[...D.reflect] });
    delete FIELD.drafts[f.id];
    save('field', FIELD);
    renderFieldAssignment(c, f); buildRail();
    $('fa-filed')?.scrollIntoView({block:'start'});
  };
  box.querySelectorAll('[data-del-report]').forEach(b => b.onclick = () => {
    if(!confirm('Delete this filed report?')) return;
    FIELD.reports = FIELD.reports.filter(r => String(r.ts) !== b.dataset.delReport); save('field', FIELD); renderFieldAssignment(c, f);
  });
}
function reportHTML(f, r){
  return `<div class="report"><div class="cm-h"><span class="cm-t">${esc(f.title)}</span><span class="cm-meta">${new Date(r.ts).toLocaleString()}</span></div>
    <dl>${f.fields.map(x => r.data[x.k] ? `<dt>${esc(x.l)}</dt><dd>${esc(r.data[x.k])}</dd>` : '').join('')}
    ${f.reflect.map((q,i) => r.reflect[i] ? `<dt>${esc(q)}</dt><dd>${esc(r.reflect[i])}</dd>` : '').join('')}</dl>
    <button class="cm-x" data-del-report="${r.ts}">delete</button></div>`;
}

function addNote(t, b, tag){ NOTEBOOK.unshift({ t, b, tag, ts:Date.now() }); save('notebook', NOTEBOOK); }
function paintNotebook(){
  const el = $('nb-list'); if(!el) return;
  const all = [
    ...NOTEBOOK.map((e,i) => ({ ts:e.ts, html:`<div class="cm"><div class="cm-h"><span class="cm-t">${esc(e.t||'Note')}</span><span class="cm-meta">${e.tag?esc(e.tag)+' · ':''}${new Date(e.ts).toLocaleString()}</span></div><p class="cm-b">${esc(e.b)}</p><button class="cm-x" data-nb="${i}">delete</button></div>` })),
    ...FIELD.reports.map(r => { const c = COURSES.find(c => c.field.id === r.aid); return { ts:r.ts, html:`<div class="cm report-sum"><div class="cm-h"><span class="cm-t"><a href="#field/${r.aid}">${esc(c?.field.title||r.aid)}</a></span><span class="cm-meta">Field report · ${new Date(r.ts).toLocaleString()}</span></div></div>` }; })
  ].sort((a,b) => b.ts - a.ts);
  el.innerHTML = all.length ? all.map(x => x.html).join('') : '<p class="fine">Nothing yet. Observations you file from units, field-kit snapshots, kept daily questions and field reports all land here.</p>';
  el.querySelectorAll('[data-nb]').forEach(b => b.onclick = () => { if(confirm('Delete this note?')){ NOTEBOOK.splice(+b.dataset.nb,1); save('notebook', NOTEBOOK); paintNotebook(); } });
}
function exportNotebook(){
  const lines = [`# Endcap field notebook\n\nExported ${new Date().toLocaleString()}\n`];
  COURSES.forEach(c => FIELD.reports.filter(r => r.aid === c.field.id).forEach(r => {
    lines.push(`## ${c.field.title}\n_${new Date(r.ts).toLocaleString()}_\n`);
    c.field.fields.forEach(x => r.data[x.k] && lines.push(`**${x.l}**\n${r.data[x.k]}\n`));
    c.field.reflect.forEach((q,i) => r.reflect[i] && lines.push(`**${q}**\n${r.reflect[i]}\n`));
  }));
  if(NOTEBOOK.length){ lines.push('## Notes\n'); NOTEBOOK.forEach(e => lines.push(`### ${e.t||'Note'}\n_${e.tag?e.tag+' · ':''}${new Date(e.ts).toLocaleString()}_\n\n${e.b}\n`)); }
  download('endcap-field-notebook.md', lines.join('\n'), 'text/markdown');
}
function download(name, text, type){
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

/* ============================================================
   REFERENCE — review, glossary, formulas, cases, library
   ============================================================ */
function renderReference(){
  const tab = ARGS[0] || 'review';
  document.querySelectorAll('#ref-tabs button').forEach(b => { b.setAttribute('aria-selected', b.dataset.t===tab); b.onclick = () => go('reference', b.dataset.t); });
  document.querySelectorAll('.ref-pane').forEach(p => p.classList.toggle('hide', p.id !== 'ref-'+tab));
  ({ review:paintReviewIdle, glossary:buildGlossary, formulas:buildFormulas, cases:buildCases, library:buildLibrary })[tab]?.();
}

/* ---------- review deck (Leitner) ---------- */
const BOX_DAYS = {1:1, 2:2, 3:4, 4:9, 5:21};
function allCards(){
  const out = [];
  UNITS.forEach(({c,u,k}) => {
    if(!met(k)) return;
    out.push({ id:'c:'+k, q:u.check.q, a:u.check.a, tag:`${c.code} · ${u.n} ${u.title}`, color:c.color, kind:'Check' });
    if(PREFS.vocab) u.terms.forEach((t,i) => out.push({ id:`t:${k}:${i}`, q:`What does <b>${esc(t[0])}</b> mean?`, a:esc(t[1]), tag:`${c.code} · vocabulary`, color:c.color, kind:'Term' }));
  });
  return out;
}
function dueCards(){ const t = dayNum(); return allCards().filter(card => { const s = SRS[card.id]; return !s || s.due <= t; }); }
let reviewQueue = [];
function paintReviewIdle(){
  const due = dueCards(), all = allCards();
  $('review-meta').textContent = `${all.length} cards from ${UNITS.filter(x=>met(x.k)).length} opened units · ${all.filter(c=>SRS[c.id]).length} seen · ${due.length} due today`;
  $('review-body').innerHTML = due.length
    ? `<div class="flash-empty"><b>${due.length}</b> card${due.length>1?'s are':' is'} ready. Sessions take up to 20 cards, mixed across courses, so you practise telling ideas apart.
       <div class="flash-btns"><button class="btn big" id="review-start">Start review</button></div></div>`
    : `<div class="flash-empty">${all.length ? 'Nothing due right now. Cards you have reviewed come back on a widening schedule — tomorrow, then a few days, then weeks.' : 'Open a unit and its check question and key terms join the deck.'}</div>`;
  const st = $('review-start');
  if(st) st.onclick = () => { reviewQueue = shuffle(due).slice(0,20); paintReview(); };
}
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
function paintReview(){
  if(!reviewQueue.length){ paintReviewIdle(); buildRail(); return; }
  const card = reviewQueue[0];
  $('review-body').innerHTML = `<p class="review-meta">${reviewQueue.length} left in this session</p>
    <div class="flash"><div class="tag" style="color:${card.color}">${esc(card.tag)} · ${card.kind}</div>
    <div class="side">Question</div><div class="qn">${card.q}</div><div id="rv-answer"></div>
    <div class="flash-btns" id="rv-btns"><button class="btn big" id="rv-show">Show answer</button></div></div>`;
  $('rv-show').onclick = () => {
    $('rv-answer').innerHTML = `<div class="side" style="margin-top:16px">Answer</div><div class="an">${card.a}</div>`;
    $('rv-btns').innerHTML = `<button class="btn ghost" id="rv-again">Again</button><button class="btn big" id="rv-got">Got it</button>`;
    $('rv-again').onclick = () => grade(card, false);
    $('rv-got').onclick = () => grade(card, true);
  };
}
function grade(card, ok){
  const s = SRS[card.id] || { box:1 };
  s.box = ok ? Math.min(5, (s.box||1)+1) : 1;
  s.due = dayNum() + BOX_DAYS[s.box];
  SRS[card.id] = s; save('srs', SRS);
  reviewQueue.shift();
  if(!ok) reviewQueue.push(card);          // missed cards come round again in the same session
  paintReview();
}

/* ---------- glossary ---------- */
function buildGlossary(){
  const terms = [];
  UNITS.forEach(({c,u}) => u.terms.forEach(t => terms.push({ t:t[0], d:t[1], c, u })));
  terms.sort((a,b) => a.t.localeCompare(b.t));
  const sel = $('gloss-course');
  if(!sel.options.length) sel.innerHTML = `<option value="">All courses</option>` + COURSES.map(c => `<option value="${c.id}">${c.code} ${esc(c.title)}</option>`).join('');
  const paint = () => {
    const q = $('gloss-search').value.toLowerCase(), cf = sel.value;
    const list = terms.filter(x => (!cf || x.c.id===cf) && (x.t+' '+x.d).toLowerCase().includes(q));
    $('gloss-count').textContent = `${list.length} of ${terms.length} terms`;
    $('gloss-list').innerHTML = list.map(x => `<div><dt>${esc(x.t)}</dt><dd>${esc(x.d)} <a class="from" href="#program/${x.c.id}/${x.u.n}">${x.c.code} ${x.u.n}</a></dd></div>`).join('');
  };
  $('gloss-search').oninput = paint; sel.onchange = paint; paint();
}

/* ---------- formula sheet ---------- */
function buildFormulas(){
  $('formula-list').innerHTML = COURSES.map(c => {
    const us = c.units.filter(u => u.math); if(!us.length) return '';
    return `<div class="fgroup"><h3 class="sub"><span style="color:${c.color}">${c.code}</span> ${esc(c.title)}</h3>${us.map(u => `
      <div class="fblock"><a href="#program/${c.id}/${u.n}" class="from">${u.n} · ${esc(u.math.h)}</a>
      <div class="formulas">${u.math.f.map(f => `<div class="fx"><code>${esc(f[0])}</code><span>${esc(f[1])}</span></div>`).join('')}</div></div>`).join('')}</div>`;
  }).join('');
}

/* ---------- case file ---------- */
function buildCases(){
  const paint = () => {
    const f = document.querySelector('#case-filter button[aria-selected=true]')?.dataset.f || 'all';
    $('case-list').innerHTML = UNITS.filter(x => x.u.kase && (f==='all' || x.u.kase.kind===f)).map(({c,u}) => `
      <div class="case ${u.kase.kind}"><span class="badge-k">${u.kase.kind==='fact'?'Factual case — sourced':'Hypothetical — invented for teaching'}</span>
      <h4>${esc(u.kase.h)}</h4><p>${u.kase.b}</p>
      <p class="src"><a href="#program/${c.id}/${u.n}">${c.code} ${u.n} ${esc(u.title)}</a>${u.kase.src?.length?' · Sources: '+u.kase.src.map(srcLink).join(' · '):''}</p></div>`).join('');
  };
  document.querySelectorAll('#case-filter button').forEach(b => b.onclick = () => {
    document.querySelectorAll('#case-filter button').forEach(x => x.setAttribute('aria-selected', x===b)); paint(); });
  paint();
}

/* ---------- library ---------- */
function buildLibrary(){
  const cites = {};
  UNITS.forEach(({c,u}) => [...u.read, ...(u.kase?.src||[])].forEach(k => { (cites[k] ||= new Set()).add(`${c.code} ${u.n}`); }));
  $('library-list').innerHTML = SRC_GROUPS.map(([g, keys]) => `<div class="link-block"><h3 class="sub">${esc(g)}</h3><div class="lib">${keys.map(k => { const s = SRC[k]; return `
    <div class="lib-item"><a href="${esc(s.u)}" target="_blank" rel="noopener"><b>${esc(s.t)}</b></a><span class="by">${esc(s.by)}${s.open?' · free':' · may require access'}</span>
    <p>${s.use}</p>${cites[k]?`<span class="cited">Cited in ${[...cites[k]].join(', ')}</span>`:''}</div>`; }).join('')}</div></div>`).join('');
}

/* ============================================================
   SETTINGS
   ============================================================ */
function buildSettings(){
  $('acct-line').innerHTML = state.mode==='firebase'
    ? `Signed in as <b>${esc(state.user.email||'')}</b> · UID <code>${esc(state.uid)}</code> · storage: Firestore (<code>users/{uid}/endcap</code>)`
    : `Running in <b>local-only mode</b> — Firebase is not configured in <span class="kbd">assets/config.js</span>, so everything is saved to this browser only.`;
  $('acct-signout').onclick = () => signOutNow().then(() => location.reload());
  $('acct-clearlocal').onclick = () => {
    if(confirm('Clear Endcap’s local cache on this device? Progress, notes and field reports saved only in this browser will be erased.')){
      Object.keys(localStorage).filter(k => k.startsWith('endcap:')).forEach(k => localStorage.removeItem(k)); location.reload(); }
  };
  renderLockState();

  const th = $('pref-theme');
  try{ th.value = JSON.parse(localStorage.getItem('endcap:theme')) || 'auto'; }catch(e){ th.value = 'auto'; }
  th.onchange = () => {                       // a per-device convenience, so localStorage rather than the synced store
    try{ localStorage.setItem('endcap:theme', JSON.stringify(th.value)); }catch(e){}
    if(th.value === 'auto') delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = th.value;
  };

  const v = $('pref-vocab'), p = $('pref-pool');
  v.checked = PREFS.vocab !== false; p.value = PREFS.pool || 'met';
  v.onchange = () => { PREFS.vocab = v.checked; save('prefs', PREFS); buildRail(); };
  p.onchange = () => { PREFS.pool = p.value; save('prefs', PREFS); };

  $('data-export').onclick = () => download(`endcap-backup-${dayStr()}.json`, JSON.stringify({ app:'endcap', v:1, ts:Date.now(),
    progress:PROGRESS, opened:OPENED, notes:NOTES, srs:SRS, daily:DAILY, quiz:QUIZ, assign:ASSIGN, field:FIELD, notebook:NOTEBOOK, kit:KIT, prefs:PREFS }, null, 1), 'application/json');
  $('data-import').onchange = async e => {
    const f = e.target.files[0]; if(!f) return;
    try{
      const d = JSON.parse(await f.text());
      if(d.app !== 'endcap') throw new Error('Not an Endcap backup.');
      if(!confirm('Replace your current Endcap data with this backup?')) return;
      for(const k of ['progress','opened','notes','srs','daily','quiz','assign','field','notebook','kit','prefs']) if(d[k] !== undefined) await save(k, d[k]);
      location.reload();
    }catch(err){ alert('Could not import: ' + err.message); }
  };
  $('nb-export').onclick = exportNotebook;
  $('nb-export2').onclick = exportNotebook;
  $('about-founded').textContent = `${HOME.name}${HOME.founded ? ' · ' + HOME.founded : ''}`;
}

/* ============================================================
   LOCK STATE — the allowlist is empty until you paste your UID,
   which means a fresh deployment is open to anyone who signs in.
   Make that impossible to miss and hand over the exact text to paste.
   ============================================================ */
function renderLockState(){
  const banner = $('lock-warn'), box = $('uid-box');
  if(state.mode !== 'firebase'){
    box.innerHTML = '<div class="callout"><b>Local-only mode.</b> Nothing is written to the cloud and there is nothing to lock. Use Export below to back up or move your work.</div>';
    return;
  }
  const uid = state.uid;
  if(!ALLOWED_UIDS.length){
    banner.classList.remove('hide');
    banner.innerHTML = `<div class="in"><b>This deployment is unlocked.</b><span>ALLOWED_UIDS is empty, so anyone who signs in with Google can reach your data. Paste your UID <code>${esc(uid)}</code> into <code>assets/config.js</code> and <code>firestore.rules</code>, then redeploy. The exact text is below in Settings.</span></div>`;
  }
  box.innerHTML = `
    <h3 class="sub">Your UID</h3>
    <div class="uid-block" id="uid-plain">${esc(uid)}</div>
    <div class="copybar"><button class="btn ghost" data-copy="uid-plain">Copy UID</button><span class="ok"></span></div>
    <h3 class="sub">1 · assets/config.js</h3>
    <div class="uid-block" id="uid-cfg">export const ALLOWED_UIDS = [
  "${esc(uid)}"
];</div>
    <div class="copybar"><button class="btn ghost" data-copy="uid-cfg">Copy</button><span class="ok"></span></div>
    <h3 class="sub">2 · firestore.rules</h3>
    <div class="uid-block" id="uid-rules">rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(uid) {
      return request.auth != null
          &amp;&amp; request.auth.uid == uid
          &amp;&amp; request.auth.uid in ['${esc(uid)}'];
    }
    match /users/{uid}/{document=**} {
      allow read, write: if isOwner(uid);
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}</div>
    <div class="copybar"><button class="btn ghost" data-copy="uid-rules">Copy</button><span class="ok"></span></div>
    <div class="callout" style="margin-top:16px"><b>Then:</b> commit <code>assets/config.js</code> and push (Pages redeploys itself), and publish the rules in the Firebase console (Firestore → Rules) or with <code>firebase deploy --only firestore:rules</code>. If this Firebase project is shared with another field school, these rules cover both: each keeps its data under <code>users/{uid}</code>.</div>`;
  box.querySelectorAll('button[data-copy]').forEach(b => b.onclick = async () => {
    const el = document.getElementById(b.dataset.copy);
    try{ await navigator.clipboard.writeText(el.textContent); }
    catch(e){ const r = document.createRange(); r.selectNode(el); getSelection().removeAllRanges(); getSelection().addRange(r); }
    const ok = b.parentElement.querySelector('.ok'); if(ok){ ok.textContent = 'copied'; setTimeout(() => ok.textContent = '', 1600); }
  });
}
