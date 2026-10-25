/* RTL 331 — Operations, Labor and Service */

export default {
id:'r331', code:'RTL 331', color:'#8A6A2E',
title:'Operations, Labor & Service',
blurb:`The people side of the store. Labor as the biggest controllable cost, scheduling to traffic, the "good jobs" argument, service quality, and the daily discipline of store execution that turns a plan into a shelf.`,
units:[

{n:'8.1', title:'Labor: the biggest controllable cost', sub:'Labor percent, sales per labor hour, and scheduling to the traffic curve',
 goal:`Calculate labor productivity measures and explain how stores schedule labor against traffic and workload.`,
 lab:'labor',
 body:[
 `Rent is fixed for years; the cost of goods is negotiated by buyers far from the store. The cost a store manager controls most directly is <b>labor</b> — and in most supermarkets it is the largest operating expense. Managers watch it constantly through two measures: <b>labor as a percent of sales</b> (labor cost ÷ sales) and <b>sales per labor hour</b> (SPLH: sales ÷ hours worked).`,
 `Store labor has two very different parts. <b>Variable (customer-driven) work</b> rises and falls with shoppers: cashiering, deli and bakery service, pickup orders, bagging. <b>Fixed or semi-fixed (task-driven) work</b> must be done regardless of traffic: receiving trucks, stocking shelves, building displays, cleaning, price changes, opening and closing. Good scheduling matches variable labor to the <b>traffic curve</b> — the hour-by-hour pattern of shoppers — while pushing task work into slow periods (overnight stocking, mid-morning resets).`,
 `Chains use <b>labor standards</b> (engineered time per task: seconds per case stocked, per item scanned, per order picked) and <b>workforce management</b> software that forecasts traffic and workload by 15-minute interval and builds schedules. The arithmetic is simple: forecast the work, convert it to hours with the standards, and schedule people to cover it.`,
 `The trap is treating labor only as a cost. Too few hours show up somewhere else: longer lines (RTL 311), more out-of-stocks (RTL 321 found most are in-store causes), worse service, and higher turnover from overworked staff. The best managers ask "what does an extra hour here produce?" rather than "how do I cut hours?"`],
 ask:`Are there enough people where the shoppers are right now — and what are the other staff doing?`,
 terms:[
  ['Labor percent','Labor cost ÷ sales.'],
  ['Sales per labor hour (SPLH)','Sales ÷ total hours worked; a productivity measure.'],
  ['Traffic curve','The hour-by-hour (or 15-minute) pattern of shopper arrivals.'],
  ['Labor standard','An engineered time allowance for a task (e.g., seconds to stock one case).'],
  ['Workforce management (WFM)','Software and processes for forecasting workload and building schedules.'],
  ['Variable vs. task labor','Work driven by shopper volume versus work required regardless of traffic.']],
 math:{h:'Labor in numbers',
  f:[['Labor % = Labor cost ÷ Sales','The P&L view'],
     ['SPLH = Sales ÷ Labor hours','The productivity view'],
     ['Hours needed = Σ (Workload units × Standard minutes) ÷ 60','From forecast to schedule']],
  b:`A store does $560,000 a week with 4,800 labor hours at an average $16.50 loaded cost per hour. Labor = $79,200, or 14.1% of sales; SPLH = $116.67. If a truck brings 1,400 cases and the standard is 1.2 minutes per case, stocking needs 28 hours — 3.5 eight-hour shifts — whatever the traffic.`},
 kase:{kind:'hypo', h:'Saturday 11 a.m. versus Tuesday 3 p.m.',
  b:`Hypothetical. Traffic data shows Saturday 10 a.m.–1 p.m. averages 420 shoppers an hour; Tuesday 2–4 p.m. averages 110. The current schedule has nearly the same number of cashiers in both windows because staff requested consistent shifts. Re-planning shifts two cashier positions from Tuesday afternoon to Saturday late morning and moves Tuesday staff to stocking and a planogram reset. Total hours are unchanged; Saturday checkout waits fall, and the reset that had been postponed for three weeks gets done.`,
  src:[]},
 field:`Visit the same store at a busy time and a quiet time. Count staff by role (cashier, stocker, deli/bakery, manager, picker) and count shoppers. Calculate shoppers per cashier in each window. Does the store flex staff with traffic, or keep a flat schedule?`,
 check:{q:`Why should a store schedule shelf stocking overnight or mid-morning rather than at the evening peak?`,
  a:`Because stocking is task-driven work that must be done regardless of traffic, while cashiering and service are customer-driven. Doing tasks during slow periods frees labor for customer-facing work at peak, avoids carts and pallets blocking busy aisles, and keeps shelves full before the rush.`},
 qs:[
  ['$480,000 of weekly sales with 4,000 labor hours gives SPLH of:',['$12','$120','$1,200','$83'],1,'480,000 ÷ 4,000 = $120.'],
  ['Which is task-driven (largely independent of traffic) work?',['Cashiering','Receiving a truck','Deli service','Bagging'],1,'The truck arrives regardless of shoppers.'],
  ['Cutting labor hours below what the workload needs often shows up as:',['Higher margins only','Longer lines, more out-of-stocks and worse service','Lower rent','More vendor funding'],1,'The cost moves elsewhere.']],
 read:['lumen','blsRetail','mosby']},

{n:'8.2', title:'The good jobs strategy', sub:'Why some retailers pay more, staff more, and still win on price',
 goal:`Summarize Zeynep Ton's good-jobs argument and the operational choices that make it work.`,
 body:[
 `The conventional retail model treats store labor as a cost to minimize: low wages, part-time hours, high turnover, minimal training. Zeynep Ton, then at MIT Sloan, challenged this in her 2012 Harvard Business Review article "Why 'Good Jobs' Are Good for Retailers" and her 2014 book <i>The Good Jobs Strategy</i>. She studied retailers — including Costco, QuikTrip, Trader Joe's and the Spanish grocer Mercadona — that paid better, offered more stable hours and invested in training, while still offering low prices and earning strong returns.`,
 `Ton's argument is that <b>understaffing is a hidden tax</b>: it causes out-of-stocks, errors, poor service and turnover, which cost sales and money. Her key point is that good jobs only pay off when combined with specific <b>operational choices</b>: (1) <b>offer less</b> — fewer SKUs and fewer promotions, so work is simpler and more predictable; (2) <b>standardize and empower</b> — standard processes for routine work, with employee discretion where it matters; (3) <b>cross-train</b> — employees who can do several jobs move to where the work is, absorbing traffic swings; (4) <b>operate with slack</b> — schedule slightly more labor than the minimum so there is time to fix problems and serve customers.`,
 `<b>Turnover</b> is expensive. When an employee leaves, the store pays for recruiting, hiring, training and the low productivity of a new hire, plus errors along the way. The exact cost per departure varies widely; even modest estimates, multiplied by high annual turnover rates, add up to a large sum. Lower turnover also means employees who know the store, the regular customers, and where the back stock is.`,
 `The strategy is not a guarantee: it requires discipline in assortment and operations, and it is easier for some formats than others. But it is a useful lens on any store: <i>is labor being treated as a cost to cut or as a capability to build?</i>`],
 ask:`Does this store have enough well-trained people to fix problems before I notice them?`,
 terms:[
  ['Good jobs strategy','Combining investment in employees (pay, hours, training) with operational choices that make them productive.'],
  ['Employee turnover','The rate at which employees leave and must be replaced, usually annual.'],
  ['Cross-training','Training employees for several roles so they can move to where work is needed.'],
  ['Operating slack','Scheduling a little more capacity than the minimum, to absorb variability.'],
  ['Phantom savings','Cost cuts that show up on the labor line but create larger losses elsewhere.']],
 math:{h:'The cost of turnover',
  f:[['Annual turnover cost = Departures × Cost per departure','Recruiting, training, lost productivity'],
     ['Turnover rate = Departures in year ÷ Average headcount','Often very high in retail']],
  b:`A store has 120 employees and 75% annual turnover: 90 departures. If each departure costs $3,500 (recruiting, hiring, training hours and lower productivity — an assumption to test with your own data), turnover costs $315,000 a year. Halving turnover saves about $157,500 — enough to fund a $1-an-hour raise for roughly 75 full-time workers (fewer once payroll taxes are added). The numbers rarely settle the debate on their own, but they show why it is a real debate.`},
 kase:{kind:'fact', h:'Ton’s retailers',
  b:`In her 2012 HBR article, Ton argued that retailers such as Costco, QuikTrip, Trader Joe's and Mercadona invested more in employees than typical competitors while achieving low prices, strong sales per employee and solid profits. She attributed their success not to higher pay alone but to the combination with operational choices — limited assortment, standardization with empowerment, cross-training and slack. Her claims have been debated (critics point to selection effects and to retailers that pay well and still struggle), which makes it a good case for discussion rather than a settled law.`,
  src:['ton','tonBook','goodJobs']},
 field:`In two stores of different chains, look for signs of each of Ton's four choices: a limited assortment, standardized processes (consistent layouts, clear signage), cross-trained staff (a cashier who also stocks), and slack (staff with time to help you). Ask one employee a question that requires store knowledge and compare the answers.`,
 check:{q:`According to Ton, why does higher pay alone not guarantee better results?`,
  a:`Because the payoff comes from combining investment in people with operational choices that make them productive: offering fewer products and promotions, standardizing routine work while empowering employees, cross-training, and operating with some slack. Without those choices, higher pay raises costs without changing how the store runs.`},
 qs:[
  ['Which is one of Ton’s four operational choices?',['Offer more SKUs','Cross-train employees','Run more promotions','Minimize scheduled hours'],1,'Cross-training lets staff move to where work is.'],
  ['Operating with slack means:',['Running with fewer staff than needed','Scheduling a bit more capacity than the minimum to absorb variability','Paying lower wages','Closing early'],1,'Slack gives time to fix problems and serve.'],
  ['A store with 100 employees and 60 departures a year has a turnover rate of:',['6%','40%','60%','160%'],2,'60 ÷ 100 = 60%.']],
 read:['ton','tonBook','goodJobs','blsRetail']},

{n:'8.3', title:'Service quality', sub:'SERVQUAL’s five dimensions, moments of truth and recovering from failure',
 goal:`Use the SERVQUAL dimensions to analyze service in a store and explain service recovery.`,
 body:[
 `Service is hard to measure because it is intangible and produced in the moment. The most widely used framework, <b>SERVQUAL</b>, developed by A. Parasuraman, Valarie Zeithaml and Leonard Berry (1988), identifies five dimensions that customers use to judge service: <b>Reliability</b> (doing what was promised, accurately — the price on the tag rings up at the register); <b>Assurance</b> (knowledge and courtesy that inspire trust — the pharmacist who explains a drug interaction); <b>Tangibles</b> (physical facilities, equipment, appearance — clean restrooms, working carts); <b>Empathy</b> (individual attention — a cashier who remembers a regular); and <b>Responsiveness</b> (willingness to help promptly — opening a lane when lines build). A memory aid: <b>RATER</b>.`,
 `The core idea of SERVQUAL is the <b>gap</b>: service quality is perceived performance minus expectations. A convenience store and a luxury department store can both deliver "good" service if each meets the expectations of its own customers. Expectations come from price, format, past experience, and what the store promises in its advertising.`,
 `Every interaction where a customer forms an impression is a <b>moment of truth</b>: finding a parking spot, asking where an item is, a deli order, a price that rings up wrong, a return. Stores cannot script every moment, which is why employee training and discretion matter (RTL 331.2).`,
 `When service fails, how the store responds matters a great deal. <b>Service recovery</b> — acknowledging the problem, fixing it quickly, and often adding something (a coupon, the item free) — can restore satisfaction. Some research describes a "service recovery paradox," in which customers whose problem was resolved well end up more satisfied than if nothing had gone wrong; later studies find the effect inconsistent, so treat it as a possibility, not a strategy. Many grocers have <b>scan-accuracy policies</b> (if an item rings up higher than the shelf price, the customer gets it free or at a discount) — a public promise that makes reliability visible and gives staff a scripted recovery.`],
 ask:`Which of the five service dimensions is this store investing in, and which is it skipping?`,
 terms:[
  ['SERVQUAL','A framework measuring service quality across five dimensions as the gap between expectations and perceptions.'],
  ['RATER','Reliability, Assurance, Tangibles, Empathy, Responsiveness.'],
  ['Moment of truth','Any interaction where a customer forms an impression of the business.'],
  ['Service recovery','Actions taken to fix a service failure and restore customer satisfaction.'],
  ['Service gap','The difference between what customers expect and what they perceive they received.']],
 kase:{kind:'hypo', h:'The price that rang up wrong',
  b:`Hypothetical. A shopper's cereal rings up at $5.49 although the shelf tag says $3.99. Store A's cashier says, "That's what the system says," and calls a manager; the shopper waits four minutes and leaves irritated. Store B's cashier apologizes, honors the tag immediately under the store's posted scan-accuracy policy, and flags the tag for correction. Same failure, opposite moments of truth. Store B's policy turned a reliability failure into a demonstration of reliability.`,
  src:[]},
 field:`During one shopping trip, score the store 1–5 on each RATER dimension, with one specific example for each. Ask an employee where to find a specific item and note the response (did they walk you there, point, or guess?).`,
 check:{q:`Why can a convenience store and a high-end department store both have "high service quality" under SERVQUAL?`,
  a:`Because SERVQUAL measures quality as the gap between expectations and perceptions. Each store's customers have different expectations; a convenience store that is fast, clean and reliable can exceed its customers' expectations just as a department store with expert, attentive staff exceeds its customers'.`},
 qs:[
  ['In SERVQUAL, "doing what was promised, accurately" is:',['Assurance','Reliability','Tangibles','Empathy'],1,'Reliability: the promise kept.'],
  ['Clean restrooms and working carts relate to which dimension?',['Tangibles','Empathy','Responsiveness','Assurance'],0,'Physical evidence of service.'],
  ['A scan-accuracy policy is mainly a promise about:',['Empathy','Reliability, with a built-in recovery','Tangibles','Atmospherics'],1,'It guarantees the price and scripts the fix.']],
 read:['servqual','lumen','osm18']},

{n:'8.4', title:'Store execution', sub:'From the plan in the office to the shelf in the aisle',
 goal:`Explain why execution gaps happen and how retailers measure and improve store execution.`,
 body:[
 `A chain's headquarters can design a perfect planogram, price list and promotion. None of it matters until a person in the store makes it real: the tag hung, the display built, the reset done, the product on the shelf. The gap between the plan and the shelf is <b>execution</b>, and it is one of the main differences between good and mediocre stores in the same chain.`,
 `Common execution failures: <b>planogram non-compliance</b> (items in the wrong place, wrong facings), <b>price-tag errors</b> (the shelf says one thing, the register another), <b>promotions not set</b> (the item is in the ad but there is no sign or display), <b>out-of-stocks with product in the back room</b>, and missed <b>food-safety</b> tasks (temperature logs, date checks, rotation).`,
 `Retailers measure execution with <b>store audits</b> (district managers or third parties walking the store with a checklist), <b>compliance photos</b>, <b>mystery shoppers</b>, and, increasingly, technology: shelf-scanning robots and cameras (RTL 321.3) check planogram compliance and tag accuracy automatically. Each store gets a scorecard alongside its sales and labor numbers.`,
 `Improving execution is mostly about <b>workload and communication</b>. Headquarters sends stores a steady stream of tasks — price changes, resets, signs, recalls, training. When the total exceeds the hours available, some do not get done, and stores triage. Well-run chains measure the labor each task requires, limit and schedule what they send, and give stores clear priorities. Some of the most effective improvements are boring: fewer, better-scheduled tasks; checklists; and a manager who walks the store every morning.`],
 ask:`Does this aisle look the way someone in an office intended it to look — and if not, what got in the way?`,
 terms:[
  ['Store execution','How faithfully and consistently a store carries out plans for merchandising, pricing, promotions and operations.'],
  ['Planogram compliance','The degree to which shelves match the assigned planogram.'],
  ['Store audit','A structured inspection of a store against standards.'],
  ['Mystery shopper','A person hired to shop anonymously and report on the experience.'],
  ['Task management','Systems for sending, scheduling and tracking headquarters tasks in stores.']],
 kase:{kind:'hypo', h:'Monday’s 140 tasks',
  b:`Hypothetical. A chain's stores receive an average of 140 headquarters tasks a week: price changes, ad signs, two planogram resets, a product recall, a training video, a seasonal set. An analyst estimates they require 210 labor hours; stores have about 150 hours of discretionary time. Audits show resets 40% complete and ad signs missing in a third of stores. The chain introduces a weekly "task budget" by store, staggers resets across weeks, and bundles price changes. Compliance rises without adding hours.`,
  src:[]},
 field:`Pick five items from this week's ad. In the store, check each: is the item there, is the promotional price on the tag, is there a sign, does it ring up correctly (if you buy it)? Score the store's ad execution as a percentage.`,
 check:{q:`Why might a well-designed headquarters promotion fail in many stores, even when staff are capable?`,
  a:`Because execution depends on available labor and clear priorities. If headquarters sends more tasks than stores have hours to complete, stores must triage, and some tasks — signs, displays, resets — are skipped or done late. Execution failures are often workload and communication problems rather than effort problems.`},
 qs:[
  ['A shelf whose items do not match the assigned layout shows poor:',['Turnover','Planogram compliance','Service recovery','Price image'],1,'Planogram compliance is a core execution metric.'],
  ['Which is a common cause of execution gaps?',['Too few planograms','Headquarters tasks exceeding store labor hours','Too much vendor funding','Low prices'],1,'Workload beyond capacity forces triage.'],
  ['Shelf-scanning robots support execution mainly by:',['Pricing items','Automatically detecting gaps, misplacements and tag errors','Replacing cashiers','Running promotions'],1,'They audit the shelf.']],
 read:['lumen','schnucksTally','mosby']},
],

assign:{ title:'Assignment 8 — Staff the store',
 brief:`A hypothetical store. Average loaded labor cost is $17.00 per hour.
 <table><tr><th>Day part</th><th>Shoppers / hr</th><th>Cashiers scheduled</th></tr>
 <tr><td>7–11 a.m.</td><td class="n">90</td><td class="n">4</td></tr>
 <tr><td>11 a.m.–4 p.m.</td><td class="n">160</td><td class="n">5</td></tr>
 <tr><td>4–7 p.m.</td><td class="n">300</td><td class="n">6</td></tr>
 <tr><td>7–10 p.m.</td><td class="n">110</td><td class="n">5</td></tr></table>
 Each checkout averages 3 minutes, so one lane can serve 20 shoppers an hour.`,
 items:[
  {t:'num', q:'At 4–7 p.m., what is checkout utilization with 6 lanes? (percent)', a:250, tol:0.5, unit:'%', why:'Capacity 6 × 20 = 120/hr; demand 300/hr; 300 ÷ 120 = 250%. Lines grow without limit (self-checkout and other lanes must be absorbing some of it).'},
  {t:'num', q:'Minimum lanes needed at 4–7 p.m. to keep utilization at or below 85%?', a:18, tol:0, unit:'lanes', why:'300 ÷ 20 = 15 lanes at 100%; 15 ÷ 0.85 = 17.6, so 18 lanes (in practice, a mix of staffed and self-checkout).'},
  {t:'num', q:'At 7–11 a.m., utilization with 4 lanes? (percent)', a:112.5, tol:0.5, unit:'%', why:'90 ÷ 80 = 112.5%. Even the quiet morning is understaffed on paper — unless many shoppers use self-checkout.'},
  {t:'num', q:'A truck of 1,800 cases arrives. At 1.5 minutes per case, how many labor hours does stocking need?', a:45, tol:0.1, unit:'hours', why:'1,800 × 1.5 = 2,700 minutes = 45 hours.'},
  {t:'num', q:'The store has 90 employees and 54 departures last year. If each departure costs $4,000, what did turnover cost?', a:216000, tol:10, unit:'$', why:'54 × $4,000 = $216,000 (60% turnover).'},
  {t:'text', q:'Recommend how to re-plan the cashier schedule using the table, in 3–4 sentences. Consider self-checkout, cross-training and Maister.', model:`A good answer shifts cashier hours toward 4–7 p.m. (the peak, which is massively under capacity) from slower windows like 7–10 p.m., uses cross-trained stockers and managers as a flex pool to open lanes when lines build, and directs small baskets to self-checkout and express lanes at peak. It may propose moving task work out of the peak, measuring actual waits, and applying Maister’s principles (occupied, visible, fair waits; a single line feeding lanes).`}
 ]},

field:{ id:'f331', title:'Field assignment 8 — Staffing pattern', tool:'tally',
 where:'The same store at a busy and a quiet time.', time:'20 minutes per visit',
 brief:`See whether the store flexes labor with traffic. Use tally counters for shoppers entering and for staff by role.`,
 steps:[`On each visit, count shoppers entering for 10 minutes (tally).`,`Walk the store once and count staff by role.`,`Note open lanes vs. self-checkout use.`,`Note what non-cashier staff are doing.`],
 fields:[
  {k:'store', l:'Store', t:'text'},
  {k:'busy', l:'Busy visit: time, shoppers per 10 min, staff by role', t:'area'},
  {k:'quiet', l:'Quiet visit: time, shoppers per 10 min, staff by role', t:'area'},
  {k:'ratio', l:'Shoppers per cashier at each time', t:'text'},
  {k:'rater', l:'RATER scores (1–5) and one example each', t:'area'}],
 reflect:[`Did the store flex staffing, or keep it flat? What would you change?`,`Which of Ton’s four operational choices did you see evidence of?`]},

quiz:[
 ['Labor % = $72,000 labor ÷ $600,000 sales =',['1.2%','8.3%','12%','83%'],2,'72,000 ÷ 600,000 = 12%.'],
 ['RATER stands for:',['Revenue, Assets, Turns, Expenses, Returns','Reliability, Assurance, Tangibles, Empathy, Responsiveness','Rent, Advertising, Taxes, Energy, Repairs','Retail, Atmosphere, Traffic, Endcaps, Range'],1,'The SERVQUAL dimensions.'],
 ['Which of these is most clearly a store execution failure?',['A promoted item with no sign or display','A lower price at a competitor','A slow week due to weather','A vendor raising cost'],0,'The plan existed; the store did not carry it out.'],
]
};
