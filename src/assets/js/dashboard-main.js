

// Dashboard entry: only what this page needs.
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';

import '../style/style.css';
import './dashboard.js';


// // TEMP: delete after testing
// const dbg = document.createElement('pre');
// dbg.style.cssText = 'position:fixed;top:4px;left:4px;z-index:999;font:10px monospace;background:#000;color:#0f0;padding:4px;pointer-events:none';
// const upd = () => {
//   dbg.textContent = [
//     `inner ${innerHeight}`,
//     `vv ${Math.round(visualViewport?.height ?? 0)}`,
//     `client ${document.documentElement.clientHeight}`,
//     `docScroll ${document.scrollingElement.scrollHeight}`,
//     `shell ${document.querySelector('.app-shell').offsetHeight}`,
//   ].join(' | ');
// };
// document.body.append(dbg);
// upd();
// addEventListener('resize', upd);
// visualViewport?.addEventListener('resize', upd);

// Keep the shell exactly as tall as the visible area (browser bars, rotation, zoom)
const root = document.documentElement;
let raf = 0;
const setAppHeight = () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const vv = window.visualViewport;
    const h = vv ? vv.height * vv.scale : window.innerHeight;
    root.style.setProperty('--app-height', `${Math.round(h)}px`);
  });
};
setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
window.addEventListener('pageshow', setAppHeight);
window.visualViewport?.addEventListener('resize', setAppHeight);

