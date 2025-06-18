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
        },
        autoplay: false,
        interval: 2000,
        traits: [
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
          const prev = root.querySelector(".carousel-prev");
          const next = root.querySelector(".carousel-next");
          const indicatorsWrapper = root.querySelector(".carousel-indicators");

          let index = 0;
          let autoplayTimer: NodeJS.Timeout | null = null;

          const getSlides = () => root.querySelectorAll(".carousel-slide");

          const getAutoplay = () =>
            root.getAttribute("data-autoplay") === "true";
          const getInterval = () =>
            parseInt(root.getAttribute("data-interval") || "3000");

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
                slide.style.position = "block";
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
        },
      },
      init() {
        this.on("change:animationType", () => {
          if (this.view?.el && typeof this.attributes.script === "function") {
            this.attributes.script.call(this.view.el);
          }
        });

        this.on("change:autoplay change:interval change:animationType", () => {
          const autoplay = this.get("autoplay");
          const interval = this.get("interval");
          const animation = this.get("animationType");

          this.addAttributes({
            "data-autoplay": `${autoplay}`,
            "data-interval": `${interval}`,
            "data-animation": `${animation}`,
          });

          if (
            this.attributes.script &&
            typeof this.attributes.script === "function" &&
            this.view?.el
          ) {
            this.attributes.script.call(this.view?.el);
          }
        });
      },
    },
  });

  editor.BlockManager.add("carousel", {
    label: "Carousel JS",
    category: "Custom",
    content: `
      <div data-gjs-type="carousel" class="gjs-carousel relative overflow-hidden w-full" data-autoplay="false" data-interval="2000" transition-transform duration-500 ease-in-out>
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
      </div>
    `,
  });
}
