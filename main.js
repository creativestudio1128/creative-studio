/**
 * AURA // CREATIVE STUDIO - Core Application Scripts
 * Cursor, Audio Synthesis, Estimator, Portfolio Filter, Modals, World Clocks
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================
  // 1. Custom Magnetic Smooth Cursor
  // ==========================================
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorFollower = document.querySelector('.cursor-follower');

  if (cursorDot && cursorFollower && window.matchMedia('(pointer: fine)').matches) {
    let mouseX = -100, mouseY = -100;
    let followerX = -100, followerY = -100;
    const speed = 0.18; // lerp ease

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    function renderCursor() {
      followerX += (mouseX - followerX) * speed;
      followerY += (mouseY - followerY) * speed;
      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;
      requestAnimationFrame(renderCursor);
    }
    renderCursor();

    const hoverTargets = document.querySelectorAll('a, button, input, textarea, select, .project-card, .estimator-chip, .radio-card, .service-card, .budget-btn');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  }

  // ==========================================
  // 2. Web Audio API Tactile Sound Engine
  // ==========================================
  let audioCtx = null;
  let isSoundEnabled = false;
  const audioBtn = document.getElementById('audio-toggle');

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSoftChime(freq = 520, type = 'sine', duration = 0.12) {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.8, audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      initAudio();
      isSoundEnabled = !isSoundEnabled;
      audioBtn.classList.toggle('active', isSoundEnabled);
      if (isSoundEnabled) {
        playSoftChime(700, 'triangle', 0.2);
      }
    });

    // Add gentle click audio on interactive buttons
    document.querySelectorAll('button, .filter-btn, .estimator-chip, .radio-card').forEach(el => {
      el.addEventListener('click', () => {
        if (isSoundEnabled) playSoftChime(440, 'sine', 0.08);
      });
    });
  }

  // ==========================================
  // 3. Navigation Header & Mobile Menu
  // ==========================================
  const header = document.querySelector('.site-header');
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileCloseBtn = document.getElementById('mobile-drawer-close');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
    if (mobileCloseBtn) {
      mobileCloseBtn.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        document.body.style.overflow = '';
      });
    }
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // Active section indicator on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const targetNav = document.querySelector(`.nav-link[href*="${sectionId}"]`);
      if (targetNav) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          targetNav.classList.add('active');
        } else {
          targetNav.classList.remove('active');
        }
      }
    });
  }, { passive: true });

  // ==========================================
  // 4. Portfolio Category Filtering
  // ==========================================
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
          }, 30);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px) scale(0.96)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  });

  // ==========================================
  // 5. Case Study Modal Data & Handlers
  // ==========================================
  const caseStudiesData = {
    neura: {
      client: "NEURA AI",
      category: "AI Spatial Interface & Branding",
      year: "2025",
      title: "Pioneering the Next Era of Generative AI Interfaces",
      metrics: [
        { label: "User Adoption", val: "+340%" },
        { label: "Series A Raised", val: "$38M" },
        { label: "Design Award", val: "FWA of the Day" }
      ],
      challenge: "Neura AI engineered breakthrough foundational foundation models, but lacked a visual and spatial interface that communicated trust, superhuman capability, and effortless interaction for enterprise design teams.",
      solution: "We architected an immersive WebGL-powered 3D dashboard, an adaptive multi-modal prompt canvas, and a unified design system that feels like software from the next decade.",
      quote: "AURA transformed our deep-tech prototype into the most talked-about AI design platform of the year. Their vision is unmatched.",
      author: "Elena Rostova — Co-Founder & CEO, Neura AI",
      deliverables: ["Visual Identity System", "WebGL Spatial Canvas", "Design Token Library", "Enterprise Web App", "Launch Video"],
      tags: ["Artificial Intelligence", "WebGL 3D", "Design System", "Product Design"],
      color: "#00f2fe"
    },
    chronos: {
      client: "CHRONOS SWITZERLAND",
      category: "Luxury E-Commerce & 3D",
      year: "2025",
      title: "Haute Horlogerie Reimagined for the Digital Collector",
      metrics: [
        { label: "Conversion Lift", val: "+84%" },
        { label: "Avg Session Time", val: "5m 42s" },
        { label: "Awwwards", val: "Site of the Month" }
      ],
      challenge: "Centuries-old Swiss horology craftsmanship struggled to translate its tactile prestige and meticulous detail onto standard two-dimensional e-commerce catalogs.",
      solution: "Created an interactive 60fps 3D watch configurator with sub-millimeter tourbillon animations, bespoke editorial typography, and high-security checkout.",
      quote: "The digital experience AURA built reflects the exact perfectionism of our master watchmakers. Our collector engagement shattered all previous benchmarks.",
      author: "Henri de Montmirail — Managing Director",
      deliverables: ["Interactive 3D Configurator", "Global E-Commerce Architecture", "Editorial Micro-Interactions", "Sound Identity"],
      tags: ["Luxury Horology", "Three.js 3D", "Headless Commerce", "Editorial"],
      color: "#f59e0b"
    },
    synapse: {
      client: "SYNAPSE CLOUD",
      category: "Enterprise Cloud & Dev Tools",
      year: "2024",
      title: "Simplifying Cloud Telemetry for 50,000+ Engineers",
      metrics: [
        { label: "Time-to-Insight", val: "-62%" },
        { label: "ARR Growth", val: "3.2x" },
        { label: "NPS Score", val: "88" }
      ],
      challenge: "Complex distributed microservices generated billions of log traces daily, overwhelming engineers with clunky, sluggish legacy dashboards.",
      solution: "Engineered a low-latency dark-mode developer workbench with high-density data visualization, instant keyboard shortcuts, and cohesive iconography.",
      quote: "Devs actually love living inside Synapse now. AURA turned enterprise cloud monitoring into an absolute craft.",
      author: "David Chen — VP of Engineering",
      deliverables: ["Complex Data Visualization", "Design System at Scale", "Component SDK", "Documentation Hub"],
      tags: ["Developer Tools", "Data Viz", "SaaS Interface", "React"],
      color: "#8b5cf6"
    },
    solaris: {
      client: "SOLARIS MOTORS",
      category: "Automotive & Motion",
      year: "2024",
      title: "The Digital Rollout for an All-Electric Hypercar",
      metrics: [
        { label: "Pre-orders in 48h", val: "2,400+" },
        { label: "Organic Reach", val: "18M+" },
        { label: "Red Dot Award", val: "Best of Best" }
      ],
      challenge: "Launching an elite electric hypercar with zero heritage required instantly establishing high-luxury credentials and bleeding-edge aerodynamics credibility.",
      solution: "Developed an aerodynamic wind-tunnel simulation page with real-time particle physics, soundscapes recorded from electric dynos, and interactive interior exploration.",
      quote: "AURA delivered a digital launch experience that rivaled Apple keynotes. The pre-orders sold out in two days.",
      author: "Sarah Lindqvist — Chief Brand Officer",
      deliverables: ["Automotive Configurator", "Motion Direction", "Sound Engineering", "Global Campaign Site"],
      tags: ["Automotive", "WebGL Physics", "Interactive 3D", "Sound Design"],
      color: "#ec4899"
    },
    metaform: {
      client: "METAFORM ARCHITECTURE",
      category: "Spatial Design & Studio Portfolio",
      year: "2024",
      title: "Generative Architecture Captured Through Dynamic Canvas",
      metrics: [
        { label: "Inquiry Value", val: "$45M+" },
        { label: "Press Features", val: "65+" },
        { label: "CSSDA", val: "Best UI / UX" }
      ],
      challenge: "A world-renowned avant-garde architectural collective needed a portfolio that matched their physical structures: fluid, monolithic, and structural.",
      solution: "Designed a fluid grid with smooth continuous scroll transitions, structural wireframe renders, and architectural blueprint overlays.",
      quote: "Every corner of our site behaves like our physical structures: bold, precise, and breathtaking.",
      author: "Julian Sterling — Founding Principal",
      deliverables: ["Visual Identity", "Architectural Wireframe Mode", "Editorial Web Platform"],
      tags: ["Architecture", "Editorial", "Continuous Scroll", "Creative Tech"],
      color: "#10b981"
    },
    vox: {
      client: "VOX ACOUSTICS",
      category: "Hardware & Sound Showcase",
      year: "2024",
      title: "Acoustic Engineering Visualized Through Pure Soundwaves",
      metrics: [
        { label: "Kickstarter Funded", val: "1,200%" },
        { label: "Direct Sales", val: "$12M" },
        { label: "Webby Award", val: "Best Visual Design" }
      ],
      challenge: "Convincing audiophiles to purchase high-end planar magnetic headphones online without being able to listen in person.",
      solution: "Built a browser-based frequency spectrum analyzer allowing users to compare sound profiles live, with exploded 3D component views.",
      quote: "They made sound visible. That single insight changed our entire commercial trajectory.",
      author: "Marcus Vance — Head of Product",
      deliverables: ["Hardware 3D Exploded Renders", "Interactive Audio Spectrum", "Brand Packaging"],
      tags: ["Hardware", "Web Audio API", "3D CGI", "Sound Engineering"],
      color: "#38bdf8"
    }
  };

  const modalOverlay = document.getElementById('case-study-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body-content');

  function openCaseStudy(projectId) {
    const data = caseStudiesData[projectId];
    if (!data) return;

    modalBody.innerHTML = `
      <div class="modal-hero-cover" style="background: radial-gradient(circle at center, ${data.color}22 0%, #111118 100%);">
        <div style="text-align: center; padding: 2rem;">
          <span style="font-family: var(--font-mono); font-size: 0.85rem; color: ${data.color}; letter-spacing: 0.15em; text-transform: uppercase;">
            ${data.client} // CASE STUDY
          </span>
          <h2 style="font-size: clamp(1.8rem, 3.5vw, 2.75rem); color: #fff; margin-top: 0.5rem; max-width: 650px;">
            ${data.title}
          </h2>
        </div>
      </div>
      <div class="modal-body">
        <div class="modal-tags">
          ${data.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
        </div>
        <div class="modal-metrics-strip">
          ${data.metrics.map(m => `
            <div>
              <div class="modal-metric-val" style="color: ${data.color};">${m.val}</div>
              <div class="modal-metric-sub">${m.label}</div>
            </div>
          `).join('')}
        </div>
        <div class="modal-content-grid">
          <div>
            <div style="margin-bottom: 2rem;">
              <h4 class="modal-section-h">The Challenge</h4>
              <p>${data.challenge}</p>
            </div>
            <div>
              <h4 class="modal-section-h">Our Strategic Solution</h4>
              <p>${data.solution}</p>
            </div>
            <div class="modal-quote-box" style="border-left-color: ${data.color};">
              <p>"${data.quote}"</p>
              <div style="margin-top: 0.6rem; font-size: 0.8rem; color: var(--text-tertiary); font-family: var(--font-mono);">
                ${data.author}
              </div>
            </div>
          </div>
          <div>
            <h4 class="modal-section-h">Core Deliverables</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2rem;">
              ${data.deliverables.map(d => `
                <li style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: #cbd5e1;">
                  <span style="color: ${data.color}; font-weight: bold;">✔</span> ${d}
                </li>
              `).join('')}
            </ul>
            <button class="btn btn-primary" style="width: 100%;" onclick="document.getElementById('case-study-modal').classList.remove('active'); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});">
              Request Similar Project
            </button>
          </div>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Bind project card clicks
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      const pId = card.getAttribute('data-project');
      openCaseStudy(pId);
    });
  });

  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // ==========================================
  // 6. Interactive Project Scope & Cost Estimator
  // ==========================================
  const serviceChips = document.querySelectorAll('.estimator-chip');
  const timelineCards = document.querySelectorAll('.timeline-card');
  const priceDisplay = document.getElementById('calc-total-price');
  const timelineDisplay = document.getElementById('calc-est-timeline');
  const deliverablesDisplay = document.getElementById('calc-deliverables-count');
  const applyScopeBtn = document.getElementById('apply-scope-to-contact');

  function calculateEstimate() {
    let basePrice = 0;
    let selectedServices = [];

    serviceChips.forEach(chip => {
      if (chip.classList.contains('selected')) {
        basePrice += parseInt(chip.getAttribute('data-cost'), 10) || 0;
        selectedServices.push(chip.getAttribute('data-name'));
      }
    });

    if (basePrice === 0) {
      basePrice = 12000; // default baseline starter
    }

    let multiplier = 1.0;
    let timelineLabel = "8 - 10 Weeks";

    const activeTimeline = document.querySelector('.timeline-card.selected');
    if (activeTimeline) {
      const mode = activeTimeline.getAttribute('data-mode');
      if (mode === 'sprint') {
        multiplier = 1.25;
        timelineLabel = "4 - 6 Weeks (Sprint)";
      } else if (mode === 'standard') {
        multiplier = 1.0;
        timelineLabel = "8 - 10 Weeks (Standard)";
      } else if (mode === 'flexible') {
        multiplier = 0.9;
        timelineLabel = "12 - 16 Weeks (Quarterly)";
      }
    }

    const calculatedLow = Math.round((basePrice * multiplier) / 1000) * 1000;
    const calculatedHigh = Math.round((calculatedLow * 1.3) / 1000) * 1000;

    if (priceDisplay) {
      priceDisplay.textContent = `$${calculatedLow.toLocaleString()} - $${calculatedHigh.toLocaleString()}`;
    }
    if (timelineDisplay) {
      timelineDisplay.textContent = timelineLabel;
    }
    if (deliverablesDisplay) {
      deliverablesDisplay.textContent = `${selectedServices.length || 1} Selected Scope Item${selectedServices.length === 1 ? '' : 's'}`;
    }
  }

  serviceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      calculateEstimate();
    });
  });

  timelineCards.forEach(card => {
    card.addEventListener('click', () => {
      timelineCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      calculateEstimate();
    });
  });

  if (applyScopeBtn) {
    applyScopeBtn.addEventListener('click', () => {
      // Gather selected chips
      const selected = Array.from(document.querySelectorAll('.estimator-chip.selected'))
        .map(c => c.getAttribute('data-name'));

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }

      // Pre-select budget tier based on estimate
      const currentPriceText = priceDisplay ? priceDisplay.textContent : '';
      if (currentPriceText.includes('50,000') || currentPriceText.includes('60,000') || currentPriceText.includes('70,000')) {
        document.querySelectorAll('.budget-btn').forEach(b => {
          if (b.getAttribute('data-val') === 'tier-3') b.click();
        });
      } else {
        document.querySelectorAll('.budget-btn').forEach(b => {
          if (b.getAttribute('data-val') === 'tier-2') b.click();
        });
      }

      // Pre-fill message
      const msgInput = document.getElementById('project-brief');
      if (msgInput && (!msgInput.value || msgInput.value.trim() === '')) {
        msgInput.value = `Hi Aura Team, I estimated my scope on your website: ${selected.length ? selected.join(', ') : 'Creative Partnership'}. Estimated budget target: ${currentPriceText}. Let's schedule a kickoff call.`;
      }
    });
  }

  // Initial calculation
  calculateEstimate();

  // ==========================================
  // 7. Budget Selector in Contact Form
  // ==========================================
  const budgetBtns = document.querySelectorAll('.budget-btn');
  budgetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      budgetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ==========================================
  // 8. Contact Form Submission & Confirmation
  // ==========================================
  const contactForm = document.getElementById('agency-inquiry-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg> Transmitting Brief...
      `;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        if (formStatus) {
          formStatus.className = 'form-status-msg success';
          formStatus.innerHTML = `
            <strong>Inquiry Transmitted Successfully!</strong><br>
            Thank you! Our Founding Partners have received your brief. We will review your project parameters and respond within 24 hours.
          `;
          contactForm.reset();
        }
      }, 1200);
    });
  }

  // Newsletter Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletterForm.querySelector('input');
      if (input && input.value) {
        alert('Thank you for subscribing to AURA // DISPATCHES. You will receive our monthly design & creative technology essays.');
        input.value = '';
      }
    });
  }

  // ==========================================
  // 9. Live World Studio Clocks (NY, LDN, TYO)
  // ==========================================
  function updateWorldClocks() {
    const nyEl = document.getElementById('clock-ny');
    const ldnEl = document.getElementById('clock-ldn');
    const tyoEl = document.getElementById('clock-tyo');

    const now = new Date();

    const optionsNY = { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const optionsLDN = { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const optionsTYO = { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

    if (nyEl) nyEl.textContent = new Intl.DateTimeFormat('en-US', optionsNY).format(now);
    if (ldnEl) ldnEl.textContent = new Intl.DateTimeFormat('en-GB', optionsLDN).format(now);
    if (tyoEl) tyoEl.textContent = new Intl.DateTimeFormat('ja-JP', optionsTYO).format(now);
  }

  setInterval(updateWorldClocks, 1000);
  updateWorldClocks();

  // ==========================================
  // 10. Testimonials Carousel
  // ==========================================
  const track = document.querySelector('.testimonial-track');
  const prevBtn = document.getElementById('testi-prev');
  const nextBtn = document.getElementById('testi-next');
  let currentTestimonialIndex = 0;
  const testimonials = document.querySelectorAll('.testimonial-card');

  function updateCarousel() {
    if (!track) return;
    track.style.transform = `translateX(-${currentTestimonialIndex * 100}%)`;
  }

  if (prevBtn && nextBtn && testimonials.length > 0) {
    nextBtn.addEventListener('click', () => {
      currentTestimonialIndex = (currentTestimonialIndex + 1) % testimonials.length;
      updateCarousel();
    });
    prevBtn.addEventListener('click', () => {
      currentTestimonialIndex = (currentTestimonialIndex - 1 + testimonials.length) % testimonials.length;
      updateCarousel();
    });
  }

  // ==========================================
  // 11. Back to Top Smooth Scroll
  // ==========================================
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==========================================
  // 12. Scroll Reveal Observer
  // ==========================================
  const revealElements = document.querySelectorAll('.service-card, .process-step-card, .team-card, .award-row');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(25px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    revealObserver.observe(el);
  });
});

// Keyframe helper for spinning animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;
document.head.appendChild(styleSheet);
