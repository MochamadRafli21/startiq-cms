import { ProjectData } from "grapesjs";
import { findComponentById } from "../tools";
import ReactDOM from "react-dom/client";
import { mountInfiniteSlides } from "../plugins/mount-components/mount-infinite-slider";

export const renderSlider = (content: ProjectData) => {
  const sliders = document?.querySelectorAll(
    '[data-gjs-type="infinite-slides"]',
  );
  // if (sliders) {
  //   const animationCSS = `
  //         @keyframes scroll-left {
  //           0% { transform: translateX(0%); }
  //           100% { transform: translateX(-50%); }
  //         }
  //         @keyframes scroll-right {
  //           0% { transform: translateX(0%); }
  //           100% { transform: translateX(50%); }
  //         }
  //         .animate-scroll-left {
  //           animation-name: scroll-left;
  //         }
  //         .animate-scroll-right {
  //           animation-name: scroll-right;
  //         }
  //       `;
  //   const head = document.getElementsByTagName("head")[0];
  //   if (head) {
  //     const styleEl = document.createElement("style");
  //     styleEl.innerHTML = animationCSS;
  //     head.appendChild(styleEl);
  //   }
  // }
  // find model inside content
  sliders.forEach((slider) => {
    const id = slider.id;
    const component = findComponentById(content?.pages[0].frames, id);
    const images = (component?.images || component?.imageList) as string[];
    const direction = component?.direction === "right";
    const speed = component?.speed as number;

    const root = ReactDOM.createRoot(slider);
    mountInfiniteSlides(root, {
      images,
      direction: direction ? "right" : "left",
      speed,
    });
  });
};
