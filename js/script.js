(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const header = $('.site-header');
  const menuButton = $('#menuBtn');
  const nav = $('#nav');

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // Navigation stays usable without animation libraries.
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  };
  menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setMenu(false);
  });

  // A restrained header state gives the page a clear frame while scrolling.
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 28);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Copy-to-clipboard interaction with a clear fallback message.
  const mailButton = $('#copyMail');
  const copiedMessage = $('#copied');
  mailButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(mailButton.dataset.mail);
      copiedMessage.textContent = 'Copied to clipboard';
    } catch {
      copiedMessage.textContent = 'Select and copy the address above';
    }
    window.setTimeout(() => { copiedMessage.textContent = ''; }, 2600);
  });

  // German level selector.
  const levelCopy = {
    a1: 'A1 — First conversations, everyday phrases and the foundations of German grammar.',
    a2: 'A2 — Talk about familiar topics, explain routines and handle everyday situations.',
    b1: 'B1 — Express opinions, tell stories and communicate with more independence.'
  };
  const levelButtons = $$('.levels button');
  levelButtons.forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lv === 'a1'));
    button.addEventListener('click', () => {
      levelButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      $('#lvText').textContent = levelCopy[button.dataset.lv];
    });
  });

  const curtain = $('#curtain');
  if (!hasGsap || reduceMotion) {
    curtain?.remove();
    return;
  }

  // Lenis is used only when its global loaded successfully.
  let lenis = null;
  if (typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (event) => {
        const target = $(anchor.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        lenis.scrollTo(target, { offset: -12 });
      });
    });
  }

  // Intro animation: typography arrives in a short, intentional sequence.
  $$('.ln span').forEach((line) => gsap.set(line, { yPercent: 115, rotate: 2 }));
  gsap.set('[data-hero]', { y: 22, opacity: 0 });
  gsap.timeline({ delay: 0.2, defaults: { ease: 'power4.out' } })
    .to(curtain, { yPercent: -105, duration: 0.85, ease: 'power4.inOut' })
    .to('.ln span', { yPercent: 0, rotate: 0, duration: 1.05, stagger: 0.13 }, '-=0.38')
    .to('[data-hero]', { y: 0, opacity: 1, duration: 0.75, stagger: 0.1 }, '-=0.58')
    .add(() => curtain?.remove());

  // Reveal content as it enters view. Each element animates once.
  $$('[data-r]').forEach((element) => {
    gsap.fromTo(element, { y: 34, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true }
    });
  });

  // Desktop: turn the project rail into a horizontal, pinned gallery.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const track = $('.track');
    const pin = $('.pin');
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const horizontal = gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: pin, start: 'top top', end: () => '+=' + distance(),
        pin: true, scrub: 0.75, invalidateOnRefresh: true
      }
    });
    $$('.p-media img').forEach((image) => {
      gsap.fromTo(image, { scale: 1.02 }, {
        scale: 1.1, ease: 'none',
        scrollTrigger: {
          trigger: image.closest('.panel'), containerAnimation: horizontal,
          start: 'left right', end: 'right left', scrub: true
        }
      });
    });
    return () => horizontal.scrollTrigger?.kill();
  });

  // A small custom cursor and magnetic links only on fine pointers.
  if (finePointer) {
    const cursor = $('#cursor');
    const moveX = gsap.quickTo(cursor, 'x', { duration: 0.22, ease: 'power3' });
    const moveY = gsap.quickTo(cursor, 'y', { duration: 0.22, ease: 'power3' });
    window.addEventListener('pointermove', (event) => {
      cursor.style.opacity = '1';
      moveX(event.clientX);
      moveY(event.clientY);
    }, { passive: true });
    $$('a,button,[data-role]').forEach((element) => {
      element.addEventListener('pointerenter', () => cursor.classList.add('big'));
      element.addEventListener('pointerleave', () => cursor.classList.remove('big'));
    });
    $$('.magnetic').forEach((element) => {
      const x = gsap.quickTo(element, 'x', { duration: 0.35, ease: 'power3' });
      const y = gsap.quickTo(element, 'y', { duration: 0.35, ease: 'power3' });
      element.addEventListener('pointermove', (event) => {
        const rect = element.getBoundingClientRect();
        x((event.clientX - rect.left - rect.width / 2) * 0.12);
        y((event.clientY - rect.top - rect.height / 2) * 0.18);
      });
      element.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }

})();
