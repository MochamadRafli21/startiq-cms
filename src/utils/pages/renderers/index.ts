import { ProjectData } from "grapesjs";
import { renderNavbar } from "./navbar";
import { renderTabs } from "./tabs";
import { renderCarousel } from "./carousel";
import { renderCarouselJs } from "./carousel-js";
import { renderCountUp } from "./count-up";
import { renderLinkList } from "./link-list";
import { renderPageList } from "./page-list";
import { renderSlider } from "./slider";
import { renderFaq } from "./faq";
import { renderContentList } from "./content-list";

export const renderAllComponents = (content: ProjectData) => {
  Promise.all([
    renderNavbar(),
    renderFaq(content),
    renderTabs(content),
    renderCarousel(content),
    renderCarouselJs(content),
    renderCountUp(content),
    renderLinkList(content),
    renderContentList(content),
    renderPageList(content),
    renderSlider(content),
  ]);
};
