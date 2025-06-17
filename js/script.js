document.addEventListener('DOMContentLoaded', () => {
  // Initialize Particles.js
  particlesJS('particles-js', {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: '#007bff' },
      shape: { type: 'circle' },
      opacity: { value: 0.5, random: false },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: '#007bff', opacity: 0.4, width: 1 },
      move: { enable: true, speed: 6, direction: 'none', random: false, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { repulse: { distance: 100, duration: 0.4 }, push: { particles_nb: 4 } }
    },
    retina_detect: true
  });

  // Initialize AOS
  AOS.init();

  // Theme Toggle
  const themeSwitch = document.querySelector('.theme-switch');
  themeSwitch.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  });

  // Load saved theme
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Hamburger Menu
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Project Filters
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filter = button.getAttribute('data-filter');
      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Project Modal
  const modal = document.getElementById('project-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTitle = document.querySelector('.modal-title');
  const modalDescription = document.getElementById('modal-description');
  const modalTags = document.getElementById('modal-tags');
  const modalLink = document.getElementById('modal-link');
  const modalClose = document.querySelector('.modal-close');
  const detailsButtons = document.querySelectorAll('.project-details-btn');

  detailsButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.project-card');
      const img = card.querySelector('.project-img')?.src || '';
      const title = card.querySelector('.project-title').textContent;
      const description = card.querySelector('.project-description').textContent;
      const tags = card.querySelectorAll('.tag');
      const githubLink = card.querySelector('.project-link[href*="github"]')?.href || '#';

      modalImg.src = img;
      modalTitle.textContent = title;
      modalDescription.textContent = description;
      modalTags.innerHTML = '';
      tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag.textContent;
        modalTags.appendChild(span);
      });
      modalLink.href = githubLink;

      modal.style.display = 'flex';
    });
  });

  modalClose.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Stat Counter Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const target = parseInt(stat.getAttribute('data-count'));
    let count = 0;
    const increment = target / 100;
    const updateCount = () => {
      if (count < target) {
        count += increment;
        stat.textContent = Math.round(count);
        requestAnimationFrame(updateCount);
      } else {
        stat.textContent = target;
      }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        updateCount();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(stat);
  });

  // Back to Top Button
  const backToTop = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);
    console.log({
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message')
    });
    alert('Form submitted! Check console for details.');
    contactForm.reset();
  });

  // Cursor Glow Effect
  const cursorGlow = document.querySelector('.cursor-glow');
  document.addEventListener('mousemove', (e) => {
    cursorGlow.style.top = `${e.clientY}px`;
    cursorGlow.style.left = `${e.clientX}px`;
  });
});