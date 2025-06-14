import { ProjectData } from "grapesjs";
import { mountCarousel } from "../plugins/mount-components/mount-carousel";
import { findComponentById, componentToHTML } from "../tools";
import type {
  DisplayType,
  AnimationType,
} from "@/components/organisms/grapesjs/carousel";
import ReactDOM from "react-dom/client";
import React from "react";
export const renderCarousel = (content: ProjectData) => {
  const carousels = document?.querySelectorAll(
    '[data-gjs-type="carousel-react"]',
  );
  // find model inside content
  carousels.forEach((carousel) => {
    const id = carousel.id;
    const component = findComponentById(content?.pages[0].frames, id);

    const autoplay = component?.autoplay === "true";
    const showIndicators = component?.showIndicators === "true";
    const showNavigation = (component?.showNavigation ||
      "always") as DisplayType;
    const zoomOnHover = component?.zoomOnHover === "true";
    const pauseOnHover = component?.pauseOnHover === "true";
    const animationType = component?.animationType as AnimationType;
    const interval = parseInt(component?.interval as string, 10) || 3000;

    // Map each GrapesJS component (slide) to a React element
    const childrenReactElements =
      component?.components?.map((comp, index) => {
        const componentHtml = componentToHTML(comp, content); // Get the HTML of the GrapesJS component
        // Wrap the HTML in a React element using dangerouslySetInnerHTML
        return React.createElement("div", {
          key: (comp.cid as string) || `gjs-carousel-slide-${index}`, // Unique key for React list rendering
          // You can pass GrapesJS classes if needed
          dangerouslySetInnerHTML: { __html: componentHtml },
        });
      }) || [];

    const root = ReactDOM.createRoot(carousel);
    mountCarousel(root, {
      autoplay,
      interval,
      animation: animationType,
      showIndicators,
      navButtons: showNavigation,
      pauseOnHover,
      zoomOnHover,
      children: childrenReactElements,
    });
  });
};
