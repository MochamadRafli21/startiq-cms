"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";

export type AnimationType = "none" | "slide" | "pan" | "flip" | "coverflow";
export type DisplayType = "always" | "hover" | "none";
type Props = {
  children: React.ReactNode;
  autoplay?: boolean;
  showIndicators?: boolean;
  navButtons?: DisplayType;
  animation?: AnimationType;
  interval?: number;
  pauseOnHover?: boolean;
  zoomOnHover?: boolean;
};

export const Carousel: React.FC<Props> = ({
  children,
  autoplay = false,
  showIndicators = false,
  navButtons = "none",
  animation = "none",
  interval = 3000,
  pauseOnHover = false,
  zoomOnHover = false,
}) => {
  const slotRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<HTMLElement[]>([]);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!slotRef.current) return;

    const children = Array.from(slotRef.current.children) as HTMLElement[];
    setSlides(children);

    children.forEach((slide, i) => {
      slide.style.position = "absolute";
      slide.style.top = "0";
      slide.style.left = "0";
      slide.style.bottom = "0";
      slide.style.right = "0";
      slide.style.width = "100%";
      slide.style.height = "100%";
      slide.style.pointerEvents = i === index ? "auto" : "none";
      slide.style.objectFit = "contain";
      slide.style.display = "flex";
      slide.style.justifyContent = "center";
      slide.style.alignItems = "center";

      if (animation === "slide") {
        slide.style.transition = "transform 0.5s ease-in-out";
        slide.style.transform = `translateX(${100 * (i - index)}%)`;
        slide.style.opacity = "1"; // ensure visible
      } else if (animation === "flip") {
        slide.style.transition = "transform 0.6s ease";
        slide.style.transform = `rotateY(${(i - index) * 180}deg)`;
        slide.style.zIndex = i === index ? "1" : "0";
      } else if (animation === "coverflow") {
        slides.forEach((slide, i) => {
          slide.style.transition = "transform 0.5s ease, opacity 0.5s ease";
          slide.style.transformOrigin = "center center";
          slide.style.position = "absolute";
          slide.style.top = "0";
          slide.style.left = "0";
          slide.style.right = "0";
          slide.style.bottom = "0";
          slide.style.opacity = "0";

          const offset = i - index;

          if (Math.abs(offset) > 2) {
            slide.style.transform = "scale(0)";
            return;
          }

          if (offset === 0) {
            slide.style.zIndex = "2";
            slide.style.transform = `translateX(0) scale(1) rotateY(0deg)`;
            slide.style.opacity = "1";
          } else {
            slide.style.zIndex = "1";
            const angle = offset * 40;
            const translateX = offset * 40;
            const scale = 0.8;
            slide.style.transform = `
        translateX(${translateX}%)
        rotateY(${angle}deg)
        scale(${scale})
      `;
            slide.style.opacity = "0.5";
          }
        });
      } else if (animation === "pan") {
        slide.style.transition = "opacity 0.5s ease";
        slide.style.opacity = i === index ? "1" : "0";
        slide.style.transform = "none";
      } else {
        slide.style.transition = "none";
        slide.style.display = i === index ? "block" : "none";
        slide.style.opacity = i === index ? "1" : "0";
        slide.style.transform = "none";
      }

      if (zoomOnHover) {
        slide.classList.add("carousel-zoom-hover");
      } else {
        slide.classList.remove("carousel-zoom-hover");
      }
    });

    let timer: NodeJS.Timeout | undefined;

    if (!autoplay || children.length < 2 || (pauseOnHover && hovering)) return;
    else if (autoplay && children.length > 1) {
      timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % children.length);
      }, interval);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [
    index,
    autoplay,
    interval,
    animation,
    children,
    hovering,
    pauseOnHover,
    slides,
    zoomOnHover,
  ]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setIndex((i) => (i + 1) % slides.length),
    onSwipedRight: () =>
      setIndex((i) => (i - 1 + slides.length) % slides.length),
    trackMouse: true,
  });

  return (
    <div
      {...swipeHandlers}
      id="unique"
      data-gjs-slot
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="group max-w-screen relative aspect-video overflow-hidden w-full  mx-auto p-3"
      style={{ minHeight: "100%" }}
    >
      <div
        ref={slotRef}
        data-carousel-slot
        className="relative w-full h-full flex items-center justify-center p-3"
      >
        {children}
      </div>
      {showIndicators && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`w-3 h-3 rounded-full ${i === index ? "bg-black" : "bg-gray-400"} transition`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}

      {navButtons !== "none" && (
        <>
          <button
            className={`absolute top-1/2 left-2 -translate-y-1/2 bg-white rounded-full py-1 px-2 ${
              navButtons === "hover"
                ? "opacity-0 group-hover:opacity-100 transition"
                : ""
            }`}
            onClick={() =>
              setIndex((i) => (i - 1 + slides.length) % slides.length)
            }
          >
            ◀
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % slides.length)}
            className={`absolute top-1/2 right-2 -translate-y-1/2 bg-white rounded-full py-1 px-2 ${
              navButtons === "hover"
                ? "opacity-0 group-hover:opacity-100 transition"
                : ""
            }`}
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
};
