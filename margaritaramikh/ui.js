(function () {
  if (window.__portfolioUiReady) return;
  window.__portfolioUiReady = true;

  function hasClass(element, className) {
    if (!element || !element.className) return false;
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
  }

  function addClass(element, className) {
    if (!element) return;
    if (element.classList) element.classList.add(className);
    else if (!hasClass(element, className)) element.className += ' ' + className;
  }

  function removeClass(element, className) {
    if (!element) return;
    if (element.classList) element.classList.remove(className);
    else element.className = (' ' + element.className + ' ').replace(' ' + className + ' ', ' ');
  }

  function closestByClass(element, className) {
    while (element && element !== document) {
      if (hasClass(element, className)) return element;
      element = element.parentNode;
    }
    return null;
  }

  function toArray(collection) {
    return Array.prototype.slice.call(collection || []);
  }

  function getElementsByClass(className) {
    return toArray(document.getElementsByClassName(className));
  }

  function getSlidesInContainer(container) {
    if (!container) return [];
    return toArray(container.getElementsByTagName('div')).filter(function (element) {
      return /(^|\s)mySlides\d+(\s|$)/.test(element.className || '');
    });
  }

  function showSlideInContainer(container, index) {
    var slides = getSlidesInContainer(container);
    if (!slides.length) return;

    var total = slides.length;
    var nextIndex = index;
    if (nextIndex > total) nextIndex = 1;
    if (nextIndex < 1) nextIndex = total;

    container.setAttribute('data-slide-index', String(nextIndex));
    for (var i = 0; i < slides.length; i += 1) {
      slides[i].style.display = i === nextIndex - 1 ? 'block' : 'none';
    }
  }

  function moveContainerSlider(container, direction) {
    if (!container) return;
    var current = parseInt(container.getAttribute('data-slide-index'), 10) || 1;
    showSlideInContainer(container, current + direction);
  }

  window.plusSlides = function plusSlides(direction, oldSlideNumber) {
    var eventObject = window.event || null;
    var clicked = eventObject && (eventObject.target || eventObject.srcElement);
    var container = clicked ? closestByClass(clicked, 'slideshow-container') : null;

    if (!container && typeof oldSlideNumber !== 'undefined') {
      var slideClass = 'mySlides' + (Number(oldSlideNumber) + 1);
      var oldSlides = getElementsByClass(slideClass);
      if (oldSlides.length) container = closestByClass(oldSlides[0], 'slideshow-container');
    }

    if (container) {
      moveContainerSlider(container, direction < 0 ? -1 : 1);
      return false;
    }

    return false;
  };

  function initializeSlides() {
    var containers = getElementsByClass('slideshow-container');

    for (var i = 0; i < containers.length; i += 1) {
      var container = containers[i];
      var slides = getSlidesInContainer(container);
      if (slides.length) showSlideInContainer(container, 1);

      var buttons = toArray(container.getElementsByTagName('a'));
      for (var b = 0; b < buttons.length; b += 1) {
        if (!hasClass(buttons[b], 'prev') && !hasClass(buttons[b], 'next')) continue;

        buttons[b].removeAttribute('onclick');

        if (slides.length <= 1) {
          buttons[b].style.display = 'none';
          continue;
        }

        buttons[b].onclick = function (event) {
          event = event || window.event;
          var target = event.target || event.srcElement;
          var button = closestByClass(target, 'prev') || closestByClass(target, 'next') || target;
          var localContainer = closestByClass(button, 'slideshow-container');
          var direction = hasClass(button, 'prev') ? -1 : 1;

          if (event.preventDefault) event.preventDefault();
          if (event.stopPropagation) event.stopPropagation();
          moveContainerSlider(localContainer, direction);
          return false;
        };
      }
    }
  }

  function initializeNavigation() {
    var mainBioContent = document.getElementById('mainBioContent');
    var mainPortfolioContent = document.getElementById('mainPortfolioContent');
    var webItems = getElementsByClass('FrontEndItem');
    var graphicsItems = getElementsByClass('BlenderItem');

    var controls = {
      bio: document.getElementById('bioLink'),
      portfolio: document.getElementById('portfolioLink'),
      frontend: document.getElementById('frontendLink'),
      grafics3d: document.getElementById('grafics3dLink')
    };

    function setActive(activeKey) {
      for (var key in controls) {
        if (!Object.prototype.hasOwnProperty.call(controls, key)) continue;
        removeClass(controls[key], 'is-active');
        if (key === activeKey) addClass(controls[key], 'is-active');
      }
    }

    function showPortfolio(filter) {
      if (mainBioContent) mainBioContent.style.display = 'none';
      if (mainPortfolioContent) mainPortfolioContent.style.display = 'grid';

      for (var i = 0; i < webItems.length; i += 1) {
        webItems[i].style.display = filter === 'graphics' ? 'none' : 'block';
      }
      for (var j = 0; j < graphicsItems.length; j += 1) {
        graphicsItems[j].style.display = filter === 'frontend' ? 'none' : 'block';
      }

      if (filter === 'frontend') setActive('frontend');
      else if (filter === 'graphics') setActive('grafics3d');
      else setActive('portfolio');
    }

    function showBio() {
      if (mainBioContent) mainBioContent.style.display = 'flex';
      if (mainPortfolioContent) mainPortfolioContent.style.display = 'none';
      setActive('bio');
    }

    function bindControl(element, handler, hash) {
      if (!element) return;
      element.onclick = function (event) {
        event = event || window.event;
        if (event.preventDefault) event.preventDefault();
        handler();
        if (hash && window.history && window.history.replaceState) window.history.replaceState(null, '', hash);
        return false;
      };
    }

    bindControl(controls.bio, showBio, '#about');
    bindControl(controls.portfolio, function () { showPortfolio('all'); }, '#portfolio');
    bindControl(controls.frontend, function () { showPortfolio('frontend'); }, '#webgl');
    bindControl(controls.grafics3d, function () { showPortfolio('graphics'); }, '#graphics');

    var allLinks = document.getElementsByTagName('a');
    for (var i = 0; i < allLinks.length; i += 1) {
      if (!allLinks[i].getAttribute('data-show-portfolio')) continue;
      bindControl(allLinks[i], function () { showPortfolio('all'); }, '#portfolio');
    }

    function applyHash() {
      var hash = (window.location.hash || '').toLowerCase();
      var path = window.location.pathname || '';
      var isPortfolioPage = /portfolio/i.test(path);

      if (hash === '#portfolio' || hash === '#works' || hash === '#all') showPortfolio('all');
      else if (hash === '#webgl' || hash === '#frontend' || hash === '#front-end' || hash === '#code') showPortfolio('frontend');
      else if (hash === '#graphics' || hash === '#graphic' || hash === '#3d' || hash === '#blender') showPortfolio('graphics');
      else if (hash === '#about' || hash === '#bio' || hash === '#resume') showBio();
      else if (isPortfolioPage) showPortfolio('all');
      else showBio();
    }

    applyHash();

    if (window.addEventListener) window.addEventListener('hashchange', applyHash, false);
    else if (window.attachEvent) window.attachEvent('onhashchange', applyHash);
  }

  function initialize() {
    initializeSlides();
    initializeNavigation();
  }

  if (document.readyState === 'loading') {
    if (document.addEventListener) document.addEventListener('DOMContentLoaded', initialize, false);
    else window.onload = initialize;
  } else {
    initialize();
  }
})();
