(function () {
  if (window.__avHashScroll) return; window.__avHashScroll = 1;
  var OFFSET = 100;
  function go(smooth) {
    var h = decodeURIComponent((location.hash || '').slice(1)); if (!h) return;
    var n = 0;
    (function t() {
      var el = document.getElementById(h);
      if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + (window.scrollY || 0) - OFFSET, behavior: smooth ? 'smooth' : 'auto' }); return; }
      if (++n < 50) setTimeout(t, 100);
    })();
  }
  window.addEventListener('hashchange', function () { go(true); });
  function boot() { setTimeout(function () { go(false); }, 350); setTimeout(function () { go(false); }, 1200); }
  if (document.readyState === 'complete') boot(); else window.addEventListener('load', boot);
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href*="#"]'); if (!a) return;
    var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
    if (!u.hash || u.hash === '#') return;
    if (decodeURIComponent(u.pathname) === decodeURIComponent(location.pathname)) {
      e.preventDefault();
      if (location.hash !== u.hash) history.pushState(null, '', u.hash);
      go(true);
    }
  }, true);
})();
