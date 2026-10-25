/* ============================================================
   labs.js — the business-math workbench.
   Every lab is { id, title, course, blurb, mount(el) }. Most are
   built with calc(): a list of inputs and a function that turns
   them into a readout plus a plain-English "what it means".
   Nothing here is saved; labs are scratch paper.
   ============================================================ */

/* ---------- formatting ---------- */
const nf  = (d=0) => new Intl.NumberFormat('en-US', { minimumFractionDigits:d, maximumFractionDigits:d });
export const $f = (v, d=0) => (v<0?'−':'') + '$' + nf(d).format(Math.abs(v));
export const pc = (v, d=1) => (isFinite(v) ? nf(d).format(v*100) + '%' : '—');
export const n  = (v, d=0) => (isFinite(v) ? nf(d).format(v) : '—');
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Inverse standard normal (Acklam). Good to ~1e-9 — far beyond what a shelf needs. */
export function zOf(p){
  const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.3577518672690,-30.66479806614716,2.506628277459239];
  const b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572];
  const c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783];
  const d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];
  const pl=0.02425, ph=1-pl; let q,r;
  if(p<=0) return -Infinity; if(p>=1) return Infinity;
  if(p<pl){ q=Math.sqrt(-2*Math.log(p)); return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  if(p>ph){ q=Math.sqrt(-2*Math.log(1-p)); return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1); }
  q=p-0.5; r=q*q;
  return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}

/* Erlang C: probability an arrival waits, and mean wait, for c servers. */
export function erlangC(lam, mu, c){
  const a = lam/mu, rho = a/c;
  if(!(c>0) || rho>=1) return { rho, pw:1, wq:Infinity, lq:Infinity };
  let sum=0, term=1;
  for(let k=0;k<c;k++){ if(k>0) term*=a/k; sum+=term; }
  const ac = term*a/c;                      // a^c / c!
  const top = ac/(1-rho);
  const pw = top/(sum+top);
  const wq = pw/(c*mu-lam);
  return { rho, pw, wq, lq: lam*wq };
}

/* ---------- generic calculator ---------- */
function calc(el, spec){
  const id = 'lab-' + Math.random().toString(36).slice(2,8);
  el.innerHTML = `<div class="lab-grid">
    <div class="lab-in">${spec.fields.map(f => f.sel
      ? `<label class="field"><span>${f.l}</span><select data-k="${f.k}">${f.sel.map(o=>`<option value="${o[0]}" ${o[0]==f.v?'selected':''}>${o[1]}</option>`).join('')}</select></label>`
      : `<label class="field"><span>${f.l}</span><input type="number" inputmode="decimal" data-k="${f.k}" value="${f.v}" step="${f.s||'any'}"></label>`).join('')}
    </div>
    <div class="lab-out" id="${id}" aria-live="polite"></div></div>`;
  const out = el.querySelector('#'+id);
  const read = () => { const v={}; el.querySelectorAll('[data-k]').forEach(i => v[i.dataset.k] = i.tagName==='SELECT' ? i.value : parseFloat(i.value)); return v; };
  const run = () => { try{ out.innerHTML = spec.out(read()); }catch(e){ out.innerHTML = '<span class="note">Check the inputs.</span>'; } };
  el.querySelectorAll('[data-k]').forEach(i => i.addEventListener('input', run));
  run();
}
const row = (k, v, hi) => `<div class="kv${hi?' hi':''}"><span>${k}</span><b>${v}</b></div>`;
const means = t => `<p class="means"><b>What it means.</b> ${t}</p>`;
const bar = (pairs) => `<div class="hbars">${pairs.map(([l,v,c]) =>
  `<div class="hb"><span>${l}</span><i style="width:${Math.max(0,Math.min(100,v*100))}%;background:${c||'var(--magenta)'}"></i><b>${pc(v,0)}</b></div>`).join('')}</div>`;

/* ============================================================
   THE LABS
   ============================================================ */
export const LABS = [

{ id:'margin', course:'r211', title:'Markup ↔ margin converter',
  blurb:'Price an item for a target margin, and see why "adding 30%" is not a 30% margin.',
  mount: el => calc(el, { fields:[
    {k:'cost', l:'Unit cost ($)', v:2.10, s:0.01},
    {k:'price', l:'Current shelf price ($)', v:2.99, s:0.01},
    {k:'target', l:'Target margin (%)', v:30, s:0.5}],
   out: v => {
    const m = (v.price-v.cost)/v.price, mu = (v.price-v.cost)/v.cost;
    const tp = v.cost/(1-v.target/100), wrong = v.cost*(1+v.target/100);
    return row('Margin at current price', pc(m), true) + row('Markup on cost', pc(mu)) +
      row('Gross profit per unit', $f(v.price-v.cost,2)) +
      row(`Price for a ${n(v.target,1)}% margin`, $f(tp,2), true) +
      row(`"Cost + ${n(v.target,1)}%" price`, $f(wrong,2)) +
      row('Margin you would really get from cost-plus', pc((wrong-v.cost)/wrong)) +
      means(`At ${$f(v.price,2)} the store keeps ${pc(m,0)} of every sales dollar on this item. Pricing with cost ÷ (1 − margin) gives ${$f(tp,2)}; adding ${n(v.target,0)}% to cost gives only ${pc((wrong-v.cost)/wrong)} — the most common pricing error in retail.`);
   }})},

{ id:'pnl', course:'r101', title:'Store P&L builder',
  blurb:'Build a store P&L and see how far a dollar of loss travels on a thin margin.',
  mount: el => calc(el, { fields:[
    {k:'sales', l:'Weekly sales ($)', v:500000, s:1000},
    {k:'cogs', l:'Cost of goods sold ($)', v:360000, s:1000},
    {k:'labor', l:'Labor ($)', v:62000, s:500},
    {k:'occ', l:'Occupancy ($)', v:28000, s:500},
    {k:'other', l:'Other operating expense ($)', v:38000, s:500},
    {k:'loss', l:'A loss to recover (shrink, spoilage) ($)', v:1200, s:50}],
   out: v => {
    const gp=v.sales-v.cogs, opex=v.labor+v.occ+v.other, op=gp-opex, om=op/v.sales;
    return row('Gross profit', $f(gp)) + row('Gross margin', pc(gp/v.sales), true) +
      row('Labor % of sales', pc(v.labor/v.sales)) + row('Total opex % of sales', pc(opex/v.sales)) +
      row('Operating profit', $f(op), true) + row('Operating margin', pc(om,2), true) +
      row('Loss as share of operating profit', pc(v.loss/op)) +
      row('Extra sales needed to recover the loss', om>0 ? $f(v.loss/om) : 'store is losing money', true) +
      means(om>0 ? `The store keeps ${pc(om,1)} of each sales dollar as operating profit, so a ${$f(v.loss)} loss needs ${$f(v.loss/om)} of extra sales to earn back. That multiplier — 1 ÷ margin — is why grocers fight shrink so hard.` : `Operating expenses exceed gross profit: every extra dollar of sales still has to cover fixed costs before any profit appears.`);
   }})},

{ id:'turnover', course:'r101', title:'Turns, GMROI & space productivity',
  blurb:'Margin or speed? Compare two items, or check how hard a store’s inventory and floor are working.',
  mount: el => calc(el, { fields:[
    {k:'sales', l:'Annual sales ($)', v:24000000, s:10000},
    {k:'gm', l:'Gross margin (%)', v:28, s:0.5},
    {k:'inv', l:'Average inventory at cost ($)', v:1152000, s:1000},
    {k:'sqft', l:'Selling area (sq ft)', v:38000, s:100}],
   out: v => {
    const gp=v.sales*v.gm/100, cogs=v.sales-gp, turns=cogs/v.inv;
    return row('COGS', $f(cogs)) + row('Inventory turnover', n(turns,1)+'×', true) +
      row('Days of supply', n(365/turns,1)+' days') + row('GMROI', n(gp/v.inv,2), true) +
      row('Sales per sq ft', $f(v.sales/v.sqft)) + row('Gross profit per sq ft', $f(gp/v.sqft), true) +
      means(`Every dollar tied up in inventory returns ${$f(gp/v.inv,2)} of gross margin a year, and the stock sells through every ${n(365/turns,0)} days. Try halving the margin and doubling sales: GMROI stays the same — margin and speed are two roads to one return.`);
   }})},

{ id:'breakeven', course:'r101', title:'Break-even & operating leverage',
  blurb:'Find the sales a store needs to cover its fixed costs, and see how profit swings with volume.',
  mount: el => calc(el, { fields:[
    {k:'fixed', l:'Weekly fixed costs ($)', v:90000, s:500},
    {k:'varpct', l:'Variable costs (% of sales)', v:76, s:0.5},
    {k:'sales', l:'Current weekly sales ($)', v:400000, s:1000},
    {k:'chg', l:'Sales change to test (%)', v:10, s:1}],
   out: v => {
    const cm=1-v.varpct/100, be=v.fixed/cm, p0=v.sales*cm-v.fixed, s1=v.sales*(1+v.chg/100), p1=s1*cm-v.fixed;
    return row('Contribution margin ratio', pc(cm)) + row('Break-even weekly sales', $f(be), true) +
      row('Safety margin above break-even', pc((v.sales-be)/v.sales)) +
      row('Profit now', $f(p0), true) + row(`Profit at ${v.chg>=0?'+':''}${n(v.chg)}% sales`, $f(p1)) +
      row('Profit change', p0!==0 ? pc((p1-p0)/Math.abs(p0),0) : '—', true) +
      means(`Each sales dollar contributes ${pc(cm,0)} toward fixed costs. Sales moving ${n(v.chg)}% moves profit ${p0!==0?pc((p1-p0)/Math.abs(p0),0):'a lot'} — operating leverage. It is why stores fight for comps and stay open late: once fixed costs are covered, extra contribution is nearly all profit.`);
   }})},

{ id:'membership', course:'r101', title:'Membership club model',
  blurb:'How much of a warehouse club’s profit can come from fees rather than merchandise?',
  mount: el => calc(el, { fields:[
    {k:'members', l:'Paid members', v:100000, s:1000},
    {k:'fee', l:'Annual fee ($)', v:65, s:1},
    {k:'spend', l:'Merchandise spend per member per year ($)', v:3000, s:50},
    {k:'gm', l:'Merchandise gross margin (%)', v:11, s:0.1},
    {k:'opex', l:'Operating expenses (% of merchandise sales)', v:9.5, s:0.1},
    {k:'renew', l:'Renewal rate (%)', v:90, s:0.5}],
   out: v => {
    const ms=v.members*v.spend, gp=ms*v.gm/100, ox=ms*v.opex/100, fees=v.members*v.fee, merchOp=gp-ox, tot=merchOp+fees;
    return row('Merchandise sales', $f(ms)) + row('Merchandise operating profit', $f(merchOp)) +
      row('Membership fee income', $f(fees), true) + row('Total operating profit', $f(tot), true) +
      row('Share of profit from fees', tot>0 ? pc(fees/tot,0) : '—', true) +
      row('Members to replace each year', n(v.members*(1-v.renew/100))) +
      means(`With merchandise margins this thin, fees supply ${tot>0?pc(fees/tot,0):'most'} of operating profit. The low prices are what make members renew; a 1-point drop in renewal costs ${$f(v.members*0.01*v.fee)} in fees before counting their lost shopping.`);
   }})},

{ id:'elasticity', course:'r211', title:'Elasticity & the break-even lift',
  blurb:'Measure elasticity from two price points, and see whether a price change made money.',
  mount: el => calc(el, { fields:[
    {k:'p1', l:'Old price ($)', v:1.99, s:0.01}, {k:'q1', l:'Old weekly units', v:1200, s:1},
    {k:'p2', l:'New price ($)', v:1.79, s:0.01}, {k:'q2', l:'New weekly units', v:1560, s:1},
    {k:'cost', l:'Unit cost ($)', v:1.49, s:0.01}],
   out: v => {
    const dq=(v.q2-v.q1)/((v.q1+v.q2)/2), dp=(v.p2-v.p1)/((v.p1+v.p2)/2), E=dq/dp;
    const r1=v.p1*v.q1, r2=v.p2*v.q2, g1=(v.p1-v.cost)*v.q1, g2=(v.p2-v.cost)*v.q2;
    const m=(v.p1-v.cost)/v.p1, d=(v.p1-v.p2)/v.p1;
    const need = d>0 ? d/(m-d) : (-d)/(m-d);
    return row('Midpoint elasticity', n(E,2), true) +
      row('Demand is', Math.abs(E)>1 ? 'elastic' : Math.abs(E)<1 ? 'inelastic' : 'unit elastic') +
      row('Revenue change', `${$f(r2-r1)} (${pc((r2-r1)/r1)})`) +
      row('Gross profit change', `${$f(g2-g1)} (${pc((g2-g1)/g1)})`, true) +
      (d>0 ? row('Unit lift needed to break even', m>d ? pc(need,0) : 'impossible — cut exceeds margin') + row('Unit lift achieved', pc((v.q2-v.q1)/v.q1,0)) : '') +
      means(`${Math.abs(E)>1?'Units moved proportionally more than price, so revenue':'Units moved proportionally less than price, so revenue'} went ${r2>r1?'up':'down'}. But profit went ${g2>g1?'up':'down'}: on a ${pc(m,0)} margin a ${pc(Math.abs(d),0)} price change needs ${d>0&&m>d?pc(need,0)+' more units':'very different volumes'} to break even. Revenue is not the score; gross profit is.`);
   }})},

{ id:'pricesim', course:'r211', title:'Price the item: an 8-week simulation',
  blurb:'Set a price each week for a hypothetical product with a hidden demand curve. Maximize gross profit.',
  mount: el => priceSim(el) },

{ id:'promo', course:'r221', title:'Promotion evaluator',
  blurb:'Turn a promotion’s lift into the number that matters: incremental gross profit for the whole store.',
  mount: el => calc(el, { fields:[
    {k:'base', l:'Baseline units / week', v:200, s:1}, {k:'reg', l:'Regular price ($)', v:4.00, s:0.01},
    {k:'cost', l:'Unit cost ($)', v:2.80, s:0.01}, {k:'promo', l:'Promo price ($)', v:3.00, s:0.01},
    {k:'fund', l:'Vendor funding per unit ($)', v:0.50, s:0.01}, {k:'units', l:'Promo units / week', v:700, s:1},
    {k:'cann', l:'Units cannibalized from other items', v:150, s:1}, {k:'cm', l:'Margin on cannibalized items ($/unit)', v:1.00, s:0.01},
    {k:'pull', l:'Units pulled forward from later weeks', v:100, s:1}, {k:'halo', l:'Halo gross profit on other items ($)', v:0, s:10},
    {k:'fixed', l:'Fixed cost: display labor, signs ($)', v:0, s:10}],
   out: v => {
    const rm=v.reg-v.cost, pm=v.promo-v.cost+v.fund, lift=v.units-v.base;
    const itemDelta=v.units*pm - v.base*rm, cannGP=v.cann*v.cm, pullGP=v.pull*rm;
    const net=itemDelta - cannGP - pullGP + v.halo - v.fixed, incrU=lift-v.cann-v.pull;
    return row('Lift', `${n(lift)} units (${pc(lift/v.base,0)})`) +
      row('Promo margin per unit (incl. funding)', $f(pm,2)) +
      row('Change in GP on the promoted item', $f(itemDelta)) +
      row('Less: cannibalized GP', $f(-cannGP)) + row('Less: pull-forward GP', $f(-pullGP)) +
      row('Plus: halo GP', $f(v.halo)) + row('Less: fixed cost', $f(-v.fixed)) +
      row('Truly incremental units', n(incrU)) +
      row('Incremental gross profit', $f(net), true) +
      means(`The headline is a ${pc(lift/v.base,0)} lift. The store’s answer is ${$f(net)}. ${net<0?'Most of the lift was borrowed — from other brands on the same shelf and from next week — and the discount was also paid on the '+n(v.base)+' units that would have sold anyway.':'The promotion created real value for the store after every offset.'} Try raising vendor funding or lowering the discount.`);
   }})},

{ id:'coupon', course:'r221', title:'Digital coupon economics ($X off $Y)',
  blurb:'Model a threshold coupon: who redeems, who stretches their basket, who was coming anyway.',
  mount: el => calc(el, { fields:[
    {k:'sent', l:'Households receiving the offer', v:10000, s:100}, {k:'red', l:'Redemption rate (%)', v:12, s:0.5},
    {k:'face', l:'Coupon value ($)', v:5, s:0.5}, {k:'thr', l:'Threshold ($)', v:25, s:1},
    {k:'anyway', l:'Redeemers who would have spent it anyway (%)', v:58, s:1},
    {k:'stretch', l:'Redeemers who stretched their basket (%)', v:34, s:1},
    {k:'extra', l:'Extra spend by stretchers ($)', v:7, s:0.5},
    {k:'gm', l:'Gross margin on extra spend (%)', v:30, s:0.5},
    {k:'basket', l:'Basket of a trip won from a rival ($)', v:30, s:1},
    {k:'mfr', l:'Share of coupon funded by a manufacturer (%)', v:0, s:5}],
   out: v => {
    const R=v.sent*v.red/100, a=R*v.anyway/100, s=R*v.stretch/100, t=Math.max(0,R-a-s);
    const storeCost=R*v.face*(1-v.mfr/100), gs=s*v.extra*v.gm/100, gt=t*v.basket*v.gm/100, net=gs+gt-storeCost;
    return row('Redemptions', n(R)) + row('…would have spent anyway', n(a)) + row('…stretched basket', n(s)) + row('…new trips from rivals', n(t)) +
      row('Store’s coupon cost', $f(-storeCost)) + row('GP from stretched baskets', $f(gs)) + row('GP from won trips', $f(gt)) +
      row('Net to the store', $f(net), true) + row('Net per redemption', $f(net/(R||1),2)) +
      means(`${net<0?'The offer loses money: most of its cost lands on shoppers who were going to spend $'+n(v.thr)+' anyway.':'The offer pays: enough redeemers changed what or where they bought.'} Untargeted threshold coupons usually fail this test, which is why grocers personalize them toward households that rarely hit the threshold or are drifting to a competitor.`);
   }})},

{ id:'loyalty', course:'r221', title:'Loyalty program economics',
  blurb:'Turn "10 points per dollar" into a reward rate, a real cost, and the lift needed to pay for it.',
  mount: el => calc(el, { fields:[
    {k:'ppd', l:'Points per $1 spent', v:10, s:1}, {k:'ppr', l:'Points per reward', v:1000, s:50},
    {k:'rv', l:'Reward value ($)', v:2, s:0.5}, {k:'brk', l:'Breakage (% never redeemed)', v:25, s:1},
    {k:'spend', l:'Annual member spending ($)', v:50000000, s:100000}, {k:'gm', l:'Gross margin (%)', v:28, s:0.5},
    {k:'fixed', l:'Program running cost per year ($)', v:250000, s:10000}],
   out: v => {
    const rate=v.rv/(v.ppr/v.ppd), net=rate*(1-v.brk/100), cost=v.spend*net+v.fixed, need=cost/(v.gm/100);
    return row('Reward rate', pc(rate,2), true) + row('Net cost rate after breakage', pc(net,2)) +
      row('Annual program cost', $f(cost)) + row('Incremental sales needed', $f(need), true) +
      row('…as a lift on member spending', pc(need/v.spend,1), true) +
      means(`Shoppers see ${pc(rate,1)} back. The retailer must generate ${pc(need/v.spend,1)} more member spending than it would have had without the program just to break even — before counting the value of the data and retail media the program makes possible.`);
   }})},

{ id:'space', course:'r301', title:'Shelf-space reallocation',
  blurb:'Move feet of shelf between categories and estimate the gross-profit effect using shelf-space elasticity.',
  mount: el => calc(el, { fields:[
    {k:'fa', l:'Category A: feet', v:40, s:1}, {k:'ga', l:'Category A: annual GP ($)', v:210000, s:1000},
    {k:'fb', l:'Category B: feet', v:28, s:1}, {k:'gb', l:'Category B: annual GP ($)', v:56000, s:1000},
    {k:'mv', l:'Feet to move from B to A', v:4, s:1}, {k:'e', l:'Shelf-space elasticity', v:0.17, s:0.01}],
   out: v => {
    const pa=v.ga/v.fa, pb=v.gb/v.fb, da=v.ga*(Math.pow((v.fa+v.mv)/v.fa, v.e)-1), db=v.gb*(Math.pow((v.fb-v.mv)/v.fb, v.e)-1);
    return row('A: GP per foot', $f(pa)) + row('B: GP per foot', $f(pb)) +
      row('A: change in GP', $f(da)) + row('B: change in GP', $f(db)) + row('Net change', $f(da+db), true) +
      means(`Space moves toward the category earning more per foot — but with an elasticity near 0.17 the effect is modest, and the real risk is B running out between deliveries. Check days of supply before moving the shelf.`);
   }})},

{ id:'huff', course:'r311', title:'Huff model: who shops where',
  blurb:'Three stores, one neighborhood. Size pulls shoppers in; travel time pushes them away.',
  mount: el => calc(el, { fields:[
    {k:'s1', l:'Store A size (sq ft)', v:50000, s:1000}, {k:'t1', l:'Store A drive time (min)', v:6, s:0.5},
    {k:'s2', l:'Store B size (sq ft)', v:120000, s:1000}, {k:'t2', l:'Store B drive time (min)', v:12, s:0.5},
    {k:'s3', l:'Store C size (sq ft)', v:25000, s:1000}, {k:'t3', l:'Store C drive time (min)', v:3, s:0.5},
    {k:'lam', l:'Distance sensitivity λ', v:2, s:0.1}],
   out: v => {
    const at=[v.s1/Math.pow(v.t1,v.lam), v.s2/Math.pow(v.t2,v.lam), v.s3/Math.pow(v.t3,v.lam)], T=at.reduce((a,b)=>a+b,0);
    return bar([['Store A',at[0]/T,'#3E6FA8'],['Store B',at[1]/T,'#B4531F'],['Store C',at[2]/T,'#3E8F6E']]) +
      means(`With λ = ${n(v.lam,1)}, ${['A','B','C'][at.indexOf(Math.max(...at))]} wins this neighborhood. Drop λ toward 1 (shoppers willing to drive) and the biggest store gains; raise it (fill-in trips, bad traffic) and the closest store gains.`);
   }})},

{ id:'queue', course:'r311', title:'Checkout staffing (Erlang C)',
  blurb:'How many lanes keep the line moving? See waits explode as utilization nears 100%.',
  mount: el => calc(el, { fields:[
    {k:'arr', l:'Shoppers reaching checkout per hour', v:150, s:1},
    {k:'svc', l:'Average service time (minutes)', v:3, s:0.1},
    {k:'c', l:'Lanes open', v:9, s:1}],
   out: v => {
    const lam=v.arr/60, mu=1/v.svc, c=Math.max(1,Math.round(v.c));
    const rows=[]; for(let k=Math.max(1,c-2); k<=c+2; k++){ const r=erlangC(lam,mu,k); rows.push([k,r]); }
    const cur=erlangC(lam,mu,c);
    return row('Utilization', pc(cur.rho,0), true) + row('Chance a shopper waits', cur.rho<1?pc(cur.pw,0):'100% — line grows without limit') +
      row('Average wait in line', isFinite(cur.wq)? n(cur.wq,1)+' min' : '∞', true) + row('Average people waiting', isFinite(cur.lq)? n(cur.lq,1) : '∞') +
      `<table class="mini"><tr><th>Lanes</th><th>Utilization</th><th>Avg wait</th></tr>${rows.map(([k,r])=>`<tr${k===c?' class="here"':''}><td>${k}</td><td>${pc(r.rho,0)}</td><td>${isFinite(r.wq)?n(r.wq,1)+' min':'∞'}</td></tr>`).join('')}</table>` +
      means(`Little’s law ties it together: people at the front end = arrivals per minute × minutes each spends. Near full utilization, one lane changes the wait dramatically — that is the non-linear heart of queueing.`);
   }})},

{ id:'reorder', course:'r321', title:'Reorder point, safety stock & newsvendor',
  blurb:'How much cushion does a shelf need? And how many loaves should the bakery make?',
  mount: el => calc(el, { fields:[
    {k:'d', l:'Average daily demand (units)', v:30, s:1}, {k:'sd', l:'Std. deviation of daily demand', v:8, s:0.5},
    {k:'L', l:'Lead time (days)', v:4, s:0.5}, {k:'sl', l:'Target service level (%)', v:95, s:0.5},
    {k:'price', l:'Perishable: price ($)', v:4.99, s:0.01}, {k:'cost', l:'Perishable: cost ($)', v:1.40, s:0.01},
    {k:'salv', l:'Perishable: salvage value if unsold ($)', v:0, s:0.01}, {k:'mean', l:'Perishable: average daily demand', v:40, s:1},
    {k:'psd', l:'Perishable: demand std. deviation', v:10, s:0.5}],
   out: v => {
    const z=zOf(v.sl/100), ss=z*v.sd*Math.sqrt(v.L), rop=v.d*v.L+ss;
    const cu=v.price-v.cost, co=v.cost-v.salv, cr=cu/(cu+co), q=v.mean+zOf(cr)*v.psd;
    return row('z for service level', n(z,2)) + row('Safety stock', n(Math.ceil(ss))+' units', true) + row('Reorder point', n(Math.ceil(rop))+' units', true) +
      row('Newsvendor critical ratio', pc(cr,0)) + row('Make / order this many', n(Math.round(q)), true) +
      means(`Safety stock grows with demand variability and with √(lead time), and it climbs steeply as service level approaches 100%. For the perishable, being short costs ${$f(cu,2)} and being over costs ${$f(co,2)}, so the right quantity aims to cover demand on ${pc(cr,0)} of days.`);
   }})},

{ id:'labor', course:'r331', title:'Labor productivity & workload',
  blurb:'Labor percent, sales per labor hour, and the hours a truck needs whatever the traffic.',
  mount: el => calc(el, { fields:[
    {k:'sales', l:'Weekly sales ($)', v:560000, s:1000}, {k:'hours', l:'Weekly labor hours', v:4800, s:10},
    {k:'wage', l:'Loaded cost per hour ($)', v:16.50, s:0.25}, {k:'cases', l:'Cases on this week’s trucks', v:1400, s:10},
    {k:'std', l:'Standard minutes per case', v:1.2, s:0.1}, {k:'turn', l:'Annual turnover (%)', v:70, s:1},
    {k:'heads', l:'Headcount', v:120, s:1}, {k:'cpd', l:'Cost per departure ($)', v:3500, s:100}],
   out: v => {
    const lab=v.hours*v.wage, sh=v.cases*v.std/60, dep=v.heads*v.turn/100;
    return row('Labor cost', $f(lab)) + row('Labor % of sales', pc(lab/v.sales), true) + row('Sales per labor hour', $f(v.sales/v.hours,2), true) +
      row('Stocking hours needed', n(sh,1)+' hrs') + row('…as share of all hours', pc(sh/v.hours)) +
      row('Departures per year', n(dep)) + row('Annual turnover cost', $f(dep*v.cpd), true) +
      means(`Labor is the cost a store manager controls most directly, but cutting it below the workload just moves the cost into lines, holes on the shelf and turnover. Halving turnover here would be worth ${$f(dep*v.cpd/2)} a year.`);
   }})},

{ id:'kpi', course:'r401', title:'KPI tree: what moved sales?',
  blurb:'Split a sales change into traffic, conversion, basket size and price.',
  mount: el => calc(el, { fields:[
    {k:'t0', l:'Last year: traffic', v:50000, s:100}, {k:'c0', l:'Last year: conversion (%)', v:92, s:0.5},
    {k:'i0', l:'Last year: items per basket', v:11, s:0.1}, {k:'p0', l:'Last year: avg item price ($)', v:3.60, s:0.01},
    {k:'t1', l:'This year: traffic', v:47500, s:100}, {k:'c1', l:'This year: conversion (%)', v:93, s:0.5},
    {k:'i1', l:'This year: items per basket', v:11.5, s:0.1}, {k:'p1', l:'This year: avg item price ($)', v:3.80, s:0.01}],
   out: v => {
    const s0=v.t0*v.c0/100*v.i0*v.p0, s1=v.t1*v.c1/100*v.i1*v.p1;
    const parts=[['Traffic',v.t1/v.t0],['Conversion',v.c1/v.c0],['Items/basket',v.i1/v.i0],['Price',v.p1/v.p0]];
    return row('Sales last year', $f(s0)) + row('Sales this year', $f(s1)) + row('Sales change', pc(s1/s0-1), true) +
      row('ATV last → this year', `${$f(v.c0?s0/(v.t0*v.c0/100):0,2)} → ${$f(s1/(v.t1*v.c1/100),2)}`) +
      parts.map(([k,x]) => row(`${k}: change`, (x>=1?'+':'')+pc(x-1))).join('') +
      row('Volume change (sales less price)', pc((s1/s0)/(v.p1/v.p0)-1), true) +
      means(`Read the tree, not the total. A sales gain driven by price and basket while traffic falls means fewer trips are coming — a problem the headline hides.`);
   }})},

{ id:'basket', course:'r401', title:'Basket affinity: support, confidence, lift',
  blurb:'Do two products really sell together, or is one just popular?',
  mount: el => calc(el, { fields:[
    {k:'N', l:'Total baskets', v:10000, s:100}, {k:'A', l:'Baskets with A', v:800, s:1},
    {k:'B', l:'Baskets with B', v:400, s:1}, {k:'AB', l:'Baskets with both', v:240, s:1}],
   out: v => {
    const sA=v.A/v.N, sB=v.B/v.N, conf=v.AB/v.A, lift=conf/sB;
    return row('Support(A)', pc(sA)) + row('Support(B)', pc(sB)) + row('Support(A and B)', pc(v.AB/v.N,2)) +
      row('Confidence A → B', pc(conf), true) + row('Lift', n(lift,2), true) +
      means(lift>1.2 ? `Shoppers who buy A are ${n(lift,1)}× as likely as the average shopper to buy B: a real affinity worth an adjacency or a cross-merchandised display.` : lift<0.8 ? `A and B appear together less than chance: they may be substitutes.` : `Lift is near 1: B is bought by A-buyers at about its normal rate. A high confidence number alone would have fooled you.`);
   }})},

{ id:'abtest', course:'r401', title:'Test vs. control (difference-in-differences)',
  blurb:'Estimate what a change really did by subtracting what happened anyway.',
  mount: el => calc(el, { fields:[
    {k:'tb', l:'Test stores: before ($/wk)', v:512000, s:1000}, {k:'ta', l:'Test stores: after ($/wk)', v:538000, s:1000},
    {k:'cb', l:'Control stores: before ($/wk)', v:498000, s:1000}, {k:'ca', l:'Control stores: after ($/wk)', v:513000, s:1000},
    {k:'gm', l:'Gross margin on extra sales (%)', v:28, s:0.5}, {k:'stores', l:'Stores that would get the change', v:60, s:1}],
   out: v => {
    const tg=v.ta/v.tb-1, cg=v.ca/v.cb-1, did=(v.ta-v.tb)-(v.ca-v.cb), didp=tg-cg;
    return row('Test growth', pc(tg)) + row('Control growth', pc(cg)) + row('Effect (points)', pc(didp), true) +
      row('Effect per store per week', $f(did), true) + row('Annual GP if rolled out', $f(did*52*v.gm/100*v.stores), true) +
      means(`The test stores grew ${pc(tg)}, but ${pc(cg)} of that happened in stores with no change. Only ${pc(didp)} can be credited to the change. Without a control group, everything else that happened would have been claimed as the effect.`);
   }})},
];

/* ============================================================
   PRICE SIMULATION
   A hidden constant-elasticity demand curve, with competitor
   promotions on some weeks. Profit-maximizing price for constant
   elasticity e (<-1) is cost × e/(1+e).
   ============================================================ */
function priceSim(el){
  let S;
  const fresh = () => {
    const e = -(1.6 + Math.random()*1.4);              // between −1.6 and −3.0
    const cost = 2.40;
    const ref = 3.99;
    const base = 400 + Math.round(Math.random()*200);   // units at the reference price
    const comp = new Set(); while(comp.size<2) comp.add(2+Math.floor(Math.random()*6));
    S = { e, cost, ref, base, comp, week:1, log:[] };
  };
  const demand = (p, w) => {
    const shock = 1 + (Math.sin(w*1.7 + S.base)*0.06);  // a little weekly noise, deterministic per game
    const compHit = S.comp.has(w) ? 0.78 : 1;            // rival on promo steals share
    return Math.max(0, Math.round(S.base * Math.pow(p/S.ref, S.e) * shock * compHit));
  };
  const paint = () => {
    const done = S.week > 8;
    const tot = S.log.reduce((a,r)=>a+r.gp,0);
    const pStar = S.cost * S.e/(1+S.e);
    let best = 0; for(let w=1; w<=8; w++){ const u=demand(pStar,w); best += (pStar-S.cost)*u; }
    el.innerHTML = `<div class="sim">
      <p class="hint">Unit cost is ${$f(S.cost,2)}. The usual shelf price in this market is ${$f(S.ref,2)}. Demand responds to your price with an elasticity you cannot see, and a competitor will run promotions on two weeks you do not know in advance. ${done?'':`<b>Week ${S.week} of 8.</b>`}</p>
      ${done ? '' : `<div class="sim-row"><label class="field"><span>Your price this week ($)</span><input type="number" id="ps-p" step="0.01" value="${S.log.length?S.log[S.log.length-1].p.toFixed(2):S.ref.toFixed(2)}"></label>
        <button class="btn" id="ps-go">Set price</button></div>`}
      <table class="mini"><tr><th>Week</th><th>Price</th><th>Units</th><th>Revenue</th><th>Gross profit</th><th>Note</th></tr>
      ${S.log.map(r=>`<tr><td>${r.w}</td><td>${$f(r.p,2)}</td><td>${n(r.u)}</td><td>${$f(r.p*r.u)}</td><td>${$f(r.gp)}</td><td>${r.note}</td></tr>`).join('')}
      </table>
      <div class="kv hi"><span>Total gross profit</span><b>${$f(tot)}</b></div>
      ${done ? `<div class="sim-end">
        <p><b>Reveal.</b> This product’s elasticity was <b>${n(S.e,2)}</b>. For constant elasticity, the profit-maximizing price is cost × e ÷ (1 + e) = <b>${$f(pStar,2)}</b>, which would have earned about <b>${$f(best)}</b> over 8 weeks. You captured <b>${pc(tot/best,0)}</b> of the best possible.</p>
        <p class="means"><b>What it means.</b> When demand is elastic, the best price is a fixed markup over cost that depends only on elasticity. Rivals’ promotions are weather you cannot control: cutting price to chase them usually just buys back units at a loss. Real retailers estimate elasticity from exactly this kind of week-to-week price variation.</p>
        <button class="btn" id="ps-new">Play a new product</button></div>` : ''}
    </div>`;
    const go = el.querySelector('#ps-go');
    if(go) go.onclick = () => {
      const p = parseFloat(el.querySelector('#ps-p').value);
      if(!(p>0)) return;
      const u = demand(p, S.week);
      S.log.push({ w:S.week, p, u, gp:(p-S.cost)*u, note: S.comp.has(S.week) ? 'rival promo' : '' });
      S.week++; paint();
    };
    const nw = el.querySelector('#ps-new'); if(nw) nw.onclick = () => { fresh(); paint(); };
  };
  fresh(); paint();
}

export const labById = id => LABS.find(l => l.id === id);
export { esc as escLab };
