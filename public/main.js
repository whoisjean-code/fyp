/* ══════════════════════════════════════════════════════════════════════
   ÉLITE INMOBILIARIA — INTERACTIONS & ANIMATIONS
   ══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── WAIT FOR DOM ─── */
  document.addEventListener('DOMContentLoaded', () => {

    /* ── 1. PARTICLE CANVAS ── */
    initParticles();

    /* ── 2. NAVBAR SCROLL ── */
    initNavbar();

    /* ── 3. REVEAL ANIMATIONS ── */
    initReveal();

    /* ── 4. COUNTER ANIMATION ── */
    initCounters();

    /* ── 5. 3D TILT ON BENTO CARDS ── */
    initTilt();

    /* ── 6. MOUSE SPOTLIGHT ON CARDS ── */
    initSpotlight();

    /* ── 7. FORM SUBMIT ── */
    initForm();

    /* ── 8. VALUATION BUTTON ── */
    initValuation();

    /* ── 9. HERO MOUSE PARALLAX ── */
    initHeroParallax();

    /* ── 10. GSAP SCROLL ANIMATIONS ── */
    initGSAP();

    /* ── 11. HERO TITLE GRADIENT ── */
    initHeroTitle();

    /* ── 12. MOBILE NAV ── */
    initMobileNav();

    /* ── 13. HERO CAROUSEL ── */
    initCarousel();

    /* ── 14. PORTFOLIO CAROUSEL & MODAL ── */
    initPortfolio();
  });

  /* ════════════════════════════════════════════════════════════
     PARTICLE CANVAS
     ════════════════════════════════════════════════════════════ */
  function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const PARTICLE_COUNT = 80;
    const GOLD = 'rgba(212,175,55,';

    function resize() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticle() {
      return {
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        r:     Math.random() * 1.5 + 0.3,
        dx:    (Math.random() - 0.5) * 0.3,
        dy:    (Math.random() - 0.5) * 0.3 - 0.1,
        alpha: Math.random() * 0.6 + 0.1,
        life:  Math.random(),
      };
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;
        p.life += 0.003;

        const alpha = p.alpha * Math.sin(p.life * Math.PI);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = GOLD + Math.max(0, alpha) + ')';
        ctx.fill();

        if (p.y < -10 || p.life >= 1) {
          particles[i] = createParticle();
          particles[i].y = canvas.height + 10;
        }
      });

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      resize();
      particles.forEach(p => {
        p.x = Math.random() * canvas.width;
        p.y = Math.random() * canvas.height;
      });
    });

    init();
    draw();
  }

  /* ════════════════════════════════════════════════════════════
     NAVBAR — Scroll Shrink + CTA Spring Click
     ════════════════════════════════════════════════════════════ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const ctaBtn = document.getElementById('navCtaBtn');
    if (!navbar) return;

    /* ── Scroll: add/remove .scrolled for height shrink ── */
    let ticking = false;
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Shrink state
          if (currentScrollY > 60) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }

          // Hide on scroll down, show on scroll up
          if (currentScrollY > lastScrollY && currentScrollY > 150) {
            navbar.classList.add('nav-hidden');
          } else {
            navbar.classList.remove('nav-hidden');
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    /* ── CTA Spring Click ── */
    if (ctaBtn) {
      ctaBtn.addEventListener('mousedown', () => {
        ctaBtn.classList.add('cta-spring');
      });

      ctaBtn.addEventListener('mouseup', () => {
        ctaBtn.classList.remove('cta-spring');
      });

      ctaBtn.addEventListener('mouseleave', () => {
        ctaBtn.classList.remove('cta-spring');
      });
    }
  }

  /* ════════════════════════════════════════════════════════════
     REVEAL ON SCROLL (IntersectionObserver)
     ════════════════════════════════════════════════════════════ */
  function initReveal() {
    const items = document.querySelectorAll('.reveal-item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, i * 80);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    });

    items.forEach(item => observer.observe(item));

    /* Trigger hero items immediately with GSAP */
    setTimeout(() => {
      // Cinematic entry for hero-visual
      if(window.gsap) {
        gsap.fromTo('.hero-visual', 
          { scale: 1.15, filter: 'brightness(0.5)' },
          { scale: 1, filter: 'brightness(1)', duration: 2.5, ease: 'power2.out' }
        );

        // Text reveal for lines
        gsap.to('.reveal-line span', {
          y: 0,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          delay: 0.2
        });

        // Stagger other elements
        gsap.to(['#heroSub', '#heroActions', '.hero-contact'], {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
          delay: 0.8
        });

        // 3D Tilt Parallax on hero-visual
        const heroVisual = document.querySelector('.hero-visual');
        if (heroVisual) {
          heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5; // max -5 deg
            const rotateY = ((x - centerX) / centerX) * 5; // max 5 deg
            
            gsap.to(heroVisual, {
              rotateX: rotateX,
              rotateY: rotateY,
              transformPerspective: 1000,
              duration: 0.5,
              ease: 'power1.out'
            });
          });
          
          heroVisual.addEventListener('mouseleave', () => {
            gsap.to(heroVisual, {
              rotateX: 0,
              rotateY: 0,
              duration: 1,
              ease: 'power2.out'
            });
          });
        }

        // Magnetic button
        const magneticBtn = document.querySelector('.magnetic-btn');
        if (magneticBtn) {
          magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(magneticBtn, {
              x: x * 0.3,
              y: y * 0.3,
              duration: 0.4,
              ease: 'power2.out'
            });
          });
          
          magneticBtn.addEventListener('mouseleave', () => {
            gsap.to(magneticBtn, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: 'elastic.out(1, 0.3)'
            });
          });
        }
      }
    }, 100);
  }

  /* ════════════════════════════════════════════════════════════
     STATS BAR — Scroll Reveal + Count-Up
     ════════════════════════════════════════════════════════════ */
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      const isVisible = entries.some(entry => entry.isIntersecting);
      if (isVisible && !hasAnimated) {
        hasAnimated = true;

        // 1. Trigger CSS staggered fade-up + divider scale animations
        statsBar.classList.add('is-visible');

        // 2. Count-up for numeric blocks only
        counters.forEach((el) => {
          const target = parseInt(el.dataset.target, 10);
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo: starts fast, slows at end
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.floor(eased * target);
            if (progress < 1) requestAnimationFrame(update);
            else el.textContent = target;
          }

          requestAnimationFrame(update);
        });

        observer.disconnect();
      }
    }, { threshold: 0.25 });

    observer.observe(statsBar);
  }

  /* ════════════════════════════════════════════════════════════
     3D TILT EFFECT ON BENTO CARDS
     ════════════════════════════════════════════════════════════ */
  function initTilt() {
    const cards = document.querySelectorAll('.tilt-card');
    if (!cards.length) return;

    const MAX_TILT = 6; // degrees
    const MAX_LIFT = 5; // px

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect  = card.getBoundingClientRect();
        const cx    = rect.left + rect.width  / 2;
        const cy    = rect.top  + rect.height / 2;
        const dx    = (e.clientX - cx) / (rect.width  / 2);
        const dy    = (e.clientY - cy) / (rect.height / 2);
        const rotX  = -dy * MAX_TILT;
        const rotY  =  dx * MAX_TILT;

        card.style.transform =
          `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${MAX_LIFT}px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform =
          'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => { card.style.transition = ''; }, 600);
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s linear';
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     MOUSE SPOTLIGHT ON CARDS
     ════════════════════════════════════════════════════════════ */
  function initSpotlight() {
    const cards = document.querySelectorAll('.bento-card');

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top)  / rect.height) * 100;

        const spotlight = card.querySelector('.card-spotlight');
        if (spotlight) {
          spotlight.style.setProperty('--mx', x + '%');
          spotlight.style.setProperty('--my', y + '%');
        }
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     FORM SUBMIT
     ════════════════════════════════════════════════════════════ */
  function initForm() {
    const form       = document.getElementById('leadForm');
    const submitBtn  = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');

    if (!form || !submitBtn) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name  = document.getElementById('leadName');
      const phone = document.getElementById('leadPhone');

      // Basic validation
      if (!name.value.trim()) { shakeField(name); return; }
      if (!phone.value.trim()) { shakeField(phone); return; }

      // 1. Loading state
      submitBtn.classList.add('loading');

      setTimeout(() => {
        // 2. Success state
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');

        setTimeout(() => {
          // 3. Show success panel
          form.style.opacity = '0';
          form.style.transform = 'translateY(-20px)';
          form.style.transition = 'opacity 0.4s, transform 0.4s';

          setTimeout(() => {
            form.style.display = 'none';
            formSuccess.removeAttribute('hidden');
            formSuccess.style.opacity = '0';

            setTimeout(() => {
              formSuccess.style.opacity = '1';
              formSuccess.style.transition = 'opacity 0.5s';
            }, 50);
          }, 400);
        }, 600);
      }, 2000);
    });
  }

  function shakeField(input) {
    input.style.animation = 'shakeField 0.5s ease';
    input.parentElement.querySelector('.field-line').style.background = '#ff5f56';
    setTimeout(() => {
      input.style.animation = '';
    }, 500);
  }

  // Inject shake keyframes
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes shakeField {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  /* ════════════════════════════════════════════════════════════
     VALUATION BUTTON
     ════════════════════════════════════════════════════════════ */
  function initValuation() {
    const btn   = document.getElementById('btnCalcular');
    const input = document.getElementById('propertyAddress');
    const hint  = document.getElementById('valuationHint');

    if (!btn || !input) return;

    btn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!val) {
        input.focus();
        input.parentElement.style.borderColor = 'rgba(255,95,86,0.5)';
        setTimeout(() => {
          input.parentElement.style.borderColor = 'rgba(212,175,55,0.2)';
        }, 1500);
        return;
      }

      btn.innerHTML = '<span class="valuation-spinner"></span>';
      const spinner = document.createElement('style');
      spinner.textContent = `
        .valuation-spinner {
          display:inline-block;width:16px;height:16px;
          border:2px solid rgba(0,0,0,0.2);
          border-top-color:#000;border-radius:50%;
          animation:spin 0.8s linear infinite;
        }
      `;
      document.head.appendChild(spinner);

      setTimeout(() => {
        btn.innerHTML = '<span>✓ Enviado</span>';
        if (hint) {
          hint.textContent = '¡Recibirás tu valoración en 24h!';
          hint.style.color = 'rgba(39,201,63,0.8)';
        }
        setTimeout(() => {
          btn.innerHTML = '<span>Calcular →</span>';
        }, 3000);
      }, 1800);
    });
  }

  /* ════════════════════════════════════════════════════════════
     HERO MOUSE PARALLAX
     ════════════════════════════════════════════════════════════ */
  function initHeroParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    const pills = document.querySelectorAll('.pill');
    const houseImg = document.getElementById('heroHouseImg');

    if (!heroVisual) return;

    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;

    document.addEventListener('mousemove', (e) => {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;
      mouseX = (e.clientX - cx) / cx;
      mouseY = (e.clientY - cy) / cy;
    }, { passive: true });

    function animate() {
      targetX += (mouseX - targetX) * 0.06;
      targetY += (mouseY - targetY) * 0.06;

      if (houseImg) {
        houseImg.style.transform =
          `translateX(${targetX * -12}px) translateY(${targetY * -8}px)`;
      }

      pills.forEach((pill, i) => {
        const factor = (i + 1) * 5;
        pill.style.transform =
          `translateX(${targetX * factor}px) translateY(${targetY * factor}px)`;
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

  /* ════════════════════════════════════════════════════════════
     GSAP SCROLL ANIMATIONS
     ════════════════════════════════════════════════════════════ */
  function initGSAP() {
    // Wait for GSAP to load
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // Retry after scripts load
      window.addEventListener('load', () => {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
          setupGSAP();
        }
      });
      return;
    }
    setupGSAP();
  }

  function setupGSAP() {
    gsap.registerPlugin(ScrollTrigger);

    // Bento cards stagger entrance
    gsap.from('.bento-card', {
      scrollTrigger: {
        trigger: '.bento-grid',
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    });



    // Lead terminal entrance
    gsap.from('.lead-terminal', {
      scrollTrigger: {
        trigger: '.lead-section',
        start: 'top 75%',
      },
      y: 80,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });

    // Parallax on pills during scroll
    gsap.to('.pill--1', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
      y: -60,
    });

    gsap.to('.pill--2', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 2,
      },
      y: -40,
    });

    gsap.to('.pill--gold', {
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      y: -80,
    });

    // Section title reveal
    document.querySelectorAll('.section-title').forEach(el => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
        x: -40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     HERO CAROUSEL — Data-driven Slider
     ════════════════════════════════════════════════════════════ */
  async function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    if (!track || !dotsContainer) return;

    /* ── Data Source (Dynamic API Fetch) ── */
    let slides = [];
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data && data.length > 0) {
        slides = data.map(vid => ({
          src: vid.video_url,
          alt: vid.title
        }));
      }
    } catch (e) {
      console.error('Error fetching videos:', e);
    }

    if (slides.length === 0) {
      // Fallback
      slides = [
        {
          src: 'https://www.w3schools.com/html/mov_bbb.mp4',
          alt: 'Video de muestra',
        }
      ];
    }

    let current = 0;

    /* ── Build Slides ── */
    let hasVideo = false;
    slides.forEach((slide, i) => {
      const div = document.createElement('div');
      div.className = 'carousel-slide' + (i === 0 ? ' is-active' : '');

      const isVideo = slide.src.match(/\.(mp4|webm|ogg|mov)$/i);
      let media;
      if (isVideo) {
          hasVideo = true;
          media = document.createElement('video');
          media.src = slide.src;
          media.muted = true; // Must start muted for browsers
          media.loop = true;
          media.playsInline = true;
          media.className = 'carousel-video';
          
          // Perfectly fill the 9:16 container
          media.style.width = '100%';
          media.style.height = '100%';
          media.style.objectFit = 'cover';
      } else {
          media = document.createElement('img');
          media.src = slide.src;
          media.alt = slide.alt;
          media.loading = i === 0 ? 'eager' : 'lazy';
          media.draggable = false;
          media.style.width = '100%';
          media.style.height = '100%';
          media.style.objectFit = 'cover';
      }
      
      // Removed fullscreen click listener as per user request
      
      div.appendChild(media);
      track.appendChild(div);

      /* Dot */
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Ir a imagen ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    // Add sound toggle button if there are videos
    if (hasVideo) {
      const soundBtn = document.createElement('button');
      soundBtn.innerHTML = '🔇';
      soundBtn.style.position = 'absolute';
      soundBtn.style.top = '16px';
      soundBtn.style.right = '16px';
      soundBtn.style.zIndex = '100';
      soundBtn.style.background = 'rgba(0,0,0,0.6)';
      soundBtn.style.color = '#fff';
      soundBtn.style.border = '1px solid rgba(255,255,255,0.2)';
      soundBtn.style.width = '32px';
      soundBtn.style.height = '32px';
      soundBtn.style.borderRadius = '50%';
      soundBtn.style.cursor = 'pointer';
      soundBtn.style.fontSize = '1rem';
      soundBtn.style.display = 'flex';
      soundBtn.style.alignItems = 'center';
      soundBtn.style.justifyContent = 'center';
      soundBtn.style.backdropFilter = 'blur(8px)';
      soundBtn.title = "Activar Sonido";
      
      let isMuted = true;
      soundBtn.addEventListener('click', (e) => {
        isMuted = !isMuted;
        soundBtn.innerHTML = isMuted ? '🔇' : '🔊';
        soundBtn.title = isMuted ? "Activar Sonido" : "Silenciar";
        document.querySelectorAll('.carousel-video').forEach(vid => {
          vid.muted = isMuted;
        });
      });
      
      document.getElementById('heroCarousel').appendChild(soundBtn);
    }

    const allSlides = track.querySelectorAll('.carousel-slide');
    const allDots = dotsContainer.querySelectorAll('.carousel-dot');

    function goTo(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;

      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;

      allSlides.forEach((s, i) => {
        s.classList.toggle('is-active', i === current);
        
        // Handle video playback so they don't overlap sound
        const video = s.querySelector('video');
        if (video) {
          if (i === current) {
            video.currentTime = 0; // Restart video when sliding to it
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(e => console.log('Autoplay prevented', e));
            }
          } else {
            video.pause();
          }
        }
      });
      allDots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    }

    /* ── Arrows ── */
    if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); });

    /* ── Touch / Swipe ── */
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? current + 1 : current - 1);
      }
    }, { passive: true });

    // Initialize first slide playback
    goTo(0);
  }

  /* ════════════════════════════════════════════════════════════
     HERO TEXT — Staggered Cascade Reveal
     ════════════════════════════════════════════════════════════ */
  function initHeroTitle() {
    const staggerItems = document.querySelectorAll('.hero-stagger');
    if (!staggerItems.length) return;

    // Trigger cascade after a brief initial delay for page settle
    setTimeout(() => {
      staggerItems.forEach((el, i) => {
        setTimeout(() => {
          el.classList.add('is-visible');
        }, i * 150); // 150ms stagger between each element
      });
    }, 150);
  }

  /* ════════════════════════════════════════════════════════════
     MOBILE NAV
     ════════════════════════════════════════════════════════════ */
  function initMobileNav() {
    const burger = document.getElementById('navBurger');
    const navLinks = document.querySelector('.nav-links');
    if (!burger || !navLinks) return;

    // Inject mobile nav styles
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .nav-links.mobile-open {
          display: flex !important;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11,9,8,0.97);
          backdrop-filter: blur(20px);
          z-index: 200;
          align-items: center;
          justify-content: center;
          gap: 48px;
        }
        .nav-links.mobile-open .nav-link {
          font-size: 32px;
          letter-spacing: 0.15em;
        }
        .nav-burger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .nav-burger.open span:nth-child(2) {
          opacity: 0;
        }
        .nav-burger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }
      }
    `;
    document.head.appendChild(style);

    burger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('mobile-open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('mobile-open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     PORTFOLIO CAROUSEL & DATA FETCH
     ════════════════════════════════════════════════════════════ */
  async function initPortfolio() {
    const track = document.getElementById('portfolioTrack');
    const tabs = document.querySelectorAll('.portfolio-tab');
    const prevBtn = document.getElementById('portfolioPrev');
    const nextBtn = document.getElementById('portfolioNext');
    if (!track) return;

    let allProperties = [];

    try {
      const res = await fetch('/api/properties');
      allProperties = await res.json();
      // Update dynamic stat
      const propStat = document.getElementById('propiedadesRedStat');
      if (propStat) {
        propStat.dataset.target = allProperties.length;
        const statsBar = document.querySelector('.stats-bar');
        // If already triggered, re-run the animation for this specific element
        if (statsBar && statsBar.classList.contains('is-visible')) {
            const target = allProperties.length;
            const duration = 2000;
            const start = performance.now();
            function update(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
              propStat.textContent = Math.floor(eased * target);
              if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }
      }
    } catch (e) {
      console.error('Error fetching properties:', e);
      return;
    }

    const districtContainer = document.getElementById('portfolioDistricts');

    function renderProperties(categoryFilter, districtFilter = 'Todos') {
      track.innerHTML = '';
      
      // Filter by category
      let categoryFiltered = categoryFilter === 'todos' ? allProperties : allProperties.filter(p => p.category === categoryFilter);

      // Extract unique districts and counts from this category
      const districtCounts = {};
      categoryFiltered.forEach(p => {
        const loc = p.location?.trim();
        if (loc) {
          districtCounts[loc] = (districtCounts[loc] || 0) + 1;
        }
      });

      const sortedDistricts = Object.keys(districtCounts).sort((a, b) => a.localeCompare(b));

      // Render district pills if there are actual locations
      if (sortedDistricts.length > 0) {
        districtContainer.style.display = 'flex';
        
        let html = `<button class="portfolio-district-btn ${'Todos' === districtFilter ? 'active' : ''}" data-district="Todos">Todos (${categoryFiltered.length})</button>`;
        
        html += sortedDistricts.map(d => 
          `<button class="portfolio-district-btn ${d === districtFilter ? 'active' : ''}" data-district="${d}">${d} <span style="opacity:0.6; font-size:0.9em;">(${districtCounts[d]})</span></button>`
        ).join('');
        
        districtContainer.innerHTML = html;
        
        // Bind district click
        districtContainer.querySelectorAll('.portfolio-district-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            renderProperties(categoryFilter, btn.dataset.district);
          });
        });
      } else {
        districtContainer.style.display = 'none';
        districtContainer.innerHTML = '';
      }

      // Filter by district if selected
      const finalFiltered = districtFilter === 'Todos' ? categoryFiltered : categoryFiltered.filter(p => p.location?.trim() === districtFilter);

      if (finalFiltered.length === 0) {
        track.innerHTML = '<p style="color:#777; padding:40px; text-align:center; width:100%;">No hay propiedades en este filtro.</p>';
        return;
      }

      finalFiltered.forEach(prop => {
        const article = document.createElement('article');
        article.className = 'property-card reveal-item';
        article.setAttribute('data-category', prop.category || 'terrenos');

        // Build images array
        const images = (prop.images && prop.images.length > 0)
          ? prop.images.map(i => i.image_url)
          : [prop.image_url || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800'];

        let statusClass = '';
        if (prop.status) {
          const s = prop.status.toLowerCase();
          if (s.includes('disponible')) statusClass = 'status-green';
          else if (s.includes('ocupado') || s.includes('vendido') || s.includes('alquilado')) statusClass = 'status-red';
          else if (s.includes('negociaci') || s.includes('proceso') || s.includes('separado')) statusClass = 'status-yellow';
        }
        const badgeHtml = prop.status ? `<span class="property-card__badge ${statusClass}">${prop.status}</span>` : '';

        let specsHtml = '';
        if (prop.area) specsHtml += `<span class="spec-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/><path d="M3 9h18"/><path d="M3 15h18"/></svg> ${prop.area}</span>`;
        if (prop.bedrooms) specsHtml += `<span class="spec-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v11m0-4h18m0 4V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z"/></svg> ${prop.bedrooms}</span>`;
        if (prop.bathrooms) specsHtml += `<span class="spec-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6 6.5 9.5a1.5 1.5 0 0 0 2 2.5l2.5-2.5"/><path d="M3 9l3-3"/><path d="M11.5 11.5L6 17a3.5 3.5 0 0 0 5 5l5.5-5.5"/><path d="M22 2 12 12"/></svg> ${prop.bathrooms}</span>`;

        // Mini carousel HTML
        const miniCarouselHtml = images.length > 1
          ? `<div class="mini-carousel" data-index="0">
               <div class="mini-carousel__track" style="transform:translateX(0%)">
                 ${images.map(src => `<img src="${src}" alt="${prop.title}" class="mini-carousel__img" loading="lazy">`).join('')}
               </div>
               <button class="mini-carousel__arrow mini-carousel__prev" aria-label="Anterior">‹</button>
               <button class="mini-carousel__arrow mini-carousel__next" aria-label="Siguiente">›</button>
               <div class="mini-carousel__counter">${images.length} fotos</div>
             </div>`
          : `<img src="${images[0]}" alt="${prop.title}" class="property-card__image" loading="lazy">`;

        // Parse description into features list
        const descText = prop.description || '';
        let featureListHtml = '';
        if (descText.trim()) {
          const lines = descText.split('\n').map(l => l.replace(/^[-\*✓]\s*/, '').trim()).filter(Boolean);
          if (lines.length > 0) {
            featureListHtml = `<ul class="modal-features">${lines.map(l => `<li>${l}</li>`).join('')}</ul>`;
          }
        }

        // Define contact buttons
        const btnWspUrl = `https://wa.me/51920670683?text=Hola,%20me%20interesa%20la%20propiedad:%20${encodeURIComponent(prop.title)}`;
        const wspBtnHtml = `<a href="${btnWspUrl}" target="_blank" rel="noopener" class="btn-whatsapp" style="width:100%;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:8px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg> Agendar Visita</a>`;
        const mapBtnHtml = prop.map_url ? `<a href="${prop.map_url}" target="_blank" rel="noopener" class="btn-dossier" style="width:100%;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:8px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Ver en Google Maps</a>` : '';

        article.innerHTML = `
          <div class="property-card-inner">
            <div class="property-card-front">
              <div class="property-card__image-wrapper">
                ${badgeHtml}
                ${miniCarouselHtml}
              </div>
              <div class="property-card__content">
                <h3 class="property-card__title">${prop.title}</h3>
                <p class="property-card__price">${prop.price}</p>
                <div class="property-card__specs">${specsHtml}</div>
                <p class="property-card__location"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${prop.location}</p>
                <div class="property-card__footer">
                  <button type="button" class="btn-solid btn-details">Ver Detalles</button>
                </div>
              </div>
            </div>
            
            <div class="property-card-back">
              <div class="property-card-back__header">
                <h3 class="property-card-back__title">${prop.title}</h3>
                <button type="button" class="btn-flip-back" aria-label="Volver">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              </div>
              <div class="property-card-back__content">
                ${featureListHtml}
                <div class="property-card-back__footer">
                  ${wspBtnHtml}
                  ${mapBtnHtml}
                </div>
              </div>
            </div>
          </div>
        `;

        // Store prop data on element
        article._propData = prop;
        article._images = images;
        
        // Bind flip events
        article.querySelector('.btn-details').addEventListener('click', (e) => {
          e.preventDefault();
          article.classList.add('is-flipped');
        });
        article.querySelector('.btn-flip-back').addEventListener('click', (e) => {
          e.preventDefault();
          article.classList.remove('is-flipped');
        });
        
        // Bind lightbox event on image wrapper
        const imgWrapper = article.querySelector('.property-card__image-wrapper');
        imgWrapper.style.cursor = 'pointer';
        imgWrapper.addEventListener('click', (e) => {
          if (e.target.closest('.mini-carousel__arrow')) return;
          if (window.openLightbox) {
            window.openLightbox(images, 0);
          }
        });

        track.appendChild(article);
      });

      // Init mini carousels
      track.querySelectorAll('.mini-carousel').forEach(mc => {
        const mcTrack = mc.querySelector('.mini-carousel__track');
        const imgCount = mc.querySelectorAll('.mini-carousel__img').length;
        let idx = 0;

        mc.querySelector('.mini-carousel__prev').addEventListener('click', (e) => {
          e.stopPropagation();
          idx = (idx - 1 + imgCount) % imgCount;
          mcTrack.style.transform = `translateX(-${idx * 100}%)`;
        });
        mc.querySelector('.mini-carousel__next').addEventListener('click', (e) => {
          e.stopPropagation();
          idx = (idx + 1) % imgCount;
          mcTrack.style.transform = `translateX(-${idx * 100}%)`;
        });
      });

      // Reveal animation for dynamic cards
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('is-visible');
            }, i * 100);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
      
      track.querySelectorAll('.property-card').forEach(card => observer.observe(card));

    }

    // Initial render — default to first active tab
    const activeTab = document.querySelector('.portfolio-tab.active');
    renderProperties(activeTab ? activeTab.dataset.filter : 'terrenos');

    // Tab filtering
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderProperties(tab.dataset.filter);
        track.scrollTo({ left: 0, behavior: 'smooth' });
      });
    });

    // Carousel scroll controls
    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => { track.scrollBy({ left: -350, behavior: 'smooth' }); });
      nextBtn.addEventListener('click', () => { track.scrollBy({ left: 350, behavior: 'smooth' }); });
    }
  }

  /* ════════════════════════════════════════════════════════════
     CUSTOM FORM LOGIC (Dropdown & WhatsApp)
     ════════════════════════════════════════════════════════════ */
  function initContactForm() {
    const customSelect = document.getElementById('customServiceSelect');
    const hiddenInput = document.getElementById('formService');
    const displaySpan = customSelect?.querySelector('.custom-select-text');
    const options = customSelect?.querySelectorAll('.custom-option');
    const contactForm = document.getElementById('contactForm');

    // 1. Dropdown Logic
    if (customSelect) {
      customSelect.addEventListener('click', () => {
        customSelect.classList.toggle('open');
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
          customSelect.classList.remove('open');
        }
      });

      // Select option
      options.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = opt.getAttribute('data-value');
          const text = opt.textContent;
          
          displaySpan.textContent = text;
          displaySpan.classList.add('has-value');
          hiddenInput.value = value;
          customSelect.classList.remove('open');
        });
      });
    }

    // 2. WhatsApp Submission Logic
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('formName');
        const phoneInput = document.getElementById('formPhone');
        const emailInput = document.getElementById('formEmail');
        const serviceInput = document.getElementById('formService');
        const messageInput = document.getElementById('formMessage');

        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        const email = emailInput.value.trim() || 'No especificado';
        const service = serviceInput.value.trim();
        const message = messageInput.value.trim() || 'No especificado';

        // Reset previous borders
        const wrappers = contactForm.querySelectorAll('.input-wrapper');
        wrappers.forEach(w => w.style.borderColor = '');

        let hasError = false;

        if (!name) {
          nameInput.closest('.input-wrapper').style.borderColor = '#ef4444';
          hasError = true;
        }
        if (!phone) {
          phoneInput.closest('.input-wrapper').style.borderColor = '#ef4444';
          hasError = true;
        }
        if (!service) {
          serviceInput.closest('.input-wrapper').style.borderColor = '#ef4444';
          hasError = true;
        }

        if (hasError) {
          setTimeout(() => {
             wrappers.forEach(w => w.style.borderColor = '');
          }, 3000);
          return;
        }

        const phoneNumber = '51920670683';
        
        const text = `*Nuevo Prospecto Inmobiliario* 🏢\n\n*Nombre:* ${name}\n*Celular:* ${phone}\n*Correo:* ${email}\n*Interés:* ${service}\n\n*Mensaje adicional:*\n${message}`;

        const encodedText = encodeURIComponent(text);
        const waLink = `https://wa.me/${phoneNumber}?text=${encodedText}`;

        window.open(waLink, '_blank');
        
        // Reset form after a brief delay
        setTimeout(() => {
          contactForm.reset();
          if (displaySpan) {
            displaySpan.textContent = 'Estoy interesado en...';
            displaySpan.classList.remove('has-value');
          }
          if (hiddenInput) hiddenInput.value = '';
          const counter = contactForm.querySelector('.char-counter');
          if (counter) counter.textContent = '0/250';
        }, 1000);
      });
    }
  }

  // Initialize the new form logic immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm);
  } else {
    initContactForm();
  }

  /* ════════════════════════════════════════════════════════════
     FAQ MODAL & ACCORDION
     ════════════════════════════════════════════════════════════ */
  function initFAQModal() {
    const btnOpen = document.getElementById('faqCardBtn');
    const overlay = document.getElementById('faqModalOverlay');
    const btnClose = document.getElementById('faqModalClose');
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    if (!btnOpen || !overlay || !btnClose) return;

    const openModal = () => {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      
      // Resetea el acordeón al cerrar
      setTimeout(() => {
        accordionHeaders.forEach(header => header.setAttribute('aria-expanded', 'false'));
      }, 400); // Espera a que termine la animación del modal
    };

    btnOpen.addEventListener('click', openModal);
    btnClose.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    
    // El listener global de Escape ya existe en propertyModal pero aquí es seguro agregarlo porque comprobamos la clase 'active'
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });

    // Accordion Logic
    accordionHeaders.forEach(header => {
      header.addEventListener('click', () => {
        const isExpanded = header.getAttribute('aria-expanded') === 'true';
        
        // Cierra los demás acordeones para mantener solo uno abierto
        accordionHeaders.forEach(h => h.setAttribute('aria-expanded', 'false'));

        // Abre el que fue clickeado si estaba cerrado
        if (!isExpanded) {
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQModal);
  } else {
    initFAQModal();
  }

  /* ════════════════════════════════════════════════════════════
     LEGAL MODALS & RECLAMACIONES
     ════════════════════════════════════════════════════════════ */
  function initLegalModals() {
    const modals = [
      { openBtn: 'openPrivacyModal', overlay: 'privacyModalOverlay' },
      { openBtn: 'openTermsModal', overlay: 'termsModalOverlay' },
      { openBtn: 'openReclamacionesModal', overlay: 'reclamacionesModalOverlay' }
    ];

    modals.forEach(({ openBtn, overlay }) => {
      const btnEl = document.getElementById(openBtn);
      const overlayEl = document.getElementById(overlay);
      if (!btnEl || !overlayEl) return;
      
      const closeBtn = overlayEl.querySelector('.faq-close');

      const openModal = (e) => {
        e.preventDefault();
        overlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';
      };

      const closeModal = () => {
        overlayEl.classList.remove('active');
        document.body.style.overflow = '';
      };

      btnEl.addEventListener('click', openModal);
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      overlayEl.addEventListener('click', (e) => {
        if (e.target === overlayEl) closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlayEl.classList.contains('active')) closeModal();
      });
    });

    // Reclamaciones Form Submit
    const form = document.getElementById('reclamacionesForm');
    const submitBtn = document.getElementById('reclamacionesSubmitBtn');
    
    if (form && submitBtn) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>ENVIANDO...</span>';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        const payload = {
          name: document.getElementById('recName').value,
          dni: document.getElementById('recDni').value,
          email: document.getElementById('recEmail').value,
          phone: document.getElementById('recPhone').value,
          address: document.getElementById('recAddress').value,
          serviceType: document.getElementById('recType').value,
          amount: document.getElementById('recAmount').value,
          category: form.querySelector('input[name="recCategory"]:checked').value,
          detail: document.getElementById('recDetail').value,
          request: document.getElementById('recRequest').value
        };

        try {
          const response = await fetch('/api/reclamaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await response.json();
          if (response.ok) {
            alert('Reclamo enviado exitosamente. Se ha enviado una copia en PDF a su correo.');
            form.reset();
            document.getElementById('reclamacionesModalOverlay').classList.remove('active');
            document.body.style.overflow = '';
          } else {
            alert('Error al enviar el reclamo: ' + (data.error || 'Intente nuevamente.'));
          }
        } catch (error) {
          console.error(error);
          alert('Error de conexión. Por favor intente nuevamente.');
        } finally {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
        }
      });
    }
  }

  /* ════════════════════════════════════════════════════════════
     LIGHTBOX GALLERY
     ════════════════════════════════════════════════════════════ */
  window.openLightbox = function(images, startIndex = 0) {
    const overlay = document.getElementById('lightboxOverlay');
    const imgEl = document.getElementById('lightboxImg');
    const counter = document.getElementById('lightboxCounter');
    if (!overlay || !imgEl) return;

    let currentIndex = startIndex;

    const updateImage = () => {
      imgEl.src = images[currentIndex];
      counter.textContent = `${currentIndex + 1} / ${images.length}`;
      
      const prevBtn = document.getElementById('lightboxPrev');
      const nextBtn = document.getElementById('lightboxNext');
      if (prevBtn && nextBtn) {
        prevBtn.style.display = images.length > 1 ? 'block' : 'none';
        nextBtn.style.display = images.length > 1 ? 'block' : 'none';
      }
    };

    updateImage();
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Navigation
    window._lightboxNext = () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateImage();
    };
    window._lightboxPrev = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateImage();
    };
    window._lightboxClose = () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', window._lightboxKeydown);
    };
    
    // Cleanup old listeners if any
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const closeBtn = document.getElementById('lightboxClose');
    
    prevBtn.onclick = (e) => { e.stopPropagation(); window._lightboxPrev(); };
    nextBtn.onclick = (e) => { e.stopPropagation(); window._lightboxNext(); };
    closeBtn.onclick = (e) => { e.stopPropagation(); window._lightboxClose(); };
    overlay.onclick = (e) => { if (e.target === overlay) window._lightboxClose(); };

    window._lightboxKeydown = (e) => {
      if (e.key === 'Escape') window._lightboxClose();
      if (e.key === 'ArrowRight') window._lightboxNext();
      if (e.key === 'ArrowLeft') window._lightboxPrev();
    };
    document.addEventListener('keydown', window._lightboxKeydown);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLegalModals);
  } else {
    initLegalModals();
  }

  // Initialise Service Info Modals
  function initServiceModals() {
    const overlay = document.getElementById('serviceInfoModalOverlay');
    const closeBtn = document.getElementById('closeServiceInfoModal');
    const titleEl = document.getElementById('serviceInfoTitle');
    const descEl = document.getElementById('serviceInfoDesc');

    if (!overlay || !closeBtn || !titleEl || !descEl) return;

    const closeServiceModal = () => {
      overlay.classList.remove('active');
      setTimeout(() => { overlay.style.display = 'none'; }, 300);
    };

    closeBtn.addEventListener('click', closeServiceModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeServiceModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeServiceModal();
    });

    const serviceBtns = document.querySelectorAll('[data-service-title]');
    serviceBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        titleEl.textContent = btn.getAttribute('data-service-title');
        descEl.textContent = btn.getAttribute('data-service-desc');
        overlay.style.display = 'flex';
        // Allow time for display:flex to apply before adding class for opacity transition
        setTimeout(() => overlay.classList.add('active'), 10);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServiceModals);
  } else {
    initServiceModals();
  }
})();
