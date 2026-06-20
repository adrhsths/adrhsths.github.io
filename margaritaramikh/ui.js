(function () {
  'use strict';

  if (window.__portfolioStaticUiV10) return;
  window.__portfolioStaticUiV10 = true;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || []);
  }

  function hasClass(el, name) {
    return !!(el && el.classList && el.classList.contains(name));
  }

  function closest(el, selector) {
    while (el && el.nodeType === 1) {
      if (el.matches && el.matches(selector)) return el;
      el = el.parentElement;
    }
    return null;
  }

  function slideElements(container) {
    if (!container) return [];
    return toArray(container.children).filter(function (child) {
      if (!child || child.tagName !== 'DIV') return false;
      if (child.classList && (child.classList.contains('image-missing-note') || child.classList.contains('slide-counter'))) return false;
      if (/\bmySlides\d+\b/.test(child.className || '')) return true;
      if (child.classList && child.classList.contains('project-placeholder-slide')) return true;
      if (child.querySelector && child.querySelector('img, video, iframe, .project-placeholder-content')) return true;
      return false;
    });
  }

  function showSlide(container, index) {
    var slides = slideElements(container);
    if (!slides.length) return;

    var total = slides.length;
    var next = Number(index) || 0;
    if (next < 0) next = total - 1;
    if (next >= total) next = 0;

    container.dataset.currentSlide = String(next);
    container.dataset.totalSlides = String(total);

    container.classList.add('is-ready');
    slides.forEach(function (slide, i) {
      var isCurrent = i === next;
      slide.style.display = isCurrent ? 'block' : 'none';
      slide.classList.toggle('is-current-slide', isCurrent);
      slide.setAttribute('aria-hidden', isCurrent ? 'false' : 'true');
    });

    var counter = container.querySelector('.slide-counter');
    if (counter) counter.textContent = String(next + 1) + ' / ' + String(total);
  }

  function moveSlide(container, delta) {
    var current = Number(container.dataset.currentSlide || 0);
    showSlide(container, current + delta);
  }

  function setupSlider(container) {
    var slides = slideElements(container);
    var prev = container.querySelector('.prev');
    var next = container.querySelector('.next');

    if (!slides.length) return;

    if (slides.length > 1 && !container.querySelector('.slide-counter')) {
      var counter = document.createElement('span');
      counter.className = 'slide-counter';
      counter.setAttribute('aria-live', 'polite');
      container.appendChild(counter);
    }

    if (slides.length <= 1) {
      if (prev) prev.style.display = 'none';
      if (next) next.style.display = 'none';
    } else {
      if (prev) prev.style.display = '';
      if (next) next.style.display = '';
    }

    showSlide(container, 0);
  }

  function setupMissingImages() {
    toArray(document.querySelectorAll('img')).forEach(function (img) {
      img.addEventListener('error', function () {
        var wrap = closest(img, '.slideshow-container') || img.parentElement;
        if (!wrap || wrap.querySelector('.image-missing-note')) return;
        var note = document.createElement('div');
        note.className = 'image-missing-note';
        note.textContent = 'Image file missing on server';
        wrap.appendChild(note);
        img.style.display = 'none';
      });
    });
  }

  function setBodyRoute(routeName) {
    document.body.classList.remove(
      'showing-bio',
      'showing-portfolio',
      'portfolio-filter-all',
      'portfolio-filter-webgl',
      'portfolio-filter-graphics'
    );

    if (routeName === 'about') {
      document.body.classList.add('showing-bio');
    } else {
      document.body.classList.add('showing-portfolio', 'portfolio-filter-' + routeName);
    }
  }

  function setupNavigation() {
    var bio = document.getElementById('mainBioContent');
    var portfolio = document.getElementById('mainPortfolioContent');
    var webItems = toArray(document.querySelectorAll('.FrontEndItem'));
    var graphicItems = toArray(document.querySelectorAll('.BlenderItem'));

    var nav = {
      about: document.getElementById('bioLink'),
      portfolio: document.getElementById('portfolioLink'),
      webgl: document.getElementById('frontendLink'),
      graphics: document.getElementById('grafics3dLink')
    };

    function setActive(name) {
      Object.keys(nav).forEach(function (key) {
        if (!nav[key]) return;
        nav[key].classList.toggle('is-active', key === name);
      });
    }

    function clearItemState(item) {
      item.hidden = false;
      item.style.removeProperty('display');
    }

    function showBio() {
      if (bio) bio.style.display = 'flex';
      if (portfolio) portfolio.style.display = 'none';
      webItems.concat(graphicItems).forEach(clearItemState);
      setActive('about');
      setBodyRoute('about');
    }

    function showPortfolio(filter) {
      filter = filter || 'all';

      if (bio) bio.style.display = 'none';
      if (portfolio) portfolio.style.removeProperty('display');

      webItems.forEach(function (item) {
        item.style.removeProperty('display');
        item.hidden = filter === 'graphics';
      });

      graphicItems.forEach(function (item) {
        item.style.removeProperty('display');
        item.hidden = filter === 'webgl';
      });

      setActive(filter === 'webgl' ? 'webgl' : filter === 'graphics' ? 'graphics' : 'portfolio');
      setBodyRoute(filter);
    }

    function route(hash) {
      hash = (hash || window.location.hash || '').toLowerCase();
      var path = (window.location.pathname || '').toLowerCase();

      if (hash === '#portfolio' || hash === '#works' || hash === '#all') showPortfolio('all');
      else if (hash === '#webgl' || hash === '#frontend' || hash === '#front-end' || hash === '#code') showPortfolio('webgl');
      else if (hash === '#graphics' || hash === '#graphic' || hash === '#3d' || hash === '#blender') showPortfolio('graphics');
      else if (hash === '#about' || hash === '#bio' || hash === '#resume') showBio();
      else if (path.indexOf('portfolio') !== -1) showPortfolio('all');
      else showBio();
    }

    function go(hash) {
      if (window.history && window.history.pushState) window.history.pushState(null, '', hash);
      else window.location.hash = hash;
      route(hash);
    }

    if (nav.about) nav.about.addEventListener('click', function (e) { e.preventDefault(); go('#about'); });
    if (nav.portfolio) nav.portfolio.addEventListener('click', function (e) { e.preventDefault(); go('#portfolio'); });
    if (nav.webgl) nav.webgl.addEventListener('click', function (e) { e.preventDefault(); go('#webgl'); });
    if (nav.graphics) nav.graphics.addEventListener('click', function (e) { e.preventDefault(); go('#graphics'); });

    toArray(document.querySelectorAll('[data-show-portfolio]')).forEach(function (link) {
      link.addEventListener('click', function (e) { e.preventDefault(); go('#portfolio'); });
    });

    window.addEventListener('hashchange', function () { route(); });
    route();
  }

  document.addEventListener('click', function (event) {
    var button = closest(event.target, '.prev, .next');
    if (!button) return;
    var container = closest(button, '.slideshow-container');
    if (!container) return;

    event.preventDefault();
    event.stopPropagation();
    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
    moveSlide(container, hasClass(button, 'prev') ? -1 : 1);
  }, true);

  window.plusSlides = function (direction, legacyIndex) {
    var containers = toArray(document.querySelectorAll('.slideshow-container'));
    var chosen = null;

    if (typeof legacyIndex === 'number') {
      chosen = containers.filter(function (container) {
        return slideElements(container).some(function (slide) {
          return /\bmySlides\d+\b/.test(slide.className || '');
        });
      })[legacyIndex] || null;
    }

    if (!chosen && window.event) chosen = closest(window.event.target || window.event.srcElement, '.slideshow-container');
    if (chosen) moveSlide(chosen, direction < 0 ? -1 : 1);
    return false;
  };

  ready(function () {
    toArray(document.querySelectorAll('.slideshow-container')).forEach(setupSlider);
    setupMissingImages();
    setupNavigation();
  });
})();
