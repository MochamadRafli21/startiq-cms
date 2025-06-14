import { ProjectData } from "grapesjs";
import { renderNavbar } from "./navbar";
import { renderTabs } from "./tabs";
import { renderCarousel } from "./carousel";
import { renderCountUp } from "./count-up";
import { renderLinkList } from "./link-list";
import { renderPageList } from "./page-list";
import { renderSlider } from "./slider";

export const renderAllComponents = (content: ProjectData) => {
  renderNavbar();
  renderTabs(content);
  renderCarousel(content);
  renderCountUp(content);
  renderLinkList(content);
  renderPageList(content);
  renderSlider(content);
};
