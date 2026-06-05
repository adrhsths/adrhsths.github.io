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

    if (container) moveContainerSlider(container, direction < 0 ? -1 : 1);
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

    function setPortfolioFilter(filter) {
      if (mainPortfolioContent) mainPortfolioContent.style.display = 'grid';
      if (mainBioContent) mainBioContent.style.display = 'flex';

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

    function scrollToElement(element) {
      if (!element) return;
      try { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      catch (e) { element.scrollIntoView(true); }
    }

    function showPortfolio(filter, shouldScroll) {
      setPortfolioFilter(filter);
      if (shouldScroll !== false) scrollToElement(mainPortfolioContent);
    }

    function showBio(shouldScroll) {
      if (mainBioContent) mainBioContent.style.display = 'flex';
      if (mainPortfolioContent) mainPortfolioContent.style.display = 'grid';
      setActive('bio');
      if (shouldScroll !== false) scrollToElement(mainBioContent);
    }

    function bindControl(element, handler, hash) {
      if (!element) return;
      element.onclick = function (event) {
        event = event || window.event;
        if (event.preventDefault) event.preventDefault();
        handler(true);
        if (hash && window.history && window.history.pushState) window.history.pushState(null, '', hash);
        else if (hash) window.location.hash = hash;
        return false;
      };
    }

    bindControl(controls.bio, function () { showBio(true); }, '#about');
    bindControl(controls.portfolio, function () { showPortfolio('all', true); }, '#portfolio');
    bindControl(controls.frontend, function () { showPortfolio('frontend', true); }, '#webgl');
    bindControl(controls.grafics3d, function () { showPortfolio('graphics', true); }, '#graphics');

    var allLinks = document.getElementsByTagName('a');
    for (var i = 0; i < allLinks.length; i += 1) {
      if (!allLinks[i].getAttribute('data-show-portfolio')) continue;
      bindControl(allLinks[i], function () { showPortfolio('all', true); }, '#portfolio');
    }

    function applyHash(initialLoad) {
      var hash = (window.location.hash || '').toLowerCase();
      if (hash === '#portfolio' || hash === '#works' || hash === '#all') showPortfolio('all', !initialLoad);
      else if (hash === '#webgl' || hash === '#frontend' || hash === '#front-end' || hash === '#code') showPortfolio('frontend', !initialLoad);
      else if (hash === '#graphics' || hash === '#graphic' || hash === '#3d' || hash === '#blender') showPortfolio('graphics', !initialLoad);
      else if (hash === '#about' || hash === '#bio' || hash === '#resume') showBio(!initialLoad);
      else {
        setPortfolioFilter('all');
        setActive('bio');
      }
    }

    applyHash(true);
    if (window.addEventListener) window.addEventListener('hashchange', function () { applyHash(false); }, false);
    else if (window.attachEvent) window.attachEvent('onhashchange', function () { applyHash(false); });
  }

  function replaceBrokenImagesWithPlaceholder() {
    var images = document.getElementsByTagName('img');
    for (var i = 0; i < images.length; i += 1) {
      images[i].onerror = function () {
        var holder = document.createElement('div');
        holder.className = 'missing-image-placeholder';
        holder.innerHTML = 'Image file missing';
        if (this.parentNode) this.parentNode.replaceChild(holder, this);
      };
    }
  }

  function initialize() {
    replaceBrokenImagesWithPlaceholder();
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
