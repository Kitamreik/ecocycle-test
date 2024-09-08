'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    const header = document.querySelector('.header');
    const allSections = document.querySelectorAll('.section');
    const imgTargets = document.querySelectorAll('img[data-src]');
    
    // Menu fade animation
    const handleHover = (e, opacity) => {
        if (e.target.classList.contains('nav__link')) {
            const link = e.target;
            const siblings = link.closest('.nav').querySelectorAll('.nav__link');
            const logo = link.closest('.nav').querySelector('img');

            siblings.forEach(el => {
                if (el !== link) el.style.opacity = opacity;
            });
            logo.style.opacity = opacity;
        }
    };

    nav.addEventListener('mouseover', e => handleHover(e, 0.5));
    nav.addEventListener('mouseout', e => handleHover(e, 1));

    // Sticky navigation
    const navHeight = nav.getBoundingClientRect().height;
    const stickyNav = entries => {
        const [entry] = entries;
        if (!entry.isIntersecting) nav.classList.add('sticky');
        else nav.classList.remove('sticky');
    };

    const headerObserver = new IntersectionObserver(stickyNav, {
        root: null,
        threshold: 0,
        rootMargin: `-${navHeight}px`,
    });

    headerObserver.observe(header);

    // Reveal sections
    const revealSection = (entries, observer) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('section--hidden');
        observer.unobserve(entry.target);
    };

    const sectionObserver = new IntersectionObserver(revealSection, {
        root: null,
        threshold: 0.15,
    });

    allSections.forEach(section => {
        sectionObserver.observe(section);
        section.classList.add('section--hidden');
    });

    // Lazy loading images
    const loadImg = (entries, observer) => {
        const [entry] = entries;
        if (!entry.isIntersecting) return;
        entry.target.src = entry.target.dataset.src;
        entry.target.addEventListener('load', () => entry.target.classList.remove('lazy-img'));
        observer.unobserve(entry.target);
    };

    const imgObserver = new IntersectionObserver(loadImg, {
        root: null,
        threshold: 0,
        rootMargin: '200px',
    });

    imgTargets.forEach(img => imgObserver.observe(img));


    //Hamburger view 
    document.addEventListener('DOMContentLoaded', function() {
        const toggleButton = document.querySelector('.nav__toggle');
        const navLinks = document.querySelector('.nav__links');

        toggleButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            toggleButton.classList.toggle('active');
        });
    });
});