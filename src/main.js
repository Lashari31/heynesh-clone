import 'swiper/css';
import 'swiper/css/effect-creative';
import './styles/site.css';
import './styles/custom.css';

// Order matters: globals.js publishes gsap/Lenis/Swiper on window, which the
// ported engine expects to already exist when it evaluates.
import './js/globals.js';
import './js/engine.js';

// Replacements for the behaviour Webflow's own runtime provided on the original.
import './js/dropdown.js';
import './js/anchors.js';
import './js/work-video.js';
