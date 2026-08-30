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

  /* menu mobile */
  var burger = document.getElementById('burger'), menu = document.getElementById('mobileMenu');
  function setMenu(open){
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.hidden = !open;
  }
  burger.addEventListener('click', function(){
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true'){ setMenu(false); burger.focus(); }
  });
})();
