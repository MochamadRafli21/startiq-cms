import { ProjectData } from "grapesjs";
import { findComponentById } from "../tools";
import type {
  DisplayType,
  AnimationType,
} from "@/components/organisms/grapesjs/carousel";

export const renderCarouselJs = (content: ProjectData) => {
  const carousels = document?.querySelectorAll('[data-gjs-type="carousel"]');
  // find model inside content
  (carousels as NodeListOf<HTMLDivElement>).forEach((carousel) => {
    const id = carousel.id;
    const component = findComponentById(content?.pages[0].frames, id);

    const showIndicators = component?.showIndicators === "true";
    const showNavigation = (component?.showNavigation ||
      "always") as DisplayType;
    const zoomOnHover = component?.zoomOnHover === "true";
    const pauseOnHover = component?.pauseOnHover === "true";

    const track = carousel.querySelector(".carousel-track") as HTMLDivElement;
    const prev = carousel.querySelector(".carousel-prev") as HTMLDivElement;
    const next = carousel.querySelector(".carousel-next") as HTMLDivElement;
    const indicatorsWrapper = carousel.querySelector(
      ".carousel-indicators",
    ) as HTMLDivElement;

    let index = 0;
    let autoplayTimer: NodeJS.Timeout | null = null;

    const getSlides = () => carousel.querySelectorAll(".carousel-slide");

    const getAutoplay = () => component?.autoplay === "true";
    const getInterval = () =>
      parseInt(component?.interval as string, 10) || 3000;

    const getPauseOnHover = () => {
      return component?.pauseOnHover === "true";
    };

    let startX = 0;
    let endX = 0;

    let isDragging = false;

    let maxHeight = 0;

    const applyAnimation = (
      type: string,
      slides: NodeListOf<HTMLDivElement>,
    ) => {
      slides.forEach((slide, i) => {
        slide.style.transition = "none";
        slide.style.transform = "";

        if (type === "slide" || type === "pan" || type === "none") {
          track.style.transform = `translateX(-${index * 100}%)`;

          slide.style.transform = "translateX(0) scale(1) rotateY(0deg)";
          slide.style.transition = "";
          slide.style.position = "relative";
          track.style.height = "auto";
        } else if (type === "flip") {
          slide.style.transition = "transform 0.5s ease";
          slide.style.transform = `rotateY(${(i - index) * 180}deg)`;
          const rect = (slide as HTMLElement).getBoundingClientRect();
          maxHeight = Math.max(maxHeight, rect.height);
          track.style.height = `${maxHeight}px`;
          slide.style.position = "absolute";
        } else if (type === "coverflow") {
          const offset = i - index;
          const rect = (slide as HTMLElement).getBoundingClientRect();
          maxHeight = Math.max(maxHeight, rect.height);
          track.style.height = `${maxHeight}px`;
          slide.style.position = "absolute";
          slide.style.transform = `translateX(${offset * 60}%) scale(${
            1 - Math.abs(offset) * 0.2
          }) rotateY(${offset * -15}deg)`;
          slide.style.transition = "transform 0.5s ease";
        }
      });
    };

    const goToSlide = (i: number) => {
      const slides = getSlides();
      const total = slides.length;
      if (total === 0) return;

      index = (i + total) % total;
      const type = component?.animationType as AnimationType;

      if (type === "slide" || type === "pan" || type === "none") {
        track.style.transform = `translateX(-${index * 100}%)`;
      } else if (slides) {
        applyAnimation(type || "none", slides as NodeListOf<HTMLDivElement>);
      }

      // update indicators
      const indicators = indicatorsWrapper?.querySelectorAll("span") || [];
      indicators.forEach((dot, idx) =>
        dot.classList.toggle("active", idx === index),
      );
    };

    const renderIndicators = () => {
      if (!indicatorsWrapper) return;
      indicatorsWrapper.innerHTML = "";

      const slides = getSlides();
      slides.forEach((_, i) => {
        const dot = document.createElement("span");
        dot.className =
          "w-3 h-3 rounded-full bg-white border border-gray-500 cursor-pointer";
        if (i === index) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(i));
        indicatorsWrapper.appendChild(dot);
      });
    };

    const startAutoplay = () => {
      stopAutoplay(); // prevent duplicates
      if (getAutoplay()) {
        autoplayTimer = setInterval(() => {
          if (getPauseOnHover() && carousel.matches(":hover")) return;
          goToSlide(index + 1);
        }, getInterval());
      }
    };

    const stopAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    // Observe attributes for autoplay/interval changes
    const attributeObserver = new MutationObserver(() => {
      stopAutoplay(); // always clear first
      if (getAutoplay()) {
        startAutoplay(); // only restart if autoplay is still on
      }
    });
    attributeObserver.observe(carousel, { attributes: true });

    // Observe child changes to update slides
    const childObserver = new MutationObserver(() => {
      renderIndicators();
      goToSlide(index);
    });
    if (track) {
      childObserver.observe(track, { childList: true });
    }

    prev?.addEventListener("click", () => goToSlide(index - 1));
    next?.addEventListener("click", () => goToSlide(index + 1));

    renderIndicators();
    goToSlide(0);
    if (getAutoplay()) startAutoplay();

    if (showIndicators) {
      indicatorsWrapper.style.opacity = "100%";
    } else {
      indicatorsWrapper.style.opacity = "0";
    }

    if (showNavigation === "always") {
      next.style.opacity = "100%";
      prev.style.opacity = "100%";
    } else {
      next.style.opacity = "0";
      prev.style.opacity = "0";
    }

    // clean up listener before adding new one
    const old = (
      carousel as unknown as {
        _carouselListeners?: {
          mouseEnter: () => void;
          mouseLeave: () => void;
        };
      }
    )._carouselListeners;

    if (old) {
      carousel.removeEventListener("mouseenter", old.mouseEnter);
      carousel.removeEventListener("mouseleave", old.mouseLeave);
    }

    const mouseEnter = () => {
      if (zoomOnHover) {
        const slides = getSlides();
        slides.forEach((slide, i) => {
          if (i === index) {
            (slide as HTMLElement).classList.add("carousel-zoom");
          }
        });
      }

      if (showNavigation === "hover") {
        next.style.opacity = "100%";
        prev.style.opacity = "100%";
      }
    };

    const mouseLeave = () => {
      if (zoomOnHover) {
        const slides = getSlides();
        slides.forEach((slide) =>
          (slide as HTMLElement).classList.remove("carousel-zoom"),
        );
      }

      if (showNavigation === "hover") {
        next.style.opacity = "0";
        prev.style.opacity = "0";
      }
    };
    if (pauseOnHover || zoomOnHover) {
      carousel.addEventListener("mouseenter", mouseEnter);
      carousel.addEventListener("mouseleave", mouseLeave);
      (
        carousel as unknown as {
          _carouselListeners?: {
            mouseEnter: () => void;
            mouseLeave: () => void;
          };
          _timer?: NodeJS.Timeout | null;
        }
      )._carouselListeners = {
        mouseEnter,
        mouseLeave,
      };
    }

    carousel.addEventListener("touchstart", (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchmove", (e: TouchEvent) => {
      endX = e.touches[0].clientX;
    });

    carousel.addEventListener("touchend", () => {
      const diffX = endX - startX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          goToSlide(index - 1); // Swipe right
        } else {
          goToSlide(index + 1); // Swipe left
        }
      }
      // Reset values
      startX = 0;
      endX = 0;
    });

    carousel.addEventListener("mousedown", (e: MouseEvent) => {
      isDragging = true;
      startX = e.clientX;
    });

    carousel.addEventListener("mousemove", (e: MouseEvent) => {
      if (!isDragging) return;
      endX = e.clientX;
    });

    carousel.addEventListener("mouseup", () => {
      if (!isDragging) return;
      const diffX = endX - startX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          goToSlide(index - 1); // drag right
        } else {
          goToSlide(index + 1); // drag left
        }
      }
      isDragging = false;
    });
  });
};
