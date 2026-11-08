(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // menu + copy email + German levels (work without any library)
  const btn = $('#menuBtn'), nav = $('#nav');
  const setMenu = o => { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); };
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => e.target.closest('a') && setMenu(false));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  const mail = $('#copyMail'), msg = $('#copied');
  mail.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(mail.dataset.mail); msg.textContent = 'Email address copied'; }
    catch (e) { msg.textContent = 'Copy failed. Use the Email link below.'; }
    setTimeout(() => { msg.textContent = ''; }, 2500);
  });
  const lv = { a1: 'A1: first conversations, everyday phrases and the basics of German grammar.', a2: 'A2: describing your day, asking for things and handling common situations. This is the level I teach.', b1: 'B1: speaking and writing with more independence, and preparing for the Goethe-Zertifikat B1 exam.' };
  $$('.levels button').forEach(b => b.addEventListener('click', () => {
    $$('.levels button').forEach(x => x.setAttribute('aria-selected', x === b));
    $('#lvText').textContent = lv[b.dataset.lv];
  }));

  const curtain = $('#curtain');
  if (!hasGsap || calm) { curtain.remove(); initScene(); return; }

  // smooth scroll
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: .09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const t = $(a.hash); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -10 }); } }));
  }

  // intro: curtain lifts, headline rises line by line
  $$('.ln span').forEach(s => gsap.set(s, { yPercent: 110 }));
  gsap.set('[data-hero]', { y: 24, opacity: 0 });
  gsap.timeline({ delay: .35 })
    .to(curtain, { yPercent: -100, duration: .9, ease: 'power4.inOut' })
    .to('.ln span', { yPercent: 0, duration: 1, stagger: .12, ease: 'power4.out' }, '-=.35')
    .to('[data-hero]', { y: 0, opacity: 1, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.6')
    .add(() => curtain.remove());

  // scroll reveals
  $$('[data-r]').forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

  // horizontal project gallery on desktop
  ScrollTrigger.matchMedia({ '(min-width: 901px)': () => {
    const track = $('.track'), pin = $('.pin');
    const dist = () => track.scrollWidth - innerWidth;
    const tween = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: pin, start: 'top 12%', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true } });
    $$('.p-media img').forEach(img => gsap.fromTo(img, { xPercent: 0 }, { xPercent: -10, ease: 'none', scrollTrigger: { trigger: img.closest('.panel'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }));
  } });

  // cursor + magnetic buttons
  if (fine) {
    const c = $('#cursor'), mx = gsap.quickTo(c, 'x', { duration: .25 }), my = gsap.quickTo(c, 'y', { duration: .25 });
    addEventListener('pointermove', e => { c.style.opacity = 1; mx(e.clientX); my(e.clientY); });
    $$('a,button,[data-role]').forEach(el => { el.addEventListener('pointerenter', () => c.classList.add('big')); el.addEventListener('pointerleave', () => c.classList.remove('big')); });
    $$('.magnetic').forEach(m => {
      const qx = gsap.quickTo(m, 'x', { duration: .4, ease: 'power3' }), qy = gsap.quickTo(m, 'y', { duration: .4, ease: 'power3' });
      m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * .25); qy((e.clientY - r.top - r.height / 2) * .35); });
      m.addEventListener('pointerleave', () => { qx(0); qy(0); });
    });
  }
  initScene();

  // 3D hero: a green network (code and ML) around an amber core (teaching)
  function initScene() {
    const cv = $('#scene');
    const weak = (navigator.hardwareConcurrency || 4) < 4 || calm;
    try {
      if (typeof THREE === 'undefined') return;
      const r = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: !weak });
      r.setPixelRatio(Math.min(devicePixelRatio, weak ? 1 : 2));
      const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(45, 1, .1, 50); cam.position.z = 6;
      const g = new THREE.Group(); scene.add(g);
      const N = weak ? 60 : 110, pts = [], pos = [];
      for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, rad = Math.sqrt(1 - y * y), th = i * 2.399963, k = 1.7 + (Math.random() - .5) * .35; const p = new THREE.Vector3(Math.cos(th) * rad * k, y * k, Math.sin(th) * rad * k); pts.push(p); pos.push(p.x, p.y, p.z); }
      const lp = []; for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (pts[i].distanceTo(pts[j]) < 1.05) lp.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      const geo = a => { const b = new THREE.BufferGeometry(); b.setAttribute('position', new THREE.Float32BufferAttribute(a, 3)); return b; };
      const green = new THREE.Color('#4FD6A8'), amber = new THREE.Color('#F0B46A');
      const lines = new THREE.LineSegments(geo(lp), new THREE.LineBasicMaterial({ color: green, transparent: true, opacity: .35 }));
      const dots = new THREE.Points(geo(pos), new THREE.PointsMaterial({ color: green, size: .07 }));
      const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.85, 1), new THREE.MeshBasicMaterial({ color: amber, wireframe: true, transparent: true, opacity: .55 }));
      g.add(lines, dots, core);
      const size = () => { const w = cv.clientWidth, h = cv.clientHeight; r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); g.position.x = w > 900 ? 2.3 : 0; g.position.y = w > 900 ? 0 : 1.2; };
      size(); addEventListener('resize', size);
      let tx = 0, ty = 0, boost = { net: 1, core: 1 };
      addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * .8; ty = (e.clientY / innerHeight - .5) * .6; });
      $$('[data-role]').forEach(el => { const k = el.dataset.role; const on = () => { boost = k === 'teach' ? { net: .35, core: 2.2 } : { net: 1.6, core: .5 }; }; const off = () => { boost = { net: 1, core: 1 }; }; el.addEventListener('pointerenter', on); el.addEventListener('focus', on); el.addEventListener('pointerleave', off); el.addEventListener('blur', off); });
      let vis = true; new IntersectionObserver(e => { vis = e[0].isIntersecting; }).observe(cv);
      const clock = new THREE.Clock();
      const tick = () => {
        requestAnimationFrame(tick); if (!vis) return;
        const t = clock.getElapsedTime();
        g.rotation.y = t * .12 + tx; g.rotation.x += (ty - g.rotation.x) * .05;
        core.rotation.y = -t * .3; core.rotation.x = t * .2;
        lines.material.opacity += (.22 * boost.net - lines.material.opacity) * .06;
        core.material.opacity += (.4 * boost.core - core.material.opacity) * .06;
        core.scale.setScalar(boost.core > 1 ? 1.15 + Math.sin(t * 2) * .03 : 1);
        r.render(scene, cam);
      };
      tick();
      if (hasGsap && !calm) gsap.to(g.scale, { x: .6, y: .6, z: .6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    } catch (e) { cv.style.display = 'none'; }
  }
})();
