(function () {
  const state = {
    slideIndexByClass: Object.create(null),
  };

  const getSlideClassFromNumber = (no) => `mySlides${Number(no) + 1}`;

  function getSlides(className) {
    return Array.from(document.getElementsByClassName(className));
  }

  function showSlidesByClass(className, index) {
    const slides = getSlides(className);
    if (!slides.length) return;

    const total = slides.length;
    let nextIndex = index;
    if (nextIndex > total) nextIndex = 1;
    if (nextIndex < 1) nextIndex = total;

    state.slideIndexByClass[className] = nextIndex;
    slides.forEach((slide, i) => {
      slide.style.display = i === nextIndex - 1 ? 'block' : 'none';
    });
  }

  window.plusSlides = function plusSlides(n, no) {
    const className = getSlideClassFromNumber(no);
    const current = state.slideIndexByClass[className] || 1;
    showSlidesByClass(className, current + n);
  };

  function initializeSlides() {
    const classNames = new Set();
    document.querySelectorAll('[class*="mySlides"]').forEach((element) => {
      element.classList.forEach((className) => {
        if (/^mySlides\d+$/.test(className)) classNames.add(className);
      });
    });
    classNames.forEach((className) => showSlidesByClass(className, 1));
  }

  function initializeNavigation() {
    const mainBioContent = document.getElementById('mainBioContent');
    const mainPortfolioContent = document.getElementById('mainPortfolioContent');
    const webItems = Array.from(document.getElementsByClassName('FrontEndItem'));
    const graphicsItems = Array.from(document.getElementsByClassName('BlenderItem'));

    const controls = {
      bio: document.getElementById('bio'),
      portfolio: document.getElementById('portfolio'),
      frontend: document.getElementById('frontend'),
      grafics3d: document.getElementById('grafics3d'),
    };

    function setActive(activeKey) {
      Object.entries(controls).forEach(([key, element]) => {
        if (!element) return;
        element.classList.toggle('is-active', key === activeKey);
      });
    }

    function showPortfolio(filter) {
      if (mainBioContent) mainBioContent.style.display = 'none';
      if (mainPortfolioContent) mainPortfolioContent.style.display = 'grid';

      webItems.forEach((item) => {
        item.style.display = filter === 'graphics' ? 'none' : '';
      });
      graphicsItems.forEach((item) => {
        item.style.display = filter === 'frontend' ? 'none' : '';
      });

      setActive(filter === 'frontend' ? 'frontend' : filter === 'graphics' ? 'grafics3d' : 'portfolio');
    }

    function showBio() {
      if (mainBioContent) mainBioContent.style.display = 'flex';
      if (mainPortfolioContent) mainPortfolioContent.style.display = 'none';
      setActive('bio');
    }

    controls.bio?.addEventListener('click', (event) => {
      event.preventDefault();
      showBio();
      history.replaceState(null, '', '#about');
    });

    controls.portfolio?.addEventListener('click', (event) => {
      event.preventDefault();
      showPortfolio('all');
      history.replaceState(null, '', '#portfolio');
    });

    controls.frontend?.addEventListener('click', (event) => {
      event.preventDefault();
      showPortfolio('frontend');
      history.replaceState(null, '', '#webgl');
    });

    controls.grafics3d?.addEventListener('click', (event) => {
      event.preventDefault();
      showPortfolio('graphics');
      history.replaceState(null, '', '#graphics');
    });

    document.querySelectorAll('[data-show-portfolio]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        showPortfolio('all');
        history.replaceState(null, '', '#portfolio');
      });
    });

    const hash = window.location.hash.toLowerCase();
    const isPortfolioPage = /portfolio/i.test(window.location.pathname);

    if (hash === '#portfolio') showPortfolio('all');
    else if (hash === '#webgl' || hash === '#frontend') showPortfolio('frontend');
    else if (hash === '#graphics' || hash === '#3d') showPortfolio('graphics');
    else if (hash === '#about') showBio();
    else if (isPortfolioPage) showPortfolio('all');
    else showBio();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initializeSlides();
    initializeNavigation();
  });
})();
