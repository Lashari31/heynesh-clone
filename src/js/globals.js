// The ported animation engine is the original's IIFE, which reads its
// dependencies off the global scope (on heynesh.com they arrive as <script>
// tags). This module publishes them, and must be imported before engine.js —
// static import order is depth-first, so main.js's ordering is what guarantees it.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from 'lenis';
import Swiper from 'swiper';
import { Navigation, Pagination, EffectCreative, Autoplay, FreeMode } from 'swiper/modules';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip, DrawSVGPlugin, MotionPathPlugin, ScrollToPlugin);
Swiper.use([Navigation, Pagination, EffectCreative, Autoplay, FreeMode]);

Object.assign(window, {
  gsap,
  ScrollTrigger,
  SplitText,
  Flip,
  DrawSVGPlugin,
  MotionPathPlugin,
  ScrollToPlugin,
  Lenis,
  Swiper,
});

// Matches the original: a mobile browser collapsing its address bar must not
// re-measure pins/morphs, or the hero jumps mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
