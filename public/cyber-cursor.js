/**
 * Cyberpunk HUD Cursor System
 * A self-contained, high-performance, responsive target reticle cursor overlay.
 * Replaces the default OS pointer with a dynamic, lerped sci-fi UI element.
 */
(function() {
  if (typeof window === 'undefined') return;

  const init = () => {
    // Avoid duplicate initialization
    if (document.getElementById('cyber-hud-cursor-wrapper')) return;

    // Inject styles
    const style = document.createElement('style');
    style.id = 'cyber-hud-cursor-styles';
    style.textContent = `
      /* Global Cursor Reset - Only applies when cursor is active */
      .hud-cursor-enabled,
      .hud-cursor-enabled *,
      .hud-cursor-enabled a,
      .hud-cursor-enabled button,
      .hud-cursor-enabled input,
      .hud-cursor-enabled select,
      .hud-cursor-enabled textarea,
      .hud-cursor-enabled [role="button"] {
        cursor: none !important;
      }

      /* Cursor Base Container */
      #cyber-hud-cursor-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 60px;
        height: 60px;
        margin-top: -30px;
        margin-left: -30px;
        pointer-events: none;
        z-index: 9999999;
        mix-blend-mode: screen;
        will-change: transform;
        opacity: 0;
        transition: opacity 300ms ease-out;
      }

      /* Inner Interactive Container */
      .hud-cursor-inner {
        width: 100%;
        height: 100%;
        transform: scale(1);
        transform-origin: center;
        transition: transform 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }

      /* Ring Compression on Click */
      .hud-clicking .hud-cursor-inner {
        transform: scale(0.7) !important;
        transition: transform 80ms ease-out !important;
      }

      /* Pulse Ring (Default state) */
      .hud-pulse {
        fill: none;
        stroke: #00FFFF;
        stroke-width: 1px;
        transform-origin: 50px 50px;
        animation: hud-default-pulse 2s infinite cubic-bezier(0.16, 1, 0.3, 1);
        opacity: 0.4;
      }

      @keyframes hud-default-pulse {
        0% { transform: scale(0.6); opacity: 0.8; }
        100% { transform: scale(1.8); opacity: 0; }
      }

      /* Extra Concentric Rings for Hover State */
      .hud-hover-pulse-1, .hud-hover-pulse-2 {
        fill: none;
        stroke-dasharray: 4 2;
        transform-origin: 50px 50px;
        opacity: 0;
        transition: opacity 180ms ease-in-out;
      }

      .hud-hover .hud-hover-pulse-1 {
        stroke: #00FFFF;
        opacity: 0.6;
        animation: hud-hover-pulse-seq1 1.5s infinite cubic-bezier(0.16, 1, 0.3, 1);
      }

      .hud-hover .hud-hover-pulse-2 {
        stroke: #FF00FF;
        opacity: 0.6;
        animation: hud-hover-pulse-seq2 1.5s infinite cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes hud-hover-pulse-seq1 {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.2); opacity: 0; }
      }

      @keyframes hud-hover-pulse-seq2 {
        0% { transform: scale(1.1); opacity: 0; }
        15% { transform: scale(1.1); opacity: 0.6; }
        100% { transform: scale(2.6); opacity: 0; }
      }

      /* Radar Sweep Arc */
      .hud-radar {
        transform-origin: 50px 50px;
        animation: hud-rotate-radar 4s infinite linear;
      }

      @keyframes hud-rotate-radar {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Concentric Ring Elements */
      .hud-outer-ring {
        transform-origin: 50px 50px;
        transition: transform 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275), stroke-width 180ms ease-in-out, filter 180ms ease-in-out;
        stroke: #00FFFF;
        stroke-width: 1.5px;
        fill: none;
      }

      .hud-hover .hud-outer-ring {
        transform: scale(1.6);
        stroke-width: 1.2px;
        filter: drop-shadow(0 0 4px rgba(0, 255, 255, 0.8));
      }

      .hud-inner-ring {
        transform-origin: 50px 50px;
        transition: transform 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275), stroke-width 180ms ease-in-out;
        stroke: #FF00FF;
        stroke-width: 1.5px;
        fill: none;
      }

      .hud-hover .hud-inner-ring {
        transform: scale(1.2);
        stroke-width: 1.2px;
      }

      /* Ticks elements */
      .hud-ticks {
        transform-origin: 50px 50px;
        transition: transform 180ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 180ms ease-in-out, filter 180ms ease-in-out;
        opacity: 0.7;
      }

      .hud-hover .hud-ticks {
        transform: rotate(45deg);
        opacity: 1;
        filter: drop-shadow(0 0 2px rgba(0, 255, 255, 0.9));
      }

      /* Center Dot Glow */
      .hud-center-dot {
        fill: #FFFFFF;
        transition: filter 180ms ease-in-out;
      }

      .hud-hover .hud-center-dot {
        filter: drop-shadow(0 0 3px #FF00FF);
      }

      /* Particle Explosions */
      .hud-click-particle {
        position: absolute;
        width: 3px;
        height: 3px;
        border-radius: 50%;
        pointer-events: none;
        animation: hud-particle-fade-out 400ms cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
      }

      @keyframes hud-particle-fade-out {
        0% {
          transform: translate(0, 0) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(var(--tx), var(--ty)) scale(0.2);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Create Cursor Elements
    const wrapper = document.createElement('div');
    wrapper.id = 'cyber-hud-cursor-wrapper';
    
    // SVG Reticle Construction
    wrapper.innerHTML = `
      <div class="hud-cursor-inner">
        <svg width="100" height="100" viewBox="0 0 100 100" style="overflow: visible;">
          <!-- Concentric pulse animation ring (Default state) -->
          <circle cx="50" cy="50" r="12" class="hud-pulse" />
          
          <!-- Hover-state concentric pulses -->
          <circle cx="50" cy="50" r="10" class="hud-hover-pulse-1" />
          <circle cx="50" cy="50" r="12" class="hud-hover-pulse-2" />

          <!-- Continuous Rotating Radar Sweep -->
          <g class="hud-radar">
            <path d="M 50,15 A 35,35 0 0,1 85,50" fill="none" stroke="#00FFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.35" />
          </g>
          
          <!-- Outer Ring (Cyan) -->
          <circle cx="50" cy="50" r="30" class="hud-outer-ring" />
          
          <!-- Inner Ring (Magenta) -->
          <circle cx="50" cy="50" r="15" class="hud-inner-ring" />
          
          <!-- Ticks at 12, 3, 6, 9 o'clock -->
          <g class="hud-ticks">
            <!-- 12 o'clock (Cyan) -->
            <line x1="50" y1="12" x2="50" y2="20" stroke="#00FFFF" stroke-width="1.5" stroke-linecap="round" />
            <!-- 6 o'clock (Cyan) -->
            <line x1="50" y1="88" x2="50" y2="80" stroke="#00FFFF" stroke-width="1.5" stroke-linecap="round" />
            <!-- 9 o'clock (Magenta) -->
            <line x1="12" y1="50" x2="20" y2="50" stroke="#FF00FF" stroke-width="1.5" stroke-linecap="round" />
            <!-- 3 o'clock (Magenta) -->
            <line x1="88" y1="50" x2="80" y2="50" stroke="#FF00FF" stroke-width="1.5" stroke-linecap="round" />
          </g>

          <!-- Center White Target Dot -->
          <circle cx="50" cy="50" r="2.5" class="hud-center-dot" />
        </svg>
      </div>
    `;

    document.body.appendChild(wrapper);
    document.documentElement.classList.add('hud-cursor-enabled');

    // State parameters
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ease = 0.12;
    let hasMoved = false;

    // Movement event listener
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      
      if (!hasMoved) {
        hasMoved = true;
        wrapper.style.opacity = '1';
        // Instantly align first coordinates to avoid transition slide from (0,0)
        cursor.x = mouse.x;
        cursor.y = mouse.y;
      }
    }, { passive: true });

    // Boundary events to avoid cursor locking on edges
    document.addEventListener('mouseleave', () => {
      wrapper.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      if (hasMoved) wrapper.style.opacity = '1';
    });

    // 60FPS LERP Loop
    const render = () => {
      if (hasMoved) {
        cursor.x += (mouse.x - cursor.x) * ease;
        cursor.y += (mouse.y - cursor.y) * ease;
        wrapper.style.transform = `translate3d(${cursor.x}px, ${cursor.y}px, 0)`;
      }
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    // Interactive Hover Listeners
    const interactiveSelectors = 'a, button, [role="button"], input, select, textarea, [contenteditable="true"], .hud-interactive, [cursor="pointer"]';

    document.addEventListener('mouseover', (e) => {
      if (!e.target) return;
      
      const target = e.target;
      const isInteractive = target.closest && target.closest(interactiveSelectors);
      const isPointerStyle = window.getComputedStyle(target).cursor === 'pointer';
      
      if (isInteractive || isPointerStyle) {
        wrapper.classList.add('hud-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) {
        wrapper.classList.remove('hud-hover');
        return;
      }
      
      const related = e.relatedTarget;
      const isRelatedInteractive = related.closest && related.closest(interactiveSelectors);
      const isRelatedPointerStyle = window.getComputedStyle(related).cursor === 'pointer';
      
      if (!isRelatedInteractive && !isRelatedPointerStyle) {
        wrapper.classList.remove('hud-hover');
      }
    });

    // Click Explosion Effect
    const createClickExplosion = (x, y) => {
      const particleContainer = document.createElement('div');
      particleContainer.style.position = 'fixed';
      particleContainer.style.left = `${x}px`;
      particleContainer.style.top = `${y}px`;
      particleContainer.style.width = '0px';
      particleContainer.style.height = '0px';
      particleContainer.style.pointerEvents = 'none';
      particleContainer.style.zIndex = '9999998';
      particleContainer.style.mixBlendMode = 'screen';

      const particleCount = 8;
      const travelDistance = 22; // px

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const tx = Math.cos(angle) * travelDistance;
        const ty = Math.sin(angle) * travelDistance;
        const isCyan = i % 2 === 0;

        const particle = document.createElement('div');
        particle.className = 'hud-click-particle';
        particle.style.background = isCyan ? '#00FFFF' : '#FF00FF';
        particle.style.boxShadow = isCyan ? '0 0 3px #00FFFF' : '0 0 3px #FF00FF';
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);

        particleContainer.appendChild(particle);
      }

      document.body.appendChild(particleContainer);
      setTimeout(() => {
        particleContainer.remove();
      }, 500);
    };

    // Click triggers
    window.addEventListener('mousedown', (e) => {
      wrapper.classList.add('hud-clicking');
      createClickExplosion(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', () => {
      wrapper.classList.remove('hud-clicking');
    });
  };

  // Run initializations safely
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
