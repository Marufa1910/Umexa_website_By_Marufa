import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Only ever imported dynamically, through useDesktopAnimation, so phones never download GSAP. */
export { gsap, ScrollTrigger };
