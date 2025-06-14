import { registerCarousel } from "./register-carousel";
import { registerSlider } from "./register-slider";
import { registerLinkList } from "./register-link-list";
import { registerPageList } from "./register-page-list";
import { registerTabs } from "./register-tabs";
import { registerNavbar } from "./register-navbar";
import { registerFooter } from "./register-footer";
import { registerPartnerLogos } from "./register-partner-logos";
import { registerCountUp } from "./register-count-up";

export const customPlugins = [
  registerCarousel,
  registerSlider,
  registerCountUp,
  registerLinkList,
  registerPageList,
  registerTabs,
  registerNavbar,
  registerFooter,
  registerPartnerLogos,
];
