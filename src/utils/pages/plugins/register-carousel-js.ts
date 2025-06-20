import { Editor } from "grapesjs";

export function registerCarouselJs(editor: Editor) {
  editor.DomComponents.addType("carousel", {
    model: {
      defaults: {
        name: "Carousel",
        attributes: {
          class: "gjs-carousel",
          "data-gjs-type": "carousel",
          "data-autoplay": "false",
          "data-interval": "2000",
          "data-show-indicators": "true",
          "data-show-navigation": "always",
          "data-pause-on-hover": "false",
          "data-zoom-on-hover": "false",
        },
        autoplay: false,
        interval: 2000,
        showIndicators: true,
        showNavigation: "always",
        pauseOnHover: false,
        zoomOnHover: false,
        traits: [
          {
            type: "checkbox",
            label: "Show Indicator",
            name: "showIndicators",
            valueTrue: "true",
            valueFalse: "false",
            changeProp: true,
          },
          {
            type: "checkbox",
            label: "Zoom On Hover",
            name: "zoomOnHover",
            valueTrue: "true",
            valueFalse: "false",
            changeProp: true,
          },
          {
            type: "checkbox",
            label: "Pause On Hover",
            name: "pauseOnHover",
            valueTrue: "true",
            valueFalse: "false",
            changeProp: true,
          },
          {
            type: "select",
            label: "Show Navigation",
            name: "showNavigation",
            options: [
              { id: "none", label: "None" },
              { id: "hover", label: "Hover" },
              { id: "always", label: "Always" },
            ],
            changeProp: true,
          },
          {
            type: "select",
            label: "Animation Type",
            name: "animationType",
            options: [
              { id: "none", value: "none", name: "None" },
              { id: "slide", value: "slide", name: "Slide" },
              { id: "pan", value: "pan", name: "Pan" },
              { id: "flip", value: "flip", name: "Flip" },
              { id: "coverflow", value: "coverflow", name: "Coverflow" },
            ],
            changeProp: true,
          },
          {
            type: "checkbox",
            name: "autoplay",
            label: "Autoplay",
            changeProp: true,
          },
          {
            type: "number",
            name: "interval",
            label: "Interval (ms)",
            changeProp: true,
          },
        ],
        script: function () {
          const root = this as unknown as HTMLDivElement;
          const track = root.querySelector(".carousel-track") as HTMLDivElement;
          const prev = root.querySelector(".carousel-prev") as HTMLDivElement;
          const next = root.querySelector(".carousel-next") as HTMLDivElement;
          const indicatorsWrapper = root.querySelector(
            ".carousel-indicators",
          ) as HTMLDivElement;

          let index = 0;
          let autoplayTimer: NodeJS.Timeout | null = null;

          const getSlides = () => root.querySelectorAll(".carousel-slide");

          const getAutoplay = () =>
            root.getAttribute("data-autoplay") === "true";
          const getInterval = () =>
            parseInt(root.getAttribute("data-interval") || "3000");

          const getPauseOnHover = () => {
            return root.getAttribute("data-pause-on-hover") === "true";
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
            const type = root.getAttribute("data-animation");

            if (type === "slide" || type === "pan" || type === "none") {
              track.style.transform = `translateX(-${index * 100}%)`;
            } else if (slides) {
              applyAnimation(
                type || "none",
                slides as NodeListOf<HTMLDivElement>,
              );
            }

            // update indicators
            const indicators =
              indicatorsWrapper?.querySelectorAll("span") || [];
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
                if (getPauseOnHover() && root.matches(":hover")) return;
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
          attributeObserver.observe(root, { attributes: true });

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

          const showIndicators =
            root.getAttribute("data-show-indicators") === "true";
          const showNavigation = root.getAttribute("data-show-navigation");

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
            root as unknown as {
              _carouselListeners?: {
                mouseEnter: () => void;
                mouseLeave: () => void;
              };
            }
          )._carouselListeners;

          if (old) {
            root.removeEventListener("mouseenter", old.mouseEnter);
            root.removeEventListener("mouseleave", old.mouseLeave);
          }

          const zoomOnHover =
            root.getAttribute("data-zoom-on-hover") === "true";

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
          if (zoomOnHover) {
            root.addEventListener("mouseenter", mouseEnter);
            root.addEventListener("mouseleave", mouseLeave);
            (
              root as unknown as {
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

          root.addEventListener("touchstart", (e: TouchEvent) => {
            startX = e.touches[0].clientX;
          });

          root.addEventListener("touchmove", (e: TouchEvent) => {
            endX = e.touches[0].clientX;
          });

          root.addEventListener("touchend", () => {
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

          root.addEventListener("mousedown", (e: MouseEvent) => {
            isDragging = true;
            startX = e.clientX;
          });

          root.addEventListener("mousemove", (e: MouseEvent) => {
            if (!isDragging) return;
            endX = e.clientX;
          });

          root.addEventListener("mouseup", () => {
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

          // Adding Fullscreen Modal <-- problem with all the section getting display at the same time
          // const modal = root.querySelector(".carousel-modal") as HTMLElement;
          // const modalTrack = root.querySelector(
          //   ".carousel-modal-track",
          // ) as HTMLElement;
          // const modalClose = root.querySelector(
          //   ".carousel-modal-close",
          // ) as HTMLElement;

          // const openModal = (startIndex: number) => {
          //   if (!modal || !modalTrack) return;
          //   modalTrack.innerHTML = "";

          //   const slides = getSlides();
          //   slides.forEach((slide) => {
          //     const clone = slide.cloneNode(true) as HTMLElement;
          //     clone.classList.add("min-w-full", "p-4", "text-white");
          //     modalTrack.appendChild(clone);
          //   });

          //   // Set initial position
          //   modalTrack.style.transform = `translateX(-${startIndex * 100}%)`;
          //   modal.classList.remove("hidden");
          //   modal.classList.add("flex");

          //   // Close handler
          //   const closeModal = () => {
          //     modal.classList.add("hidden");
          //     modal.classList.remove("flex");
          //     modalTrack.innerHTML = "";
          //   };

          //   modalClose?.addEventListener("click", closeModal);
          //   document.addEventListener("keydown", (e) => {
          //     if (e.key === "Escape") closeModal();
          //   });
          // };
          // const attachSlideClick = () => {
          //   const slides = getSlides();
          //   slides.forEach((slide, i) => {
          //     slide.addEventListener("click", () => {
          //       openModal(i);
          //     });
          //   });
          // };

          // attachSlideClick();
        },
      },
      init() {
        this.on("change:animationType", () => {
          if (this.view?.el && typeof this.attributes.script === "function") {
            this.attributes.script.call(this.view.el);
          }
        });

        this.on(
          "change:autoplay change:interval change:animationType change:showNavigation change:showIndicators change:zoomOnHover change:pauseOnHover",
          () => {
            const autoplay = this.get("autoplay");
            const interval = this.get("interval");
            const animation = this.get("animationType");
            const showNavigation = this.get("showNavigation");
            const showIndicators = this.get("showIndicators");
            const pauseOnHover = this.get("pauseOnHover");
            const zoomOnHover = this.get("zoomOnHover");

            this.addAttributes({
              "data-autoplay": `${autoplay}`,
              "data-interval": `${interval}`,
              "data-animation": `${animation}`,
              "data-show-navigation": `${showNavigation}`,
              "data-show-indicators": `${showIndicators}`,
              "data-pause-on-hover": `${pauseOnHover}`,
              "data-zoom-on-hover": `${zoomOnHover}`,
            });

            if (
              this.attributes.script &&
              typeof this.attributes.script === "function" &&
              this.view?.el
            ) {
              this.attributes.script.call(this.view?.el);
            }
          },
        );
      },
    },
  });

  editor.BlockManager.add("carousel", {
    label: "Carousel Vanilla",
    category: "Custom",
    content: `
      <div data-gjs-type="carousel" class="gjs-carousel relative overflow-hidden w-full" data-autoplay="false" data-show-navigation="always" data-interval="2000" data-show-indicators="true" transition-transform duration-500 ease-in-out>
        <div class="carousel-track flex transition-transform duration-500 ease-in-out">
          <div class="carousel-slide min-w-full p-4 bg-gray-100 text-center"><span>Slide 1<span/></div>
          <div class="carousel-slide min-w-full p-4 bg-gray-200 text-center"><span>Slide 2<span/></div>
          <div class="carousel-slide min-w-full p-4 bg-gray-300 text-center"><span>Slide 3<span/></div>
        </div>
        <button class="carousel-prev absolute top-1/2 left-2 -translate-y-1/2 bg-white p-1 rounded shadow">❮</button>
        <button class="carousel-next absolute top-1/2 right-2 -translate-y-1/2 bg-white p-1 rounded shadow">❯</button>
        <div class="carousel-indicators absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          <span class="w-3 h-3 rounded-full bg-white border cursor-pointer active"></span>
          <span class="w-3 h-3 rounded-full bg-white border cursor-pointer"></span>
          <span class="w-3 h-3 rounded-full bg-white border cursor-pointer"></span>
        </div>

        <!-- Hidden modal for fullscreen carousel -->
        <div class="carousel-modal fixed inset-0 bg-black bg-opacity-90 items-center justify-center z-50 hidden">
          <div class="carousel-modal-content relative max-w-4xl w-full">
            <button class="carousel-modal-close absolute top-2 right-2 text-white text-2xl">×</button>
            <div class="carousel-modal-track flex transition-transform duration-500 ease-in-out">
              <!-- Slides will be cloned and inserted here -->
            </div>
          </div>
        </div>
      </div>
    `,
  });
}
