/* RTL 301 — Merchandising and Category Management */

export default {
id:'r301', code:'RTL 301', color:'#5E7C4E',
title:'Merchandising & Category Management',
blurb:`What goes on the shelf, how much of it, where, and why. Assortment breadth and depth, category roles, private label, planograms and shelf space, endcaps and displays — the craft of turning finite space into margin.`,
units:[

{n:'5.1', title:'Assortment: breadth, depth and the cost of a SKU', sub:'Why Aldi carries a fraction of what a supermarket does, and why both can be right',
 goal:`Describe assortment in terms of breadth and depth, list the hidden costs of each SKU, and explain the trade-offs behind large and limited assortments.`,
 body:[
 `<b>Assortment breadth</b> (or width) is how many different categories a store carries — groceries only, or groceries plus pharmacy, garden, electronics and clothing. <b>Assortment depth</b> is how many choices it carries within a category — four ketchups or twenty-four. A supercenter is broad; a specialty spice shop is narrow and deep; a convenience store is fairly broad and very shallow.`,
 `Each SKU carries costs that are easy to miss: the shelf space it occupies (which could hold something else), the inventory investment, ordering and receiving work, price-tag and planogram maintenance, the chance it goes out of date, and the complexity it adds to every system. More SKUs also <b>fragment</b> demand: twenty ketchups each sell less than four would, so each one turns more slowly and is harder to keep in stock.`,
 `Against those costs sits <b>choice value</b>: shoppers with specific needs (gluten-free, a particular brand, a family size) may switch stores if their item disappears. A useful distinction: some SKUs are <b>redundant</b> (shoppers would happily buy a near-identical alternative), while others are <b>unique</b> (their buyers would leave the category or the store). Removing redundant SKUs usually costs little; removing unique ones can cost a whole basket.`,
 `<b>Limited-assortment</b> retailers such as Aldi build their whole model on this logic: a small number of items per category, mostly exclusive brands, products displayed in their shipping cases, and a small store that needs few staff. Fewer SKUs mean higher volume per item, lower costs and lower prices. Conventional supermarkets choose the opposite trade, using breadth and depth as part of their value. <b>SKU rationalization</b> — periodically pruning redundant, slow-selling items — is how the broad-assortment retailers stop the long tail from eating their margin.`],
 ask:`If this item disappeared tomorrow, would its buyers switch to the one beside it, or would they leave?`,
 terms:[
  ['Assortment breadth','The number of different categories or product lines a store carries.'],
  ['Assortment depth','The number of options (brands, sizes, varieties) within a category.'],
  ['SKU rationalization','Removing redundant or unproductive SKUs to cut cost and complexity.'],
  ['Demand transference','When a removed SKU’s sales move to other items in the store rather than disappearing.'],
  ['Long tail','The many slow-selling items that together can make up a meaningful share of sales or of cost.'],
  ['Exclusive brand','A product sold only by one retailer, often private label.']],
 kase:{kind:'hypo', h:'Cutting the ketchup set',
  b:`Hypothetical. A store carries 22 ketchup SKUs. The bottom 8 together are 6% of category sales but take 30% of the shelf. The category manager removes 6 that are near-duplicates of better sellers (same brand, a slightly different size) and keeps 2 that are unique (an organic and a no-sugar version with loyal buyers). Category sales fall 1%, because almost all of the removed items' sales transfer to remaining SKUs, while out-of-stocks on the top sellers drop because they now have more facings. Gross profit for the category rises.`,
  src:[]},
 field:`Choose one category (pasta sauce, cereal, toothpaste). At two stores of different formats, count the SKUs and the brands. For the bigger set, identify three SKUs you think are redundant and one you think is unique, and say why.`,
 check:{q:`What is the difference between a redundant and a unique SKU, and why does it matter for assortment cuts?`,
  a:`A redundant SKU has close substitutes its buyers will accept, so if it is cut most of its sales transfer to other items. A unique SKU's buyers have no acceptable substitute, so cutting it loses the sale and possibly the shopper's whole basket. Cuts should target redundant SKUs and protect unique ones.`},
 qs:[
  ['A store with many categories but few choices in each has:',['Narrow, deep assortment','Broad, shallow assortment','Narrow, shallow assortment','Broad, deep assortment'],1,'Breadth = categories; depth = choices within.'],
  ['Which is NOT a cost of adding a SKU?',['Shelf space it occupies','Inventory investment','Planogram maintenance','The manufacturer’s advertising budget'],3,'The manufacturer’s ad budget is not the retailer’s cost.'],
  ['When a removed item’s sales move to other items in the store, this is called:',['Cannibalization','Demand transference','Halo','Breakage'],1,'Demand transference is why rationalization often costs little.']],
 read:['lumen','osm18','mosby']},

{n:'5.2', title:'Category management', sub:'Running each category like a small business, with a role and a plan',
 goal:`Explain category management, assign category roles, and outline the category-management process.`,
 body:[
 `<b>Category management</b> treats each product category — salty snacks, laundry, pet food — as a strategic business unit with its own goals, P&L and plan, managed from the shopper's point of view. It became widespread in grocery in the 1990s, promoted through the Efficient Consumer Response (ECR) movement and consultants such as The Partnering Group, whose eight-step process is still the reference model.`,
 `The steps, in plain English: (1) <b>define</b> the category as shoppers see it (is "breakfast" cereal, or cereal plus bars plus frozen waffles?); (2) assign its <b>role</b>; (3) <b>assess</b> its performance against the market; (4) set <b>scorecard</b> targets (sales, margin, share, turns); (5) choose <b>strategies</b> (build traffic, build basket, generate profit, defend turf, create excitement); (6) choose <b>tactics</b> — assortment, pricing, promotion, shelf placement, supply; (7) <b>implement</b>; (8) <b>review</b>.`,
 `Category <b>roles</b> are the most useful idea to carry into a store. A <b>destination</b> category defines the store and is a reason to choose it (for many supermarkets, produce or fresh meat). A <b>routine</b> category is bought regularly and should be competitive and reliable (paper goods, canned goods). An <b>occasional/seasonal</b> category matters at specific times (grilling, back-to-school, holiday baking). A <b>convenience</b> category completes the trip; shoppers do not choose the store for it, so it can often earn higher margins (batteries, greeting cards). Role drives everything: how much space, how sharp the prices, how deep the assortment.`,
 `Many retailers name a leading manufacturer as <b>category captain</b> to help with analysis and planograms. That brings expertise and data, but also an obvious conflict of interest: the captain's recommendations could favor its own brands or disadvantage competitors. Antitrust authorities, including the FTC, have discussed these risks, and careful retailers use a validator (a second supplier checking the work) and keep final decisions in-house.`],
 ask:`What role does this category play for this store — is it the reason I came, or something I picked up on the way?`,
 terms:[
  ['Category management','Managing product categories as business units, with roles, scorecards and plans built around shopper needs.'],
  ['Category role','The strategic purpose of a category for the retailer: destination, routine, occasional/seasonal, convenience.'],
  ['Destination category','A category that defines the store and drives store choice.'],
  ['Category captain','A manufacturer that advises the retailer on a category’s assortment, pricing and planograms.'],
  ['Category scorecard','The set of targets for a category: sales, margin, share, turns, out-of-stocks.'],
  ['ECR','Efficient Consumer Response: a 1990s grocery-industry movement to improve supply chains and category management.']],
 kase:{kind:'hypo', h:'Two stores, one category, two roles',
  b:`Hypothetical. In a supermarket next to a university, frozen pizza is a destination category: students choose the store partly for its frozen aisle. There it gets two full doors more than the chain standard, aggressive weekly pricing, and many varieties. In the same chain's suburban store, frozen pizza is routine: competitive prices, a solid core set, fewer facings, and its extra space goes to fresh meal solutions instead. Same category, same chain, different role — so different space, assortment and price decisions.`,
  src:[]},
 field:`In one supermarket, pick four categories you think represent the four roles (destination, routine, seasonal, convenience). For each, note the amount of space, the number of options, how prices compare with the store's average feel, and where it is placed. Does space and placement match the role you assigned?`,
 check:{q:`Why might a convenience category such as batteries carry higher margins than a routine category such as paper towels?`,
  a:`Because shoppers do not choose a store for its batteries and rarely compare battery prices across stores; they buy them because they are there when needed. Paper towels are bought regularly, prices are visible and compared, and they affect price image, so they must be priced competitively. Role determines price sensitivity and therefore margin.`},
 qs:[
  ['A category that defines the store and is a reason shoppers choose it is a:',['Convenience category','Routine category','Destination category','Seasonal category'],2,'Destination categories drive store choice.'],
  ['The first step of the classic category-management process is to:',['Set prices','Define the category from the shopper’s view','Build planograms','Choose a captain'],1,'Definition comes first: what belongs together in shoppers’ minds.'],
  ['A main concern with category captains is:',['They lack data','Conflict of interest favoring their own brands','They are too expensive','They do not understand shoppers'],1,'Hence validators and retailer control of final decisions.']],
 read:['lumen','mosby','osm18']},

{n:'5.3', title:'Private label', sub:'Store brands, tiers, and the margin hiding in plain sight',
 goal:`Explain why retailers develop private-label brands, how tiers work, and how private label changes negotiations with national brands.`,
 body:[
 `<b>Private label</b> (store brand, own brand) products are sold under the retailer's own brand — Kirkland Signature at Costco, Great Value at Walmart, Good & Gather at Target, Kroger and Simple Truth at Kroger, Schnucks-brand products at Schnucks. They are usually made by contract manufacturers, sometimes the same companies that make national brands.`,
 `Retailers like private label for several reasons. <b>Margin</b>: even at a lower shelf price, a store brand often earns a higher percentage margin, because the retailer is not paying for the national brand's advertising and brand premium. <b>Differentiation</b>: a store brand is exclusive, so shoppers cannot compare its price at a competitor. <b>Loyalty</b>: a shopper who loves Kirkland products has a reason to be a Costco member. <b>Negotiating power</b>: a credible store-brand alternative strengthens the retailer's hand with national brands.`,
 `Most large retailers use <b>tiers</b>: a <b>value</b> tier (lowest price, basic packaging), a <b>mainstream</b> tier (comparable to national brands at a lower price), and a <b>premium</b> tier (organic, specialty or "chef" lines that compete on quality, not just price). Premium tiers let a store brand earn trust and margin, instead of being only "the cheap option."`,
 `Private label is also a placement game. Retailers commonly shelve the store brand directly beside the leading national brand, with a shelf tag that invites comparison of unit prices. The national brand creates the reference point; the store brand captures the shopper who is willing to switch. Industry groups such as the Private Label Manufacturers Association track store-brand share; remember that a trade association's figures are useful but come from an interested party.`],
 ask:`Where is the store brand sitting relative to the national brand, and what comparison is the shelf inviting me to make?`,
 terms:[
  ['Private label (store brand)','Products sold under the retailer’s own brand name.'],
  ['National brand','A manufacturer’s brand sold by many retailers (e.g., Heinz, Tide).'],
  ['Contract manufacturer','A company that produces goods to another company’s specifications and brand.'],
  ['Good/better/best tiers','Value, mainstream and premium levels within a private-label program.'],
  ['Brand premium','The extra price shoppers pay for a brand’s perceived quality or image.']],
 math:{h:'Lower price, higher margin',
  f:[['Margin % = (Price − Cost) ÷ Price','Same formula, different inputs'],
     ['Margin $ per unit vs. margin % — compare both','A cheaper item can earn more %, fewer $']],
  b:`National brand: price $4.29, cost $3.20 → margin $1.09 (25.4%). Store brand: price $3.49, cost $2.10 → margin $1.39 (39.8%). The store brand is $0.80 cheaper for the shopper and earns the retailer $0.30 more per unit. Every switcher is a win-win in the store's view — which is exactly why the two sit side by side.`},
 kase:{kind:'fact', h:'Kirkland Signature and the membership loop',
  b:`Costco's 10-K describes its private-label Kirkland Signature line as a significant and growing part of sales, intended to offer quality at lower prices than comparable national brands. In the club model, an exclusive brand does double duty: it lowers prices without reducing margins on those items, and it gives shoppers products they can only get with a membership. Read the "Merchandise" section of any recent Costco 10-K to see how the company itself describes the strategy.`,
  src:['cost10k','plma']},
 field:`In three categories, find the store brand and the leading national brand side by side. Record shelf price, unit price, size, and position (left/right, eye level or not). Compute the price gap in percent. Look for a premium store-brand tier anywhere in the store.`,
 check:{q:`A store brand sells for less than the national brand beside it but earns the retailer more per unit. How is that possible?`,
  a:`Its cost is lower, because the retailer is not paying for the national brand's advertising, brand premium and trade margin; the retailer contracts production directly. The lower cost leaves room for both a lower shelf price and a larger margin.`},
 qs:[
  ['Which is a reason retailers develop private label?',['To raise prices on national brands','Higher margins, differentiation and negotiating power','To reduce assortment breadth','Because manufacturers require it'],1,'All three are standard reasons.'],
  ['A premium private-label tier (e.g., organic store brand) mainly competes on:',['Lowest price only','Quality and specialty appeal','Packaging size','Coupons'],1,'Premium tiers build trust and margin beyond price.'],
  ['Store brands are often shelved right next to the leading national brand to:',['Hide them','Invite direct comparison using the national brand as a reference','Satisfy regulations','Reduce shrink'],1,'The national brand anchors the comparison.']],
 read:['lumen','plma','cost10k']},

{n:'5.4', title:'Planograms and shelf space', sub:'Facings, eye level, blocking, and how much a foot of shelf is worth',
 goal:`Read a planogram, explain the main shelf-placement rules, and compute profit per foot of shelf space.`,
 lab:'space',
 body:[
 `A <b>planogram</b> is a diagram that shows exactly where each item goes on a shelf section: which shelf, how many <b>facings</b> (units visible across the front), and in what order. Chains build planograms centrally and stores "reset" sections to match them. Planograms balance three goals: sales and margin, shopper navigation, and operational efficiency (enough product on the shelf to last between restocks).`,
 `Placement rules of thumb are widely used. <b>Eye level is buy level</b>: the shelves between roughly waist and eye height tend to sell best, so they go to high-margin or high-volume items (and often to products whose vendors pay for the position). Lower shelves hold bulk and heavy items; children's products sometimes sit lower, at their eye level. Products are <b>blocked</b> — grouped vertically by brand or by segment (all the salsas by heat level, or all of one brand together) — depending on how shoppers decide in that category. Shoppers who choose brand first want brand blocks; shoppers who choose type first (decaf vs. regular) want segment blocks.`,
 `How much does more space help? Less than you'd think. Martin Eisend's 2014 meta-analysis of 1,268 estimates found an average <b>shelf-space elasticity</b> of about 0.17: a 10% increase in an item's space raises its unit sales by about 1.7% on average. Space matters most for impulse items and least for planned staples. The main reason to give a fast seller more facings is often <b>days of supply</b> — enough product on the shelf to avoid going empty between deliveries — rather than visibility.`,
 `Merchandisers judge space with productivity measures: <b>sales per linear foot</b>, <b>gross profit per linear foot</b>, and GMROI. A category earning far more gross profit per foot than the one beside it is a candidate for more space. The Space Lab lets you reallocate a hypothetical aisle and see the effect.`],
 ask:`Who is at eye level here, and is it there because it sells best, earns most, or paid most?`,
 terms:[
  ['Planogram','A diagram specifying the exact placement, facings and order of products on a shelf section.'],
  ['Facing','One product unit visible at the front of the shelf; an item with 3 facings shows 3 units across.'],
  ['Reset','Rearranging a shelf section to a new planogram.'],
  ['Blocking','Grouping products vertically by brand, type, or another shopper-relevant attribute.'],
  ['Shelf-space elasticity','% change in unit sales ÷ % change in shelf space.'],
  ['Linear foot','A one-foot length of shelf, the standard unit for measuring space.'],
  ['Days of supply on shelf','Units on the shelf ÷ average daily unit sales; how long until it empties.']],
 math:{h:'Space productivity',
  f:[['GP per linear foot = Category gross profit ÷ Linear feet','Productivity of space'],
     ['Days of supply on shelf = Shelf capacity ÷ Daily unit sales','Do you have enough on the shelf?'],
     ['Expected sales change ≈ Space elasticity × % space change','With Eisend’s average, about 0.17']],
  b:`Salty snacks: $260,000 annual GP on 48 ft = $5,417/ft. Canned vegetables: $72,000 on 32 ft = $2,250/ft. Moving 4 ft from vegetables to snacks raises snack space 8.3%. With a 0.17 elasticity, snack sales rise ~1.4% (+$3,700 GP); vegetables lose 12.5% of space, so about 2.1% of sales (−$1,500 GP). Net +$2,200 a year — if the vegetables still have enough days of supply to avoid empty shelves.`},
 kase:{kind:'fact', h:'What a meta-analysis says about space',
  b:`Eisend (2014), Journal of Retailing, pooled 1,268 shelf-space elasticity estimates and found an average of 0.17, with variation by product type: higher for impulse products, lower for staples. He also found that space increases tend to show larger effects than space reductions. It is a good antidote to the intuition that "double the facings, double the sales."`,
  src:['eisend']},
 field:`Choose one 4-foot shelf section. Sketch it: shelves, brands, facings. Is it blocked by brand or by type? Which items are at eye level? Count the facings of the top seller and estimate whether they will last until the next restock. Use the field notebook to save the sketch description.`,
 check:{q:`A shelf-space elasticity of 0.17 means what, in plain English, and why do fast sellers still get more facings?`,
  a:`A 10% increase in an item's shelf space raises its unit sales by about 1.7% on average — a real but small effect. Fast sellers get more facings mainly so that the shelf holds enough product to last between restocks (days of supply), preventing out-of-stocks, not because extra visibility multiplies sales.`},
 qs:[
  ['An item shown as 4 units across the shelf front has:',['4 SKUs','4 facings','4 linear feet','4 days of supply'],1,'Facings are visible units across the front.'],
  ['Eisend’s meta-analysis found average shelf-space elasticity of about:',['0.02','0.17','1.0','2.6'],1,'A 10% space increase ≈ 1.7% more sales.'],
  ['Shoppers who choose by type first (e.g., decaf vs. regular) are best served by:',['Brand blocking','Segment blocking','Random placement','Bottom-shelf placement'],1,'Block by the attribute shoppers decide on first.']],
 read:['lumen','eisend','mosby']},

{n:'5.5', title:'Displays, endcaps and visual merchandising', sub:'Secondary placement, cross-merchandising and the most valuable feet in the store',
 goal:`Explain how displays and endcaps work, what they cost, and how to judge whether a display earns its space.`,
 body:[
 `An item's <b>home location</b> is its regular place on the shelf. A <b>secondary placement</b> puts it somewhere else too: an <b>endcap</b> (the display at the end of an aisle facing the main traffic path), a <b>floor stack</b> or pallet, a <b>wing</b> or side display, a <b>shipper</b> (a cardboard display unit delivered pre-filled), a clip strip, or a checkout rack. Secondary placements catch shoppers who were not planning to visit the home aisle at all.`,
 `Endcaps are among the most valuable feet in the store because they face the store's highest-traffic paths. They typically carry promoted items, seasonal goods and new products — and, as you saw in RTL 221, much endcap space is planned with and funded by vendors. Many shoppers also read an endcap as "a deal" even when the price is regular, which is why retailers have to be careful about signage honesty.`,
 `<b>Cross-merchandising</b> places complementary products together across category lines: chips and salsa on one display, strawberries next to shortcake and whipped cream, pasta beside sauce and a wedge of parmesan. It solves a shopper's problem (the "meal for tonight" mission) and creates halo sales. <b>Visual merchandising</b> — color blocking, lighting, height, signs, props — makes displays visible and readable from a distance. The Lumen text treats layout and visual merchandising together as the store's "retail image."`,
 `A display costs space, labor (building, filling, taking down), and sometimes markdowns when it is over-filled. Judge it like any promotion: <b>incremental gross profit per week</b> from the display location, compared with what that space could earn with another item. A display that just relocates sales from the home shelf has achieved little.`],
 ask:`Why is this item on the end of the aisle this week instead of something else — and who decided?`,
 terms:[
  ['Home location','An item’s regular shelf position.'],
  ['Secondary placement','An additional location for an item outside its home aisle.'],
  ['Endcap','A display at the end of an aisle facing a main traffic path.'],
  ['Shipper display','A pre-filled, ready-to-place display unit delivered by the vendor.'],
  ['Cross-merchandising','Displaying complementary products from different categories together.'],
  ['Visual merchandising','Using color, light, height, signage and props to make merchandise attractive and legible.']],
 kase:{kind:'hypo', h:'Strawberry season',
  b:`Hypothetical. In May a store builds a produce-department display with strawberries, shortcake cups, a cooler of whipped topping and a sign reading "Dessert in 2 minutes." Shortcake cups normally sell 40 a week in the bakery; on the display they sell 210. The whipped topping, normally in the dairy aisle, sells 3× its baseline. Strawberries sell about the same as on any promoted week. The display earned its space through the complements, not the berries. That is cross-merchandising aimed squarely at a mission.`,
  src:[]},
 field:`Run an endcap census. For every endcap in one store, record: product(s), single brand or mixed, promoted price or regular, cross-merchandised or not, seasonal or not. Then calculate what share of endcaps are vendor-looking (single national brand), store-brand, seasonal and cross-merchandised.`,
 check:{q:`How should a manager judge whether an endcap display was worth its space?`,
  a:`By its incremental gross profit — sales the display created beyond what the item (and its complements) would have sold from their home locations — after the cost of labor, any markdowns and vendor funding, compared with what that endcap could have earned holding a different item.`},
 qs:[
  ['A display at the end of an aisle facing the main traffic path is a(n):',['Home location','Endcap','Planogram','Facing'],1,'Endcaps face the store’s busiest paths.'],
  ['Chips and salsa displayed together is an example of:',['Blocking','Cross-merchandising','SKU rationalization','Markdown'],1,'Complementary items from different categories.'],
  ['A display that only moves sales from the home shelf to the endcap has created:',['Large halo','Little incremental profit','Category expansion','Pull-forward'],1,'Relocated sales are not incremental.']],
 read:['lumenDesign','lumen','underhill']},
],

assign:{ title:'Assignment 5 — Reallocate the aisle',
 brief:`A hypothetical 120-foot aisle holds four categories. You can move space in 4-foot sections. Use Eisend's average shelf-space elasticity of 0.17 where needed.
 <table><tr><th>Category</th><th>Feet</th><th>Annual GP</th></tr>
 <tr><td>Salty snacks</td><td class="n">40</td><td class="n">$210,000</td></tr>
 <tr><td>Cookies & crackers</td><td class="n">36</td><td class="n">$126,000</td></tr>
 <tr><td>Canned vegetables</td><td class="n">28</td><td class="n">$56,000</td></tr>
 <tr><td>Baking supplies</td><td class="n">16</td><td class="n">$48,000</td></tr></table>`,
 items:[
  {t:'num', q:'Gross profit per linear foot for salty snacks.', a:5250, tol:1, unit:'$/ft', why:'$210,000 ÷ 40 = $5,250.'},
  {t:'num', q:'Gross profit per linear foot for canned vegetables.', a:2000, tol:1, unit:'$/ft', why:'$56,000 ÷ 28 = $2,000.'},
  {t:'num', q:'Move 4 ft from canned vegetables to salty snacks. Percent increase in snack space?', a:10, tol:0.05, unit:'%', why:'4 ÷ 40 = 10%.'},
  {t:'num', q:'Estimated increase in snack GP from that move (using elasticity 0.17).', a:3570, tol:10, unit:'$', why:'10% × 0.17 = 1.7% of $210,000 = $3,570.'},
  {t:'num', q:'Estimated decrease in canned vegetable GP (space down 4/28).', a:1360, tol:10, unit:'$', why:'4 ÷ 28 = 14.29%; × 0.17 = 2.43% of $56,000 ≈ $1,360.'},
  {t:'mc', q:'Before approving the move, the most important operational check is:', o:['Whether vegetables still have enough days of supply on the shelf to avoid out-of-stocks','Whether the snack vendor approves','Whether the aisle sign is updated','Whether vegetables have higher prices'], a:0, why:'Space cuts often fail through out-of-stocks: fewer facings mean shelves empty before the next restock.'},
  {t:'text', q:'Baking supplies earn $3,000/ft, below snacks. Give one reason not to cut baking space, using category roles.', model:`Baking can be a seasonal and destination category around holidays (Thanksgiving to Christmas), when shoppers choose a store for having every ingredient in stock; cutting space could cause out-of-stocks at exactly the moment the category drives store choice. Many baking items are also unique (specific ingredients with no substitute), so removing them loses whole recipe baskets. The answer could also mention flexing space seasonally rather than cutting it year-round.`}
 ]},

field:{ id:'f301', title:'Field assignment 5 — Endcap census',
 where:'One supermarket, mass merchant or drugstore.', time:'30–45 minutes',
 brief:`Audit every endcap in the store and read the merchandising strategy from them.`,
 steps:[`Walk the main traffic paths and record every endcap.`,`For each: product(s), brand(s), price (promoted or regular), cross-merchandised, seasonal.`,`Note which endcaps face the busiest path (front of store, the "power aisle").`,`Count and summarize.`],
 fields:[
  {k:'store', l:'Store', t:'text'},
  {k:'total', l:'Total endcaps counted', t:'num'},
  {k:'single', l:'Single national brand', t:'num'},
  {k:'store_brand', l:'Store brand', t:'num'},
  {k:'seasonal', l:'Seasonal', t:'num'},
  {k:'cross', l:'Cross-merchandised', t:'num'},
  {k:'regular', l:'At regular (not promoted) price', t:'num'},
  {k:'notes', l:'Best and worst endcap you saw, and why', t:'area'}],
 reflect:[`What does the endcap mix tell you about how much of this store’s merchandising is vendor-driven?`,`Which endcap would you change, and what would you put there?`]},

quiz:[
 ['A category that completes the trip but does not drive store choice is a:',['Destination category','Convenience category','Routine category','Seasonal category'],1,'Convenience categories often carry higher margins.'],
 ['GP per linear foot is $1,800 in one category and $4,500 in its neighbor. The neighbor:',['Should always get all the space','Is a candidate for more space, subject to days-of-supply and role checks','Should be removed','Has lower turnover'],1,'Productivity points the way; role and operations constrain it.'],
 ['Private label often earns a higher percentage margin than national brands because:',['Shoppers pay more for it','Its cost is lower, without the national brand’s premium and advertising','It is always on promotion','Vendors fund it'],1,'Lower cost leaves room for a lower price and higher margin.'],
]
};
