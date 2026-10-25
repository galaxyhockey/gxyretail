/* ============================================================
   store.js — auth + persistence.
   Uses Firebase when you have configured it; otherwise falls back to
   browser localStorage so the app is fully usable with zero setup
   (and offline). Same data shape either way.
   ============================================================ */
import { FIREBASE_CONFIG, ALLOWED_UIDS } from './config.js';

const CDN = 'https://www.gstatic.com/firebasejs/10.12.2';
export const state = { mode:'local', user:null, uid:'local', db:null, auth:null, fb:null };

const configured = !String(FIREBASE_CONFIG.apiKey).startsWith('PASTE');

/* ---------- local fallback ---------- */
const mem = {};
const LS = {
  get(k){ try{ const v=localStorage.getItem('endcap:'+k); return v?JSON.parse(v):null; }catch(e){ return mem[k]??null; } },
  set(k,v){ try{ localStorage.setItem('endcap:'+k, JSON.stringify(v)); }catch(e){ mem[k]=v; } }
};

/* ---------- boot ---------- */
export async function boot(onReady){
  if(!configured){
    state.mode='local';
    onReady({ signedIn:true, local:true });
    return;
  }
  try{
    const [appMod, authMod, fsMod] = await Promise.all([
      import(`${CDN}/firebase-app.js`),
      import(`${CDN}/firebase-auth.js`),
      import(`${CDN}/firebase-firestore.js`)
    ]);
    const app = appMod.initializeApp(FIREBASE_CONFIG);
    state.fb   = { ...authMod, ...fsMod };
    state.auth = authMod.getAuth(app);
    state.db   = fsMod.getFirestore(app);
    state.mode = 'firebase';

    authMod.onAuthStateChanged(state.auth, (user)=>{
      if(!user){ state.user=null; onReady({ signedIn:false }); return; }
      const allowed = ALLOWED_UIDS.length===0 || ALLOWED_UIDS.includes(user.uid);
      if(!allowed){
        onReady({ signedIn:false, denied:true, uid:user.uid, email:user.email });
        authMod.signOut(state.auth);
        return;
      }
      state.user=user; state.uid=user.uid;
      onReady({ signedIn:true, user });
    });
  }catch(err){
    console.warn('Firebase unavailable, falling back to local storage.', err);
    state.mode='local';
    onReady({ signedIn:true, local:true, warn:'Firebase could not load — running in local-only mode.' });
  }
}

/* ---------- auth actions ---------- */
export async function signInGoogle(){
  const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = state.fb;
  const provider = new GoogleAuthProvider();
  try{
    return await signInWithPopup(state.auth, provider);
  }catch(err){
    if(err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment'){
      return signInWithRedirect(state.auth, provider);
    }
    throw err;
  }
}
export async function signInEmail(email, pass){
  const { signInWithEmailAndPassword } = state.fb;
  return signInWithEmailAndPassword(state.auth, email, pass);
}
export async function signOutNow(){
  if(state.mode==='firebase') return state.fb.signOut(state.auth);
}

/* ---------- documents ----------
   Everything lives under users/{uid}/endcap/{docId}, so one security
   rule covers the whole app (and a Firebase project shared with
   another field school never collides with it).                                            */
function ref(docId){
  const { doc } = state.fb;
  return doc(state.db, 'users', state.uid, 'endcap', docId);
}
export async function load(docId, fallback){
  if(state.mode!=='firebase') return LS.get(docId) ?? fallback;
  try{
    const { getDoc } = state.fb;
    const snap = await getDoc(ref(docId));
    return snap.exists() ? (snap.data().v ?? fallback) : fallback;
  }catch(e){ console.warn('load failed', docId, e); return LS.get(docId) ?? fallback; }
}
export async function save(docId, value){
  LS.set(docId, value);                       // always keep a local mirror
  if(state.mode!=='firebase') return;
  try{
    const { setDoc } = state.fb;
    await setDoc(ref(docId), { v:value, updated:Date.now() });
  }catch(e){ console.warn('save failed', docId, e); }
}

/* Debounced saver for things typed into text boxes. */
const timers={};
export function saveSoon(docId, value, ms=700){
  clearTimeout(timers[docId]);
  timers[docId]=setTimeout(()=>save(docId,value), ms);
}
