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
    initScene();
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
    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth + parseFloat(getComputedStyle(track).paddingLeft));
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

  initScene();

  // Three.js: a slow, interactive orbital sculpture. It pauses off-screen.
  function initScene() {
    const canvas = $('#scene');
    if (!canvas || typeof window.THREE === 'undefined') return;
    const lowPower = (navigator.hardwareConcurrency || 4) < 4;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas, alpha: true, antialias: !lowPower, powerPreference: 'low-power'
      });
    } catch {
      canvas.hidden = true;
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.z = 7.4;

    const sculpture = new THREE.Group();
    scene.add(sculpture);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 2),
      new THREE.MeshBasicMaterial({ color: '#c9f27a', wireframe: true, transparent: true, opacity: 0.19 })
    );
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.92, 1),
      new THREE.MeshBasicMaterial({ color: '#df9a70', wireframe: true, transparent: true, opacity: 0.55 })
    );
    const ringMaterial = new THREE.MeshBasicMaterial({ color: '#c9f27a', transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.006, 8, 180), ringMaterial);
    const ringB = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.004, 8, 180), new THREE.MeshBasicMaterial({ color: '#df9a70', transparent: true, opacity: 0.22 }));
    ringA.rotation.set(1.05, 0.35, 0.2);
    ringB.rotation.set(0.4, 1.1, -0.45);
    sculpture.add(shell, inner, ringA, ringB);

    const particleCount = lowPower ? 240 : 420;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const radius = 2.7 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(particleGeometry, new THREE.PointsMaterial({
      color: '#e8e3d7', size: 0.018, transparent: true, opacity: 0.55, sizeAttenuation: true
    }));
    sculpture.add(particles);

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      sculpture.position.set(width > 900 ? 2.35 : 0.45, width > 900 ? 0.05 : 1.15, 0);
      sculpture.scale.setScalar(width > 900 ? 1 : 0.78);
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    let targetX = 0, targetY = 0, visible = true, frame = 0;
    window.addEventListener('pointermove', (event) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 0.42;
      targetY = (event.clientY / window.innerHeight - 0.5) * 0.28;
    }, { passive: true });
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !frame) render();
      if (!visible && frame) { cancelAnimationFrame(frame); frame = 0; }
    }, { threshold: 0 });
    observer.observe(canvas);

    const clock = new THREE.Clock();
    const render = () => {
      if (!visible) { frame = 0; return; }
      frame = requestAnimationFrame(render);
      const time = clock.getElapsedTime();
      sculpture.rotation.y += (targetX + time * 0.035 - sculpture.rotation.y) * 0.018;
      sculpture.rotation.x += (targetY - sculpture.rotation.x) * 0.018;
      shell.rotation.y = time * 0.045;
      inner.rotation.x = time * 0.09;
      inner.rotation.y = -time * 0.07;
      ringA.rotation.z = time * 0.035;
      ringB.rotation.x = 0.4 + Math.sin(time * 0.18) * 0.08;
      particles.rotation.y = -time * 0.012;
      renderer.render(scene, camera);
    };
    render();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && frame) { cancelAnimationFrame(frame); frame = 0; }
      else if (!document.hidden && visible && !frame) render();
    });
  }
})();