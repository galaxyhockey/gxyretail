/* ============================================================
   pwa.js — install prompt, update toast, and connection state.
   ============================================================ */
const $ = id => document.getElementById(id);

let deferredPrompt = null;
let reg = null;

export function initPWA(){
  /* ---- register the service worker (HTTPS or localhost only) ---- */
  if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
    navigator.serviceWorker.register('./sw.js', { scope: './' })
      .then(r => {
        reg = r;
        r.addEventListener('updatefound', () => {
          const nw = r.installing;
          if(!nw) return;
          nw.addEventListener('statechange', () => {
            if(nw.state === 'installed' && navigator.serviceWorker.controller) showUpdate();
          });
        });
      })
      .catch(e => console.warn('[pwa] registration failed', e));

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if(refreshing) return; refreshing = true; location.reload();
    });
  }

  /* ---- install prompt ---- */
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    renderInstall();
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; renderInstall(); });
  renderInstall();

  /* ---- connection state ---- */
  window.addEventListener('online',  () => setNet(true));
  window.addEventListener('offline', () => setNet(false));
  setNet(navigator.onLine);
}

function setNet(online){
  document.body.classList.toggle('is-offline', !online);
  const el = $('net-state');
  if(el) el.innerHTML = online ? '' :
    '<div class="in">Offline — the courses, labs, field kit and your notes all still work from the cache. New sign-ins and cross-device sync will resume when you reconnect.</div>';
}

function showUpdate(){
  const el = $('update-toast'); if(!el) return;
  el.classList.remove('hide');
  el.innerHTML = `<span>A new version is ready.</span>
    <button class="btn" id="update-now">Reload</button>
    <button class="btn ghost" id="update-later">Later</button>`;
  $('update-now').onclick = () => {
    if(reg?.waiting) reg.waiting.postMessage('SKIP_WAITING'); else location.reload();
  };
  $('update-later').onclick = () => el.classList.add('hide');
}

function renderInstall(){
  const box = $('install-box'); if(!box) return;
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if(standalone){
    box.innerHTML = `<div class="callout"><b>Installed.</b> You are running the app rather than the website.
      It opens offline and keeps your last-loaded content.</div>`;
    return;
  }
  if(deferredPrompt){
    box.innerHTML = `<div class="card"><h4>Install on this device</h4>
      <p>Adds it to your home screen, opens without browser chrome, and works offline.</p>
      <button class="btn big" id="install-go">Install Endcap</button></div>`;
    $('install-go').onclick = async () => {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null; renderInstall();
    };
    return;
  }
  box.innerHTML = iOS
    ? `<div class="card"><h4>Install on iPhone or iPad</h4>
        <p>Safari has no install button. Tap the <b>Share</b> icon, then <b>Add to Home Screen</b>.
        It then opens full-screen like an app.</p></div>`
    : `<div class="card"><h4>Install on this device</h4>
        <p>Your browser has not offered an install prompt yet — it usually appears after a second
        visit and requires HTTPS. On desktop Chrome, look for the install icon at the right-hand
        end of the address bar.</p></div>`;
}
