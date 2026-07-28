// Port of the original's work-card video loader.
// Each card has a looping background video plus a transparent foreground
// device mockup (HEVC .mov for Safari, VP9 .webm elsewhere) that plays on hover.
(function () {
  const FG_BASE = '/assets/video/';

  const ua = navigator.userAgent;
  const isSafari =
    /^((?!chrome|chromium|crios|fxios|edg|opr|android).)*safari/i.test(ua) || /iP(ad|hone|od)/.test(ua);
  const canHover = window.matchMedia('(hover: hover)').matches;

  // Background video: full (already localised) url sits in data-src
  function loadBg(v) {
    if (v.src || !v.dataset.src) return;
    v.src = v.dataset.src;
    v.load();
  }

  // Foreground transparent video: filename + FG_BASE. Safari -> .mov, others -> .webm
  function loadFg(v) {
    if (v.src) return;
    const file = isSafari && v.dataset.mov ? v.dataset.mov : v.dataset.webm;
    if (!file) return;
    v.src = FG_BASE + encodeURIComponent(file);
    v.load();
  }

  const cards = document.querySelectorAll('.work-card');

  // Desktop: foreground plays on hover, resets on leave.
  if (canHover) {
    cards.forEach(function (card) {
      const fg = card.querySelector('.work-video');
      if (!fg) return;
      card.addEventListener('mouseenter', function () {
        loadFg(fg);
        fg.play().catch(function () {});
      });
      card.addEventListener('mouseleave', function () {
        fg.pause();
        fg.currentTime = 0;
      });
    });
  }

  // Load + play only when a card is on screen.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const card = entry.target;
          const bg = card.querySelector('.work-bg');
          const fg = card.querySelector('.work-video');

          if (entry.isIntersecting) {
            if (bg) {
              loadBg(bg);
              bg.play().catch(function () {});
            }
            if (fg) {
              loadFg(fg);
              if (!canHover) fg.play().catch(function () {});
            }
          } else {
            if (bg) bg.pause();
            if (fg) fg.pause();
          }
        });
      },
      { rootMargin: '300px' }
    );

    cards.forEach(function (card) {
      io.observe(card);
    });
  }
})();
