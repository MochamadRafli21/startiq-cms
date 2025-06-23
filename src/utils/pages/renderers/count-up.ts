import { ProjectData } from "grapesjs";
import { findComponentById } from "../tools";

export const renderCountUp = (content: ProjectData) => {
  const counts = document?.querySelectorAll('[data-gjs-type="count-up"]');
  // find model inside content
  counts.forEach((count) => {
    const id = count.id;
    const component = findComponentById(content?.pages[0].frames, id);
    const duration = (component?.duration || 2000) as number;
    const endValue = (component?.endValue || 2000) as number;

    const animateCount = (value: number) => {
      const startTime = performance.now();

      const step = (timestamp: number) => {
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const current = Math.floor(progress * value);
        count.innerHTML = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    };

    // Lazy animation on enter view
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animateCount(endValue);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(count);
  });
};
