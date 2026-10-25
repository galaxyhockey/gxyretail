/* ============================================================
   content/index.js — the program, in order.
   Each course file is self-contained; this file just stacks them.
   Add a course by writing rNNN.js in the same shape and listing it.
   ============================================================ */
import r101 from './r101.js';
import r201 from './r201.js';
import r211 from './r211.js';
import r221 from './r221.js';
import r301 from './r301.js';
import r311 from './r311.js';
import r321 from './r321.js';
import r331 from './r331.js';
import r401 from './r401.js';
import r411 from './r411.js';

export const COURSES = [r101, r201, r211, r221, r301, r311, r321, r331, r401, r411];

/* The four stages of the program, for the catalogue. */
export const STAGES = [
  { t:'Foundations',       sub:'How a store makes money and who walks through the door', ids:['r101','r201'] },
  { t:'The commercial toolkit', sub:'Price, promotion and the shelf',                      ids:['r211','r221','r301'] },
  { t:'Running the store', sub:'Space, stock and people',                                  ids:['r311','r321','r331'] },
  { t:'Management',        sub:'Numbers, strategy and the capstone',                       ids:['r401','r411'] },
];
