/* ============================================================
   fieldkit.js — tools for the store floor.
   Built for a phone in one hand: big buttons, nothing to type
   while you are counting. State lives in the `kit` document so a
   count survives a reload; "Save to notebook" files a snapshot.
   ============================================================ */
import { $f, pc, n } from './labs.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const mmss = ms => { const s=Math.round(ms/1000); return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; };

export function defaultKit(){
  return {
    tally:{ counters:[{name:'Cart',n:0},{name:'Handbasket',n:0},{name:'No basket',n:0}], start:null },
    queue:{ waits:[], services:[], open:null, serving:null, lanes:'' },
    audit:{ a:'Store A', b:'Store B', rows:[] }
  };
}

/* mount(el, kit, persist, file) — persist() saves kit; file(title, body, tag) files a notebook entry. */
export function mountKit(el, kit, persist, file){
  let tab = 'tally', tick = null;
  const paint = () => {
    clearInterval(tick);
    el.innerHTML = `<div class="tabs" role="tablist">
      ${[['tally','Tally counter'],['queue','Queue timer'],['audit','Price audit'],['unit','Unit price']].map(([k,l]) =>
        `<button role="tab" data-t="${k}" aria-selected="${tab===k}">${l}</button>`).join('')}</div>
      <div id="kit-body"></div>`;
    el.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { tab=b.dataset.t; paint(); });
    ({tally, queue, audit, unit})[tab](el.querySelector('#kit-body'));
  };

  /* ---------- tally ---------- */
  function tally(box){
    const T = kit.tally;
    const elapsed = () => T.start ? Date.now()-T.start : 0;
    const draw = () => {
      const tot = T.counters.reduce((a,c)=>a+c.n,0), mins = elapsed()/60000;
      box.innerHTML = `<p class="hint">Tap a counter each time you see one; use − to correct a mis-tap. The clock starts at your first tap.</p>
        <div class="tally-grid">${T.counters.map((c,i)=>`
          <div class="tally"><button class="tally-hit" data-i="${i}"><b>${c.n}</b><span>${esc(c.name)}</span></button>
          <div class="tally-sub"><button data-minus="${i}" aria-label="minus one">−</button>
          <input value="${esc(c.name)}" data-name="${i}" aria-label="counter name"><button data-del="${i}" aria-label="remove counter">×</button></div></div>`).join('')}</div>
        <div class="kit-bar"><button class="btn ghost" id="t-add">+ Counter</button>
          <span class="kit-stat" id="t-stat">${tot} total · ${mmss(elapsed())} · ${mins>0.2?n(tot/mins*60)+' / hour':'—'}</span>
          ${T.counters.map(c=>tot?`<span class="kit-stat">${esc(c.name)} ${pc(c.n/tot,0)}</span>`:'').join('')}</div>
        <div class="kit-bar"><button class="btn" id="t-save">Save to notebook</button><button class="btn ghost" id="t-reset">Reset</button></div>`;
      box.querySelectorAll('.tally-hit').forEach(b => b.onclick = () => {
        if(!T.start) T.start = Date.now();
        T.counters[+b.dataset.i].n++; if(navigator.vibrate) navigator.vibrate(12); persist(); draw(); });
      box.querySelectorAll('[data-minus]').forEach(b => b.onclick = () => { const c=T.counters[+b.dataset.minus]; c.n=Math.max(0,c.n-1); persist(); draw(); });
      box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if(T.counters.length>1){ T.counters.splice(+b.dataset.del,1); persist(); draw(); } });
      box.querySelectorAll('[data-name]').forEach(i => i.onchange = () => { T.counters[+i.dataset.name].name = i.value.trim()||'Counter'; persist(); draw(); });
      box.querySelector('#t-add').onclick = () => { T.counters.push({name:'Counter '+(T.counters.length+1), n:0}); persist(); draw(); };
      box.querySelector('#t-reset').onclick = () => { if(confirm('Reset all counters to zero?')){ T.counters.forEach(c=>c.n=0); T.start=null; persist(); draw(); } };
      box.querySelector('#t-save').onclick = () => {
        const tot = T.counters.reduce((a,c)=>a+c.n,0), mins = elapsed()/60000;
        file('Tally count', `${T.counters.map(c=>`${c.name}: ${c.n}${tot?` (${pc(c.n/tot,0)})`:''}`).join('\n')}\nTotal: ${tot} in ${mmss(elapsed())}${mins>0.2?` — ${n(tot/mins*60)} per hour`:''}`, 'Field kit');
      };
    };
    draw();
    tick = setInterval(() => { const s = box.querySelector('#t-stat'); if(s && kit.tally.start){ const tot=kit.tally.counters.reduce((a,c)=>a+c.n,0), m=elapsed()/60000; s.textContent = `${tot} total · ${mmss(elapsed())} · ${m>0.2?n(tot/m*60)+' / hour':'—'}`; } }, 1000);
  }

  /* ---------- queue ---------- */
  function queue(box){
    const Q = kit.queue;
    const avg = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0;
    const draw = () => {
      const w = avg(Q.waits)/60000, s = avg(Q.services)/60000;
      box.innerHTML = `<p class="hint">Pick one shopper. Tap <b>Joins line</b> when they join the back of a line, <b>Service starts</b> when the cashier begins scanning, <b>Done</b> when they leave. Then pick the next shopper.</p>
        <div class="q-btns">
          <button class="btn big" id="q-join" ${Q.open||Q.serving?'disabled':''}>Joins line</button>
          <button class="btn big" id="q-start" ${Q.open?'':'disabled'}>Service starts</button>
          <button class="btn big" id="q-done" ${Q.serving?'':'disabled'}>Done</button></div>
        <p class="kit-live" id="q-live">${Q.open?'Waiting…':Q.serving?'Being served…':'Ready'}</p>
        <label class="field"><span>Lanes open (staffed / self-checkout)</span><input id="q-lanes" value="${esc(Q.lanes)}" placeholder="e.g. 6 staffed + 4 self"></label>
        <div class="kv"><span>Waits timed</span><b>${Q.waits.length}</b></div>
        <div class="kv hi"><span>Average wait</span><b>${Q.waits.length?n(w,1)+' min':'—'}</b></div>
        <div class="kv"><span>Services timed</span><b>${Q.services.length}</b></div>
        <div class="kv hi"><span>Average service time</span><b>${Q.services.length?n(s,1)+' min':'—'}</b></div>
        <p class="hint">Feed the averages into the <a href="#labs/queue">Checkout staffing lab</a>. By Little’s law, if you also count arrivals per minute (Tally), people waiting ≈ arrivals/min × average wait.</p>
        <div class="kit-bar"><button class="btn" id="q-save">Save to notebook</button><button class="btn ghost" id="q-undo">Undo last</button><button class="btn ghost" id="q-reset">Reset</button></div>`;
      box.querySelector('#q-join').onclick = () => { Q.open = Date.now(); persist(); draw(); };
      box.querySelector('#q-start').onclick = () => { Q.waits.push(Date.now()-Q.open); Q.open=null; Q.serving=Date.now(); persist(); draw(); };
      box.querySelector('#q-done').onclick = () => { Q.services.push(Date.now()-Q.serving); Q.serving=null; persist(); draw(); };
      box.querySelector('#q-lanes').onchange = e => { Q.lanes = e.target.value; persist(); };
      box.querySelector('#q-undo').onclick = () => { if(Q.serving){ Q.serving=null; } else if(Q.open){ Q.open=null; } else if(Q.services.length>=Q.waits.length){ Q.services.pop(); } else { Q.waits.pop(); } persist(); draw(); };
      box.querySelector('#q-reset').onclick = () => { if(confirm('Clear all timings?')){ Object.assign(Q,{waits:[],services:[],open:null,serving:null}); persist(); draw(); } };
      box.querySelector('#q-save').onclick = () => file('Queue timing',
        `Lanes: ${Q.lanes||'not recorded'}\nWaits timed: ${Q.waits.length}, average ${n(avg(Q.waits)/60000,1)} min (${Q.waits.map(x=>mmss(x)).join(', ')})\nServices timed: ${Q.services.length}, average ${n(avg(Q.services)/60000,1)} min`, 'Field kit');
    };
    draw();
    tick = setInterval(() => { const l = box.querySelector('#q-live'); if(!l) return;
      if(Q.open) l.textContent = 'Waiting — ' + mmss(Date.now()-Q.open);
      else if(Q.serving) l.textContent = 'Being served — ' + mmss(Date.now()-Q.serving); }, 500);
  }

  /* ---------- price audit ---------- */
  function audit(box){
    const A = kit.audit;
    const draw = () => {
      let sa=0, sb=0, ka=0, kb=0;
      A.rows.forEach(r => { const a=+r.pa, b=+r.pb; if(a>0&&b>0){ sa+=a; sb+=b; if(r.kvi){ ka+=a; kb+=b; } } });
      box.innerHTML = `<p class="hint">Record the same item (same brand and size) at two stores. Tick KVI for the items shoppers know by heart. The index shows Store B’s basket as a percentage of Store A’s.</p>
        <div class="audit-head"><input id="au-a" value="${esc(A.a)}" aria-label="Store A name"><input id="au-b" value="${esc(A.b)}" aria-label="Store B name"></div>
        <div class="scroller"><table class="audit"><tr><th>Item & size</th><th>KVI</th><th>${esc(A.a)} $</th><th>${esc(A.b)} $</th><th>Gap</th><th></th></tr>
        ${A.rows.map((r,i)=>{ const a=+r.pa,b=+r.pb, g=a>0&&b>0?(b/a-1):NaN; return `<tr>
          <td><input data-r="${i}" data-f="item" value="${esc(r.item)}"></td>
          <td><input type="checkbox" data-r="${i}" data-f="kvi" ${r.kvi?'checked':''}></td>
          <td><input type="number" step="0.01" inputmode="decimal" data-r="${i}" data-f="pa" value="${esc(r.pa)}"></td>
          <td><input type="number" step="0.01" inputmode="decimal" data-r="${i}" data-f="pb" value="${esc(r.pb)}"></td>
          <td class="n">${isFinite(g)?(g>0?'+':'')+pc(g,0):''}</td>
          <td><button class="x" data-del="${i}" aria-label="remove row">×</button></td></tr>`; }).join('')}
        </table></div>
        <div class="kit-bar"><button class="btn ghost" id="au-add">+ Item</button><button class="btn ghost" id="au-kvi">Add the 6 standard KVIs</button></div>
        <div class="kv hi"><span>Price index, all matched items (${esc(A.b)} vs ${esc(A.a)} = 100)</span><b>${sa?n(sb/sa*100,1):'—'}</b></div>
        <div class="kv hi"><span>Price index, KVIs only</span><b>${ka?n(kb/ka*100,1):'—'}</b></div>
        <div class="kit-bar"><button class="btn" id="au-save">Save to notebook</button><button class="btn ghost" id="au-reset">Clear</button></div>`;
      box.querySelectorAll('[data-r]').forEach(inp => inp.onchange = () => {
        const r = A.rows[+inp.dataset.r]; r[inp.dataset.f] = inp.type==='checkbox' ? inp.checked : inp.value; persist(); draw(); });
      box.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { A.rows.splice(+b.dataset.del,1); persist(); draw(); });
      box.querySelector('#au-a').onchange = e => { A.a = e.target.value||'Store A'; persist(); draw(); };
      box.querySelector('#au-b').onchange = e => { A.b = e.target.value||'Store B'; persist(); draw(); };
      box.querySelector('#au-add').onclick = () => { A.rows.push({item:'',kvi:false,pa:'',pb:''}); persist(); draw(); };
      box.querySelector('#au-kvi').onclick = () => { ['Milk, 1 gal, store brand','Eggs, 1 dozen large','Bananas, per lb','White bread, store brand loaf','Soda 12-pack (same brand)','Ground beef 80/20, per lb'].forEach(t => A.rows.push({item:t,kvi:true,pa:'',pb:''})); persist(); draw(); };
      box.querySelector('#au-reset').onclick = () => { if(confirm('Clear the audit?')){ A.rows=[]; persist(); draw(); } };
      box.querySelector('#au-save').onclick = () => file(`Price audit: ${A.a} vs ${A.b}`,
        A.rows.map(r=>`${r.kvi?'[KVI] ':''}${r.item||'(item)'} — ${A.a} ${r.pa?$f(+r.pa,2):'?'} / ${A.b} ${r.pb?$f(+r.pb,2):'?'}`).join('\n') +
        `\nIndex (all): ${sa?n(sb/sa*100,1):'—'} · Index (KVIs): ${ka?n(kb/ka*100,1):'—'}`, 'Field kit');
    };
    draw();
  }

  /* ---------- unit price ---------- */
  function unit(box){
    box.innerHTML = `<p class="hint">Check the shelf tag, or compare two sizes the tag does not compare (different units, a promo on one).</p>
      <div class="lab-grid"><div class="lab-in">
        <label class="field"><span>Option 1 price ($)</span><input type="number" step="0.01" id="u1p" value="4.49"></label>
        <label class="field"><span>Option 1 size</span><input type="number" step="any" id="u1s" value="16"></label>
        <label class="field"><span>Option 2 price ($)</span><input type="number" step="0.01" id="u2p" value="6.99"></label>
        <label class="field"><span>Option 2 size</span><input type="number" step="any" id="u2s" value="24"></label>
        <label class="field"><span>Unit (oz, lb, count, sheets…)</span><input id="uu" value="oz"></label>
      </div><div class="lab-out" id="u-out"></div></div>`;
    const run = () => {
      const v = id => parseFloat(box.querySelector('#'+id).value), u = esc(box.querySelector('#uu').value||'unit');
      const a=v('u1p')/v('u1s'), b=v('u2p')/v('u2s');
      box.querySelector('#u-out').innerHTML =
        `<div class="kv"><span>Option 1</span><b>${$f(a,3)} / ${u}</b></div><div class="kv"><span>Option 2</span><b>${$f(b,3)} / ${u}</b></div>
         <div class="kv hi"><span>Better value</span><b>${!isFinite(a)||!isFinite(b)?'—':a<b?'Option 1, by '+pc(b/a-1,1):b<a?'Option 2, by '+pc(a/b-1,1):'Equal'}</b></div>
         <p class="means">${isFinite(a)&&isFinite(b)&&((a<b&&v('u1s')<v('u2s'))||(b<a&&v('u2s')<v('u1s')))?'The smaller package is cheaper per unit — bigger is not always better value, especially when the small size is on promotion.':'Compare per unit, not per package. Shrinkflation hides here.'}</p>`;
    };
    box.querySelectorAll('input').forEach(i => i.addEventListener('input', run)); run();
  }

  paint();
  return () => clearInterval(tick);
}
