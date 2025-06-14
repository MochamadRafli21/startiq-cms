"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { Editor, ProjectData } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { Carousel } from "@/components/organisms/grapesjs/carousel";
import { InfiniteSlides } from "@/components/organisms/grapesjs/infinite-slides";
import type { Page } from "@/types/page.type";
import type { Link } from "@/types/link.type";
import type {
  AnimationType,
  DisplayType,
} from "@/components/organisms/grapesjs/carousel";
import type { GjsComponent } from "@/types/grapesjs-extra.type";
import { initEditor } from "@/utils/pages/editor-init";
interface PageEditorProps {
  content?: ProjectData;
  onContentChange?: (data: ProjectData) => void;
  isPreview?: boolean;
}

export default function PageEditor({
  content,
  onContentChange,
  isPreview = false,
}: PageEditorProps) {
  const editorRef = useRef<Editor>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [renderedCss, setRenderedCss] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current) return;

    if (!editorRef.current) {
      initEditor({
        containerRef: containerRef,
        editorRef: editorRef,
        onInit: (editor) => {
          if (content) {
            editor.loadProjectData(content);
            if (isPreview) {
              const html = editor.getHtml();
              const css = editor.getCss();
              setRenderedHtml(html);
              setRenderedCss(css || "");
              editor.destroy(); // Destroy the editor instance after extracting
              editorRef.current = null;
            }
          }

          const handleUpdate = () => {
            const json = editor.getProjectData();
            if (onContentChange) {
              onContentChange(json);
            }
          };

          editor.on("update", handleUpdate);
        },
        isPreview,
      });
    }
  }, [content, isPreview]);

  const findComponentById = useCallback(
    (components: GjsComponent[], targetId: string): GjsComponent | null => {
      for (const comp of components) {
        // Some components may nest under `component.components`
        const current = comp.component || comp;

        // Check current component's attributes
        if (current.attributes?.id === targetId) {
          return current;
        }

        // Recurse into children
        const children = current.components || [];
        const result: GjsComponent | null = findComponentById(
          children,
          targetId,
        );
        if (result) return result;
      }

      return null;
    },
    [],
  );

  const renderSlider = useCallback(() => {
    const sliders = document?.querySelectorAll(
      '[data-gjs-type="infinite-slides"]',
    );
    if (sliders) {
      const animationCSS = `
          @keyframes scroll-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(0%); }
            100% { transform: translateX(50%); }
          }
          .animate-scroll-left {
            animation-name: scroll-left;
          }
          .animate-scroll-right {
            animation-name: scroll-right;
          }
        `;
      const head = document.getElementsByTagName("head")[0];
      if (head) {
        const styleEl = document.createElement("style");
        styleEl.innerHTML = animationCSS;
        head.appendChild(styleEl);
      }
    }
    // find model inside content
    sliders.forEach((slider) => {
      const id = slider.id;
      const component = findComponentById(content?.pages[0].frames, id);
      const images = (component?.images || component?.imageList) as string[];
      const direction = component?.direction === "right";
      const speed = component?.speed as number;

      const root = ReactDOM.createRoot(slider);
      root.render(
        <InfiniteSlides
          speed={speed || 100}
          images={images}
          direction={direction ? "right" : "left"}
        />,
      );
    });
  }, [findComponentById, content?.pages]);

  const componentToHTML = useCallback(
    (component: GjsComponent): string => {
      // Handle text node directly
      if (component.type === "textnode") {
        return (component.content || "") as string;
      }
      const style = content?.styles?.find((style: { selectors: string[] }) =>
        style.selectors.includes(`#${component?.attributes?.id}`),
      );
      let attrs = component.attributes
        ? Object.entries(component.attributes)
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ")
        : "";

      const classes = (component?.classes as string[])
        ?.map((cls: string | { name: string }) =>
          typeof cls === "string" ? cls : cls.name,
        )
        .filter(Boolean)
        .join(" ");

      if (component?.type === "video") {
        component.type = "iframe";
        attrs = `${attrs} src=${component?.src}`;
      }

      const inner = (component.components || [])
        .map((child) => componentToHTML(child))
        .join("");

      const styleObj = style?.style || {};
      const styleString = Object.entries(styleObj)
        .map(([k, v]) => `${k}:${v}`)
        .join(";");

      return `<${component.type || "div"} ${attrs} style="${styleString || ""}" class="${classes || ""}">${inner}</${component.type || "div"}>`;
    },
    [content?.styles],
  );

  const renderCarousel = useCallback(() => {
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
          const componentHtml = componentToHTML(comp); // Get the HTML of the GrapesJS component
          // Wrap the HTML in a React element using dangerouslySetInnerHTML
          return React.createElement("div", {
            key: (comp.cid as string) || `gjs-carousel-slide-${index}`, // Unique key for React list rendering
            // You can pass GrapesJS classes if needed
            dangerouslySetInnerHTML: { __html: componentHtml },
          });
        }) || [];

      const root = ReactDOM.createRoot(carousel);
      root.render(
        <Carousel
          autoplay={autoplay}
          interval={interval}
          animation={animationType}
          showIndicators={showIndicators}
          navButtons={showNavigation}
          pauseOnHover={pauseOnHover}
          zoomOnHover={zoomOnHover}
        >
          {childrenReactElements}
        </Carousel>,
      );
    });
  }, [componentToHTML, findComponentById, content?.pages]);

  const renderCountUp = useCallback(() => {
    const counts = document?.querySelectorAll('[data-gjs-type="count-up"]');
    // find model inside content
    counts.forEach((count) => {
      const id = count.id;
      const component = findComponentById(content?.pages[0].frames, id);
      const duration = (component?.duration ||
        component?.attributes?.duration ||
        2000) as number;
      const endValue = (component?.endValue ||
        component?.attributes?.duration ||
        2000) as number;
      const animateCount = () => {
        const startTime = performance.now();

        const step = (timestamp: number) => {
          const progress = Math.min((timestamp - startTime) / duration, 1);
          const current = Math.floor(progress * endValue);
          count.innerHTML = current.toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
      };

      // Lazy animation on enter view
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            animateCount();
            observer.disconnect();
          }
        },
        { threshold: 0.6 },
      );
      observer.observe(count);
    });
  }, [findComponentById, content?.pages]);

  const renderPageList = useCallback(() => {
    const containers = document?.querySelectorAll(
      '[data-gjs-type="page-list"]',
    );
    if (!containers) return;
    containers.forEach((container) => {
      const id = container.id;
      const component = findComponentById(content?.pages[0].frames, id);
      if (!component) return;
      const pageContainer = container.querySelector(".page-list-container");
      const paginationContainer = container.querySelector(".page-pagination");
      const searchInput = container.querySelector(
        ".page-search",
      ) as HTMLInputElement;
      let currentPage = 1;
      let totalPages = 1;
      const tags = component.tags as string;
      let searchQuery = "";
      const showSearch = component.showSearch;
      const showPagination = component.showPagination;
      if (!showSearch && searchInput) {
        searchInput.style.display = "none";
      } else if (searchInput) {
        searchInput.style.display = "block";
      }

      const renderPages = () => {
        if (!pageContainer) return;
        pageContainer.innerHTML =
          '<p class="col-span-full text-center text-gray-500">Loading pages...</p>';

        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: "5",
        });

        if (showSearch && searchQuery) {
          query.set("search", searchQuery);
        }

        if (tags) {
          query.set("tags", tags);
        }

        fetch(`/api/public?${query.toString()}`)
          .then((res) => res.json())
          .then((body: { pages: Page[]; total: number }) => {
            if (!pageContainer) return;
            pageContainer.innerHTML = "";
            if (!Array.isArray(body?.pages) || body.total === 0) {
              pageContainer.innerHTML =
                '<p class="col-span-full text-center text-gray-400 italic">No pages found.</p>';
              return;
            }

            totalPages = Math.ceil(body.total / 5);

            const pages = body.pages;
            const firstPage = pages[0];

            const firstCard = document.createElement("div");
            firstCard.className =
              "md:col-span-2 bg-white rounded-lg shadow-md p-4";
            if (firstPage.metaImage) {
              const img = document.createElement("img");
              img.src = firstPage.metaImage;
              img.alt = firstPage.metaTitle || firstPage.title || "";
              img.className = "w-full h-48 object-cover rounded-md mb-4";
              firstCard.appendChild(img);
            }
            const title = document.createElement("h3");
            title.textContent = firstPage.metaTitle || firstPage.title || "";
            title.className = "text-lg font-semibold mb-2";
            firstCard.appendChild(title);

            const excerpt = document.createElement("p");
            excerpt.textContent = firstPage.metaDescription || "";
            excerpt.className = "text-sm text-gray-600";
            firstCard.appendChild(excerpt);

            if (firstPage.slug) {
              const btn = document.createElement("a");
              btn.href = `/${firstPage.slug}`;
              btn.textContent = "Read More";
              btn.className =
                "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
              firstCard.appendChild(btn);
            }

            pageContainer.appendChild(firstCard);

            if (pages.length > 1) {
              const secondCard = document.createElement("div");
              secondCard.className = "lg:col-span-1";

              pages.slice(1).forEach((page: Page) => {
                const card = document.createElement("div");
                card.className = "bg-white rounded-lg shadow-md p-4";

                if (page.metaImage) {
                  const img = document.createElement("img");
                  img.src = page.metaImage;
                  img.alt = page.metaTitle || page.title || "";
                  img.className = "w-full h-48 object-cover rounded-md mb-4";
                  card.appendChild(img);
                }

                const title = document.createElement("h3");
                title.textContent = page.metaTitle || page.title || "";
                title.className = "text-lg font-semibold mb-2";
                card.appendChild(title);

                const excerpt = document.createElement("p");
                excerpt.textContent = page.metaDescription || "";
                excerpt.className = "text-sm text-gray-600";
                card.appendChild(excerpt);

                if (page.slug) {
                  const btn = document.createElement("a");
                  btn.href = `/${page.slug}`;
                  btn.textContent = "Read More";
                  btn.className =
                    "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
                  card.appendChild(btn);
                }

                secondCard.appendChild(card);
              });

              pageContainer.appendChild(secondCard);
            }

            // Only render pagination if enabled
            if (paginationContainer) {
              paginationContainer.innerHTML = "";
              if (showPagination && totalPages > 1) {
                for (let i = 1; i <= totalPages; i++) {
                  const btn = document.createElement("button");
                  btn.textContent = i.toString();
                  btn.className = `px-3 py-1 border rounded ${i === currentPage ? "bg-yellow-400" : "bg-white"}`;
                  btn.addEventListener("click", () => {
                    currentPage = i;
                    renderPages();
                  });
                  paginationContainer.appendChild(btn);
                }
              }
            }
          })
          .catch((err) => {
            pageContainer.innerHTML =
              '<p class="col-span-full text-center text-red-500">Failed to load pages.</p>';
            console.error(err);
          });
      };

      if (showSearch && searchInput) {
        searchInput.addEventListener("input", (e) => {
          searchQuery = (e.target as HTMLInputElement)?.value;
          currentPage = 1;
          renderPages();
        });
      }

      renderPages();
    });
  }, [findComponentById, content?.pages]);

  const renderLinkList = useCallback(() => {
    const containers = document?.querySelectorAll(
      '[data-gjs-type="link-list"]',
    );
    if (!containers) return;
    containers.forEach((children) => {
      const id = children.id;
      const component = findComponentById(content?.pages[0].frames, id);
      const container = children.querySelector(".link-list-container");
      if (!container || !component) return;
      const paginationContainer = children.querySelector(".link-pagination");
      const searchInput = children.querySelector(
        ".link-search",
      ) as HTMLInputElement;
      const dynamicFilters = children.querySelector(".link-dynamic-filters");
      let currentPage = 1;
      let totalPages = 1;
      let searchQuery = "";
      const dynamicAttributes: Record<string, string> = {};

      const showSearch = component.attributes
        ? component.attributes["data-show-search"] === "true"
        : false;
      const showPagination = component.attributes
        ? component.attributes["data-show-pagination"] === "true"
        : false;
      const tags = component.attributes
        ? component.attributes["data-tags"]
        : "";
      const filterAttrs = component.attributes
        ? component.attributes["data-filter-attributes"]
        : "";
      const filterKeys = filterAttrs
        .split(",")
        .map((k: string) => k.trim())
        .filter(Boolean);

      if (!showSearch && searchInput) {
        searchInput.style.display = "none";
      } else if (searchInput) {
        searchInput.style.display = "block";
      }

      const renderDynamicInputs = () => {
        if (!dynamicFilters) return;

        dynamicFilters.innerHTML = "";
        filterKeys.forEach((key: string) => {
          const wrapper = document.createElement("div");
          wrapper.className = "mb-2";

          const label = document.createElement("label");
          label.className = "block text-sm font-medium text-gray-700 mb-1";
          label.textContent = `Filter by ${key}`;
          wrapper.appendChild(label);

          const input = document.createElement("input");
          input.type = "text";
          input.className =
            "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm";
          input.placeholder = `Enter ${key}`;
          input.addEventListener("input", (e) => {
            dynamicAttributes[key] = (e.target as HTMLInputElement).value;
            currentPage = 1;
            renderLinks();
          });

          wrapper.appendChild(input);
          dynamicFilters.appendChild(wrapper);
        });
      };

      const renderLinks = () => {
        container.innerHTML =
          '<p class="col-span-full text-center text-gray-500">Loading links...</p>';

        const query = new URLSearchParams({
          page: currentPage.toString(),
          limit: "5",
          tags,
        });

        if (showSearch && searchQuery) {
          query.set("search", searchQuery);
        }

        Object.entries(dynamicAttributes).forEach(([key, value]) => {
          if (value.trim()) {
            query.set(`attributes[${key}]`, value.trim());
          }
        });

        fetch(`/api/public/links?${query.toString()}`)
          .then((res) => res.json())
          .then((body: { links: Link[]; total: number }) => {
            container.innerHTML = "";
            if (!Array.isArray(body?.links) || body.total === 0) {
              container.innerHTML =
                '<p class="col-span-full text-center text-gray-400 italic">No links found.</p>';
              return;
            }

            totalPages = Math.ceil(body.total / 5);

            const links = body.links;
            const firstLink = links[0];

            const firstCard = document.createElement("div");
            firstCard.className =
              "md:col-span-2 bg-white rounded-lg shadow-md p-4";
            if (firstLink.banner) {
              const img = document.createElement("img");
              img.src = firstLink.banner;
              img.alt = firstLink.title || "";
              img.className = "w-full h-48 object-cover rounded-md mb-4";
              firstCard.appendChild(img);
            }
            const title = document.createElement("h3");
            title.textContent = firstLink.title || "";
            title.className = "text-lg font-semibold mb-2";
            firstCard.appendChild(title);

            const excerpt = document.createElement("p");
            excerpt.textContent = firstLink.descriptions || "";
            excerpt.className = "text-sm text-gray-600";
            firstCard.appendChild(excerpt);

            if (firstLink.target) {
              const btn = document.createElement("a");
              btn.href = `${firstLink.target}`;
              btn.textContent = "Read More";
              btn.className =
                "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
              firstCard.appendChild(btn);
            }

            container.appendChild(firstCard);

            if (links.length > 1) {
              const secondCard = document.createElement("div");
              secondCard.className = "lg:col-span-1";

              links.slice(1).forEach((link: Link) => {
                const card = document.createElement("div");
                card.className = "bg-white rounded-lg shadow-md p-4";

                if (link.banner) {
                  const img = document.createElement("img");
                  img.src = link.banner;
                  img.alt = link.title || "";
                  img.className = "w-full h-48 object-cover rounded-md mb-4";
                  card.appendChild(img);
                }

                const title = document.createElement("h3");
                title.textContent = link.title || "";
                title.className = "text-lg font-semibold mb-2";
                card.appendChild(title);

                const excerpt = document.createElement("p");
                excerpt.textContent = link.descriptions || "";
                excerpt.className = "text-sm text-gray-600";
                card.appendChild(excerpt);

                if (link.target) {
                  const btn = document.createElement("a");
                  btn.href = `${link.target}`;
                  btn.textContent = "Read More";
                  btn.className =
                    "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
                  card.appendChild(btn);
                }

                secondCard.appendChild(card);
              });

              container.appendChild(secondCard);
            }

            // Only render pagination if enabled

            if (paginationContainer) {
              paginationContainer.innerHTML = "";
              if (showPagination && totalPages > 1) {
                for (let i = 1; i <= totalPages; i++) {
                  const btn = document.createElement("button");
                  btn.textContent = i.toString();
                  btn.className = `px-3 py-1 border rounded ${i === currentPage ? "bg-yellow-400" : "bg-white"}`;
                  btn.addEventListener("click", () => {
                    currentPage = i;
                    renderLinks();
                  });
                  paginationContainer.appendChild(btn);
                }
              }
            }
          })
          .catch((err) => {
            container.innerHTML =
              '<p class="col-span-full text-center text-red-500">Failed to load links.</p>';
            console.error(err);
          });
      };

      if (showSearch && searchInput) {
        searchInput.addEventListener("input", (e) => {
          searchQuery = (e.target as HTMLInputElement)?.value;
          currentPage = 1;
          renderLinks();
        });
      }

      renderDynamicInputs();
      renderLinks();
    });
  }, [findComponentById, content?.pages]);

  const renderTabs = useCallback(() => {
    const tabComponents = document?.querySelectorAll(
      '[data-gjs-type="custom-tabs"]',
    );
    // find model inside content
    if (!tabComponents) return;
    tabComponents.forEach((tab) => {
      const id = tab.id;
      const component = findComponentById(content?.pages[0].frames, id);
      if (!component) return;
      const raw = (component.tabs ||
        JSON.stringify([{ label: "Tab 1" }, { label: "Tab 2" }])) as string;
      let tabs;

      try {
        tabs = JSON.parse(raw);
        if (!Array.isArray(tabs)) throw new Error("Tabs must be an array");
      } catch (e) {
        console.warn("Invalid tabs JSON", e);
        return;
      }

      // Generate tab buttons and content panels
      const tabBtns = tabs
        .map(
          (tab, idx) => `
                  <button class="tab-btn px-4 py-2 text-sm font-medium ${
                    idx === 0
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600"
                  }">${tab.label || `Tab ${idx + 1}`}</button>
                `,
        )
        .join("");
      const panels = component.components ? component.components[1] : null;
      const tabPanels = tabs
        .map(
          (tab, idx) => `
                <div class="tab-panel ${idx === 0 ? "" : "hidden"}" data-gjs-slot="tab-${idx}">
                  ${
                    componentToHTML(
                      panels?.components?.find((c) => {
                        return c.slot === `tab-${idx}`;
                      }) as GjsComponent,
                    ) || `<span>Content for ${tab.label}</span>`
                  }
                </div>
              `,
        )
        .join("");

      // Update inner HTML
      component.innerHTML = `
              <div class="flex border-b border-gray-300">${tabBtns}</div>
              <div class="tab-content mt-4">${tabPanels}</div>
            `;

      setTimeout(() => {
        const el = tab;
        const tabButtons = el?.querySelectorAll(".tab-btn") || [];
        const tabPanels = el?.querySelectorAll(".tab-panel") || [];

        tabButtons.forEach((btn: Element, idx: number) => {
          btn.addEventListener("click", () => {
            tabButtons.forEach((b: Element) =>
              b.classList.remove(
                "text-blue-600",
                "border-b-2",
                "border-blue-600",
              ),
            );
            tabPanels.forEach((p: Element) => p.classList.add("hidden"));

            btn.classList.add("text-blue-600", "border-b-2", "border-blue-600");
            tabPanels[idx].classList.remove("hidden");
          });
        });
      }, 0);
    });
  }, [componentToHTML, findComponentById, content?.pages]);

  const renderNavbar = useCallback(() => {
    const navbars = document?.querySelectorAll(
      '[data-gjs-type="custom-navbar"]',
    );
    // find model inside content
    if (!navbars) return;
    navbars.forEach((navbar) => {
      const burger = navbar.querySelector(".burger-btn");
      const menu = navbar.querySelector(".mobile-menu");
      if (burger && menu) {
        burger.addEventListener("click", () => {
          menu.classList.toggle("hidden");
        });
      }

      const searchInputs = navbar?.querySelectorAll(
        'input[placeholder="Search"]',
      );

      function debounce<T extends (...args: unknown[]) => void>(
        fn: T,
        delay: number,
      ) {
        let timeout: NodeJS.Timeout;
        return (...args: unknown[]) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn(...args), delay);
        };
      }

      const fetchResults = async (query: string, container: Element) => {
        if (!query) {
          container.innerHTML = "";
          return;
        }

        const queryString = new URLSearchParams({
          page: "1",
          limit: "5",
          tags: "article,conferences",
        });

        if (query) {
          queryString.set("search", encodeURIComponent(query));
        }
        try {
          const res = await fetch(`/api/public?${queryString}`);
          const data = await res.json();
          const pages = data.pages;
          const total = data.total;

          container.innerHTML = "";

          if (!Array.isArray(pages) || total === 0) {
            const noResult = document.createElement("div");
            noResult.textContent = "No results found";
            noResult.className = "px-2 py-1 text-gray-500 text-sm";
            container.appendChild(noResult);
            return;
          }

          pages.forEach((page: Page) => {
            const link = document.createElement("a");
            link.href = page.slug || "#";
            link.textContent = page.metaTitle || page.title || "Untitled";
            link.className = "block px-2 py-1 hover:bg-gray-100 text-sm";
            container.appendChild(link);
          });
        } catch (error) {
          console.error(error);
          container.innerHTML = `<div class="px-2 py-1 text-red-500 text-sm">Error loading results</div>`;
        }
      };

      searchInputs.forEach((input) => {
        const wrapper = document.createElement("div");
        wrapper.className = "relative w-full";
        input.parentNode?.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const resultsContainer = document.createElement("div");
        resultsContainer.className =
          "absolute left-0 right-0 top-full mt-1 z-50 bg-white border rounded shadow hidden";
        wrapper.appendChild(resultsContainer);

        input.addEventListener(
          "input",
          debounce((e) => {
            const query = (
              (e as Event).target as HTMLInputElement
            )?.value.trim();
            resultsContainer.classList.remove("hidden");
            fetchResults(query, resultsContainer);
          }, 300),
        );

        // Hide results on outside click
        document.addEventListener("click", (e) => {
          if (e && !wrapper.contains(e.target as HTMLButtonElement)) {
            resultsContainer.classList.add("hidden");
          }
        });
      });
    });
  }, []);

  useEffect(() => {
    if (content) {
      // render tabs
      renderTabs();

      // render infinite-slides
      renderSlider();

      // render carousel
      renderCarousel();

      // render count up
      renderCountUp();

      // render link list
      renderLinkList();

      // render page list
      renderPageList();

      // render navbar
      renderNavbar();
    }
  }, [
    renderedHtml,
    content,
    renderTabs,
    renderSlider,
    renderCarousel,
    renderCountUp,
    renderLinkList,
    renderPageList,
    renderNavbar,
  ]);

  if (isPreview) {
    return (
      <div className="grapesjs-public-page-wrapper">
        <style>{renderedCss}</style>
        <div id="root" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        <div hidden ref={containerRef} />
      </div>
    );
  } else {
    return (
      <div className="overflow-hidden min-h-screen w-full flex flex-col">
        <div ref={containerRef} className="grow relative" />
      </div>
    );
  }
}
