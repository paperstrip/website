(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-rv]'));

  if(!reduce && 'IntersectionObserver' in window){
    /* décalage calculé entre voisins directs : deux blocs sans rapport
       ne portent plus un délai hérité d'un index global */
    items.forEach(function(el){
      var sibs = Array.prototype.filter.call(el.parentNode.children, function(n){
        return n.hasAttribute && n.hasAttribute('data-rv');
      });
      el.style.setProperty('--d', Math.min(sibs.indexOf(el), 3) * 0.08 + 's');
    });

    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});

    /* le hero s'anime à l'arrivée, pas au scroll */
    document.querySelectorAll('.hero-content [data-rv]').forEach(function(el, i){
      el.style.setProperty('--d', (0.1 + i * 0.08) + 's');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('in'); }); });
    });

    items.forEach(function(el){ if(!el.classList.contains('in')) io.observe(el); });
  } else {
    items.forEach(function(el){ el.classList.add('in'); });
  }

  /* en-tête : fond dense dès la sortie du hero */
  var header = document.getElementById('siteHeader'), ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      header.classList.toggle('is-stuck', window.scrollY > 70);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- MEGA MENU PLEIN ÉCRAN ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('megaMenu');
  var lastFocus = null;

  function focusables(){
    return Array.prototype.filter.call(
      menu.querySelectorAll('a[href], button:not([disabled])'),
      function(el){ return el.offsetParent !== null || el.getClientRects().length; }
    );
  }

  function setMenu(open){
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    if(open){
      lastFocus = document.activeElement;
      /* focus au cadre suivant : tant que le style n'est pas recalculé,
         le menu est encore visibility:hidden et refuse le focus */
      requestAnimationFrame(function(){
        var f = focusables();
        if(f.length) f[0].focus();
      });
    } else if(lastFocus){
      lastFocus.focus();
      lastFocus = null;
    }
  }

  function isOpen(){ return burger.getAttribute('aria-expanded') === 'true'; }

  burger.addEventListener('click', function(){ setMenu(!isOpen()); });

  /* un lien cliqué referme : les ancres de la même page doivent rester visibles */
  menu.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });

  document.addEventListener('keydown', function(e){
    if(!isOpen()) return;
    if(e.key === 'Escape'){ setMenu(false); return; }
    if(e.key !== 'Tab') return;
    /* le focus reste enfermé dans le menu tant qu'il est ouvert */
    var f = focusables();
    if(!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
})();
