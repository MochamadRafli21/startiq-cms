"use client";
import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import ReactDOM from "react-dom/client";
import grapesjs, { Component, Trait, TraitProperties } from "grapesjs";
import tailwindPlugin from "grapesjs-tailwindcss-plugin"; // Import the plugin
import "grapesjs/dist/css/grapes.min.css";
import { Carousel } from "@/components/organisms/grapesjs/carousel";
import { InfiniteSlides } from "@/components/organisms/grapesjs/infinite-slides";
import type { Page } from "@/types/page.type";
import type { Link } from "@/types/link.type";

interface PageEditorProps {
  content?: Record<string, any>;
  onContentChange?: (data: Record<string, any>) => void;
  isPreview?: boolean;
}

export default function PageEditor({
  content,
  onContentChange,
  isPreview = false,
}: PageEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [renderedCss, setRenderedCss] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;
    // Dynamically import all plugins here
    const loadPlugins = async () => {
      const basicBlocks = (await import("grapesjs-blocks-basic")).default;
      const flexbox = (await import("grapesjs-blocks-flexbox")).default;
      const countdown = (await import("grapesjs-component-countdown")).default;
      const customCode = (await import("grapesjs-custom-code")).default;
      const navbar = (await import("grapesjs-navbar")).default;
      const postcss = (await import("grapesjs-parser-postcss")).default;
      const pluginExport = (await import("grapesjs-plugin-export")).default;
      const presetWebpage = (await import("grapesjs-preset-webpage")).default;
      const styleBg = (await import("grapesjs-style-bg")).default;
      const imageEditor = (await import("grapesjs-tui-image-editor")).default;
      const touch = (await import("grapesjs-touch")).default;
      const forms = (await import("grapesjs-plugin-forms")).default;
      const typed = (await import("grapesjs-typed")).default;
      const tooltip = (await import("grapesjs-tooltip")).default;

      if (!containerRef.current) {
        console.error("GrapesJS container not found.");
        return;
      }

      const editor = grapesjs.init({
        container: containerRef.current,
        height: "100vh",
        headless: isPreview,
        fromElement: false,
        storageManager: false,
        parser: {
          optionsHtml: {
            allowUnsafeAttr: true,
          },
        },
        assetManager: !isPreview
          ? {
              upload: "/api/uploads",
              uploadName: "file",
              autoAdd: true,
              multiUpload: false,
              assets: [],
            }
          : {},
        plugins: [
          basicBlocks,
          tailwindPlugin,
          flexbox,
          countdown,
          customCode,
          navbar,
          postcss,
          pluginExport,
          forms,
          presetWebpage,
          styleBg,
          tooltip,
          touch,
          imageEditor,
          typed,
        ],
        pluginsOpts: {
          [presetWebpage.name]: {},
          [imageEditor.name]: {
            script: [
              "https://cdn.jsdelivr.net/npm/fabric@4.6.0/dist/fabric.min.js",
              "https://cdn.jsdelivr.net/npm/tui-image-editor@3.15.2/dist/tui-image-editor.min.js",
            ],
            style: [
              "https://cdn.jsdelivr.net/npm/tui-image-editor@3.15.2/dist/tui-image-editor.min.css",
            ],
          },
        },
      });

      const domComponents = editor.DomComponents;
      if (!domComponents) return;
      const defaultType = domComponents?.getType("default");
      //const defaultModel = defaultType.model;
      const defaultView = defaultType?.view;

      editor.on("load", () => {
        const iframe = editor.Canvas.getFrameEl();
        const head = iframe.contentDocument?.head;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href =
          "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

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
        if (head) {
          const styleEl = document.createElement("style");
          styleEl.innerHTML = animationCSS;
          head.appendChild(styleEl);
          head.appendChild(link);
        }
      });

      editorRef.current = editor;
      // load images data
      editor.on("load", () => {
        fetch("/api/assets") // Call your new API route
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((assets) => {
            if (assets && assets.length > 0) {
              // Add the fetched assets to the GrapesJS Asset Manager
              editor.AssetManager.add(assets);
            }
          })
          .catch((error) =>
            console.error("Error fetching existing assets:", error),
          );
      });

      editor.TraitManager.addType("link-tags-selector", {
        createInput() {
          const el = document.createElement("select");
          el.multiple = true;
          el.style.minHeight = "80px";
          el.style.width = "100%";
          el.style.padding = "4px";

          fetch("/api/links/tags")
            .then((res) => res.json())
            .then((body: { tags: string[] }) => {
              const tags = body.tags;
              tags.forEach((tag) => {
                const opt = document.createElement("option");
                opt.value = tag;
                opt.textContent = tag;
                el.appendChild(opt);
              });
            })
            .catch((err) => {
              console.error("Failed to load tags:", err);
            });
          return el;
        },
        onEvent({
          elInput,
          component,
        }: {
          elInput: any;
          component: Component;
        }) {
          const input = elInput as HTMLSelectElement;
          const selectedTags = Array.from(input.selectedOptions).map(
            (opt) => opt.value,
          );
          component.set("tags", selectedTags.join(","));
          component.addAttributes({ "data-tags": selectedTags.join(",") });

          // Re-run script
          const script = component.get("script");
          component.set("script", "");
          component.set("script", script);
        },
      });
      editor.TraitManager.addType("tags-selector", {
        createInput() {
          const el = document.createElement("select");
          el.multiple = true;
          el.style.minHeight = "80px";
          el.style.width = "100%";
          el.style.padding = "4px";

          fetch("/api/pages/tags")
            .then((res) => res.json())
            .then((body: { tags: string[] }) => {
              const tags = body.tags;
              tags.forEach((tag) => {
                const opt = document.createElement("option");
                opt.value = tag;
                opt.textContent = tag;
                el.appendChild(opt);
              });
            })
            .catch((err) => {
              console.error("Failed to load tags:", err);
            });
          return el;
        },
        onEvent({
          elInput,
          component,
        }: {
          elInput: any;
          component: Component;
        }) {
          const input = elInput as HTMLSelectElement;
          const selectedTags = Array.from(input.selectedOptions).map(
            (opt) => opt.value,
          );
          component.set("tags", selectedTags.join(","));
          component.addAttributes({ "data-tags": selectedTags.join(",") });

          // Re-run script
          const script = component.get("script");
          component.set("script", "");
          component.set("script", script);
        },
      });
      // --- 1. Define Custom Trait: AssetManagerOpenerTrait ---
      editor.TraitManager.addType("selected-images-viewer", {
        createInput(this: any) {
          const container = document.createElement("div");

          container.className = "gjs-selected-images-container";

          // Initialize empty content
          container.innerHTML = '<p style="color: #888;">Loading images...</p>';

          return container;
        },
        // `onUpdate` is crucial: it updates the trait's UI whenever the component's 'images' property changes

        onUpdate(
          this: any,
          {
            component,
            elInput,
          }: { component: Component; elInput: HTMLElement; trait: Trait },
        ) {
          const container = elInput;
          const images: string[] = component.get("images") || [];

          container.innerHTML = ""; // Clear it first

          if (images.length === 0) {
            container.innerHTML =
              '<p style="font-size: 0.9em; color: #888;">No images selected yet.</p>';
            return;
          }

          if (images.length === 0) {
            container.innerHTML =
              '<p style="font-size: 0.9em; color: #888; margin: 0;">No images selected yet.</p>';
            return;
          }

          images.forEach((url: string, index: number) => {
            // Added type annotations for url, index
            const imgItem = document.createElement("div");
            imgItem.className = "gjs-selected-image-item";
            imgItem.style.cssText = `
              display: flex;
              align-items: center;
              margin-bottom: 5px;
              border: 1px solid #eee;
              padding: 5px;
              background-color: #fff;
              border-radius: 3px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            `;

            const img = document.createElement("img");
            img.src = url;
            img.alt = `Selected Image ${index + 1}`;
            img.style.cssText = `
              width: 40px;
              height: 40px;
              object-fit: cover;
              margin-right: 10px;
              border-radius: 2px;
            `;
            imgItem.appendChild(img);

            const removeBtn = document.createElement("button");
            removeBtn.className =
              "gjs-remove-image gjs-btn-prim gjs-btn-button"; // Add a unique class for event listener
            removeBtn.innerHTML = "&times;";
            removeBtn.title = "Remove image";
            removeBtn.setAttribute("data-index", String(index)); // Store index for removal
            removeBtn.style.cssText = `
              margin-left: 10px;
              background-color: #dc3545;
              border: none;
              color: white;
              width: 25px;
              height: 25px;
              line-height: 1;
              border-radius: 3px;
              cursor: pointer;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
            `;
            const currentComponent = component; // Capture component reference

            removeBtn.onclick = (e) => {
              e.stopPropagation(); // Prevent potential bubbling issues

              const target = e.target as HTMLElement;
              const indexToRemove = parseInt(
                target.getAttribute("data-index") || "-1",
                10,
              );

              if (!isNaN(indexToRemove) && indexToRemove >= 0) {
                const currentImages: string[] =
                  currentComponent.get("images") || [];
                const newImages = currentImages.filter(
                  (_, idx) => idx !== indexToRemove,
                );

                // This still triggers onUpdate, so the UI will refresh
                currentComponent.set("images", newImages);

                // If you implemented undo, you'd call it like:
                // (currentTrait as any).handleUndoLogic(currentComponent, prevImages, removedImage, indexToRemove);
              }
            };
            imgItem.appendChild(removeBtn);

            container.appendChild(imgItem);
          });
        },
        // Event handler for removing an image
        onRemoveImage(this: Trait, event: Event) {
          // Added type annotation for event
          const target = event.target as HTMLElement; // Cast to HTMLElement for attribute access
          const indexToRemove = parseInt(
            target.getAttribute("data-index") || "-1",
            10,
          );
          const component = this.target; // The component associated with this trait
          const images: string[] = component.get("images") || [];

          if (indexToRemove >= 0 && indexToRemove < images.length) {
            images.splice(indexToRemove, 1); // Remove the image at the given index
            // Crucially, set a new array to trigger GrapesJS reactivity
            component.set("images", [...images]);
          }
        },

        // Helper function (private-like convention with underscore)
        _truncateUrl(this: Trait, url: string, maxLength: number): string {
          // Added type annotations
          if (url.length <= maxLength) {
            return url;
          }
          const start = url.lastIndexOf("/") + 1;
          const filename = url.substring(start);
          if (filename.length <= maxLength) {
            return filename;
          }
          return "..." + filename.substring(filename.length - maxLength + 3);
        },
      } as TraitProperties); // Cast to TraitProperties

      //adding custom command to open multi select asset manager
      editor.Commands.add("open-assets-multiple", {
        run(editor) {
          const selected = editor.getSelected();
          if (!selected || selected.get("type") !== "infinite-slides") {
            editor.Modal.open({
              title: "Select the Infinite Slides component first",
              content:
                "Please select an 'Infinite Slides' component before adding images.",
            });
            return;
          }

          const selectedAssets: string[] = [];

          editor.AssetManager.open({
            select: (asset, complete) => {
              const src = asset.get("src");
              if (!selectedAssets.includes(src)) {
                selectedAssets.push(src);
              }

              if (complete && selectedAssets.length > 0) {
                const prev = selected.get("images");
                selected.set("images", [...selectedAssets, ...prev]);
              }
            },
          });
        },
      });

      //register partner sections

      editor.BlockManager.add("horizontal-scroll-logos", {
        label: "Partner Logos",
        category: "Sections",
        content: `
          <div style="overflow-x: scroll; white-space: nowrap; padding: 10px; background: #eee;">
            <div style="display: inline-flex; gap: 40px; align-items: center;">
              <div style="display: inline-flex; flex-direction: row; align-items: center;">
                <img src="logo1.png" style="height: 40px;" />
                <span style="font-weight: bold;">Scholarvein</span>
              </div>
              <div style="display: inline-flex; flex-direction: row; align-items: center;">
                <img src="logo2.png" style="height: 40px;" />
                <span style="font-weight: bold;">Reviewer Track</span>
              </div>
              <div style="display: inline-flex; flex-direction: row; align-items: center;">
                <img src="logo3.png" style="height: 40px;" />
                <span style="font-weight: bold;">Research Synergy Institute</span>
              </div>
            </div>
          </div>
        `,
      });

      editor.DomComponents.addType("custom-tabs", {
        model: {
          defaults: {
            attributes: {
              "data-gjs-type": "custom-tabs",
            },
            traits: [
              {
                type: "textarea",
                label: "Tabs (JSON)",
                name: "tabs",
                changeProp: true,
                placeholder: `[{"label":"Tab 1"},{"label":"Tab 2"}]`,
              },
            ],
            tabs: JSON.stringify([{ label: "Tab 1" }, { label: "Tab 2" }]),
            script: function () {
              const tabs = this?.querySelectorAll(".tab-btn");
              const panels = this?.querySelectorAll(".tab-panel");

              tabs.forEach((btn: HTMLButtonElement, idx: number) => {
                btn.addEventListener("click", () => {
                  tabs.forEach((b: HTMLButtonElement) =>
                    b.classList.remove("text-blue-600", "border-blue-600"),
                  );
                  panels.forEach((p: HTMLElement) => p.classList.add("hidden"));

                  btn.classList.add(
                    "text-blue-600",
                    "border-b-2",
                    "border-blue-600",
                  );
                  panels[idx].classList.remove("hidden");
                });
              });
            },
          },

          init() {
            this.on("change:tabs", this.updateTabs);
          },

          updateTabs() {
            const raw = this.get("tabs");
            let tabs;

            try {
              tabs = JSON.parse(raw);
              if (!Array.isArray(tabs))
                throw new Error("Tabs must be an array");
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
            const tabPanels = tabs
              .map(
                (tab, idx) => `
                <div class="tab-panel ${idx === 0 ? "" : "hidden"}" data-gjs-slot="tab-${idx}">
                  ${
                    this.components()
                      .find(
                        (c: Component) =>
                          c.getAttributes()["data-gjs-slot"] === `tab-${idx}`,
                      )
                      ?.toHTML() || `<span>Content for ${tab.label}</span>`
                  }
                </div>
              `,
              )
              .join("");

            // Update inner HTML
            this.components(`
              <div class="flex border-b border-gray-300">${tabBtns}</div>
              <div class="tab-content mt-4">${tabPanels}</div>
            `);

            // 🧠 Wait for DOM update, then add listeners
            setTimeout(() => {
              const el = this.view?.el || this.getEl();
              const tabButtons = el?.querySelectorAll(".tab-btn") || [];
              const tabPanels = el?.querySelectorAll(".tab-panel") || [];

              tabButtons.forEach((btn, idx) => {
                btn.addEventListener("click", () => {
                  tabButtons.forEach((b) =>
                    b.classList.remove(
                      "text-blue-600",
                      "border-b-2",
                      "border-blue-600",
                    ),
                  );
                  tabPanels.forEach((p) => p.classList.add("hidden"));

                  btn.classList.add(
                    "text-blue-600",
                    "border-b-2",
                    "border-blue-600",
                  );
                  tabPanels[idx].classList.remove("hidden");
                });
              });
            }, 0);
          },
        },
      });

      editor.BlockManager.add("custom-tabs", {
        label: "Tabs",
        category: "Basic",
        content: `
          <div data-gjs-type="custom-tabs" class="w-full max-w-3xl mx-auto">
            <div class="flex border-b border-gray-300">
              <button class="tab-btn px-4 py-2 text-sm font-medium text-blue-600 border-b-2 border-blue-600">Tab 1</button>
              <button class="tab-btn px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600">Tab 2</button>
            </div>
            <div class="tab-content mt-4">
              <div class="tab-panel" data-gjs-slot="tab-1"><span>This is content for Tab 1.</span></div>
              <div class="tab-panel hidden" data-gjs-slot="tab-2"><span>This is content for Tab 2.</span></div>
            </div>
          </div>
          `,
      });

      // add link list component
      editor.BlockManager.add("link-list", {
        label: "Link List",
        category: "Custom",
        content: `
          <section data-gjs-type="link-list" class="w-full max-w-6xl mx-auto py-10 px-4">
            <div class="mb-4 flex justify-between items-center">
              <input type="text" placeholder="Search links..." class="link-search border px-3 py-1 rounded w-full max-w-xs" />
            </div>
            <div class="mb-4 flex flex-col md:flex-row flex-wrap justify-between items-center link-dynamic-filters">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 link-list-container">
              <p class="col-span-full text-center text-gray-500">Loading links...</p>
            </div>
            <div class="mt-6 flex justify-center gap-2 link-pagination">
              <!-- Pagination buttons injected by script -->
            </div>
          </section>
        `,
      });

      // 2. Register the component type with fetching logic
      editor.DomComponents.addType("link-list", {
        model: {
          defaults: {
            attributes: {
              class: "link-list",
              "data-gjs-type": "link-list",
              "data-show-search": false,
              "data-show-pagination": false,
              "data-tags": "",
              "data-filter-attributes": "",
            },
            traits: [
              {
                type: "checkbox",
                label: "Show Search Input",
                name: "showSearch",
                changeProp: true,
              },
              {
                type: "checkbox",
                label: "Show Pagination",
                name: "showPagination",
                changeProp: true,
              },
              {
                type: "link-tags-selector",
                label: "Filter by Tags",
                name: "tags",
                changeProp: true,
              },
              {
                type: "text",
                label: "Attribute Filters (e.g. year,source)",
                name: "filterAttributes",
                changeProp: true,
              },
            ],
            showSearch: "false",
            showPagination: "false",
            tags: "",
            filterAttributes: "",
            script: function () {
              const container = this.querySelector(".link-list-container");
              const paginationContainer =
                this.querySelector(".link-pagination");
              const searchInput = this.querySelector(".link-search");
              const dynamicFilters = this.querySelector(
                ".link-dynamic-filters",
              );

              let currentPage = 1;
              let totalPages = 1;
              let searchQuery = "";
              const dynamicAttributes: Record<string, string> = {};

              const showSearch =
                this.getAttribute("data-show-search") === "true";
              const showPagination =
                this.getAttribute("data-show-pagination") === "true";
              const tags = this.getAttribute("data-tags");
              const filterAttrs =
                this.getAttribute("data-filter-attributes") || "";
              const filterKeys = filterAttrs
                .split(",")
                .map((k: string) => k.trim())
                .filter(Boolean);

              if (!showSearch && searchInput) {
                searchInput.style.display = "none";
              } else {
                searchInput.style.display = "block";
              }

              const renderDynamicInputs = () => {
                if (!dynamicFilters) return;

                dynamicFilters.innerHTML = "";
                filterKeys.forEach((key: string) => {
                  const wrapper = document.createElement("div");
                  wrapper.className = "mb-2";

                  const label = document.createElement("label");
                  label.className =
                    "block text-sm font-medium text-gray-700 mb-1";
                  label.textContent = `Filter by ${key}`;
                  wrapper.appendChild(label);

                  const input = document.createElement("input");
                  input.type = "text";
                  input.className =
                    "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm";
                  input.placeholder = `Enter ${key}`;
                  input.addEventListener("input", (e: any) => {
                    dynamicAttributes[key] = e.target.value;
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
                      img.className =
                        "w-full h-48 object-cover rounded-md mb-4";
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
                          img.className =
                            "w-full h-48 object-cover rounded-md mb-4";
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
                  })
                  .catch((err) => {
                    container.innerHTML =
                      '<p class="col-span-full text-center text-red-500">Failed to load links.</p>';
                    console.error(err);
                  });
              };

              if (showSearch && searchInput) {
                searchInput.addEventListener(
                  "input",
                  (e: ChangeEvent<HTMLInputElement>) => {
                    searchQuery = e.target?.value;
                    currentPage = 1;
                    renderLinks();
                  },
                );
              }

              renderDynamicInputs();
              renderLinks();
            },
          },
          init() {
            this.on(
              "change:showSearch change:showPagination, change:tags, change:filterAttributes",
              () => {
                const showSearch = this.get("showSearch");
                const showPagination = this.get("showPagination");
                const tags = this.get("tags");
                const filterAttributes = this.get("filterAttributes");
                this.addAttributes({
                  "data-show-search": `${showSearch}`,
                  "data-show-pagination": `${showPagination}`,
                  "data-tags": `${tags}`,
                  "data-filter-attributes": filterAttributes,
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

      // add page list component
      // 1. Register the block
      editor.BlockManager.add("page-list", {
        label: "Page List",
        category: "Custom",
        content: `
          <section data-gjs-type="page-list" class="w-full max-w-6xl mx-auto py-10 px-4">
            <div class="mb-4 flex justify-between items-center">
              <input type="text" placeholder="Search pages..." class="page-search border px-3 py-1 rounded w-full max-w-xs" />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 page-list-container">
              <p class="col-span-full text-center text-gray-500">Loading pages...</p>
            </div>
            <div class="mt-6 flex justify-center gap-2 page-pagination">
              <!-- Pagination buttons injected by script -->
            </div>
          </section>
        `,
      });

      // 2. Register the component type with fetching logic
      editor.DomComponents.addType("page-list", {
        model: {
          defaults: {
            attributes: {
              class: "page-list",
              "data-gjs-type": "page-list",
              "data-show-search": false,
              "data-show-pagination": false,
              "data-tags": "",
            },
            traits: [
              {
                type: "checkbox",
                label: "Show Search Input",
                name: "showSearch",
                changeProp: true,
              },
              {
                type: "checkbox",
                label: "Show Pagination",
                name: "showPagination",
                changeProp: true,
              },
              {
                type: "tags-selector",
                label: "Filter by Tags",
                name: "tags",
                changeProp: true,
              },
            ],
            showSearch: "false",
            showPagination: "false",
            tags: "",
            script: function () {
              const container = this.querySelector(".page-list-container");
              const paginationContainer =
                this.querySelector(".page-pagination");
              const searchInput = this.querySelector(".page-search");
              let currentPage = 1;
              let totalPages = 1;
              let searchQuery = "";
              const showSearch =
                this.getAttribute("data-show-search") === "true";
              const showPagination =
                this.getAttribute("data-show-pagination") === "true";
              const tags = this.getAttribute("data-tags");

              if (!showSearch && searchInput) {
                searchInput.style.display = "none";
              } else {
                searchInput.style.display = "block";
              }

              const renderPages = () => {
                container.innerHTML =
                  '<p class="col-span-full text-center text-gray-500">Loading pages...</p>';

                const query = new URLSearchParams({
                  page: currentPage.toString(),
                  limit: "5",
                  tags,
                });

                if (showSearch && searchQuery) {
                  query.set("search", searchQuery);
                }

                fetch(`/api/public?${query.toString()}`)
                  .then((res) => res.json())
                  .then((body: { pages: Page[]; total: number }) => {
                    container.innerHTML = "";
                    if (!Array.isArray(body?.pages) || body.total === 0) {
                      container.innerHTML =
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
                      img.className =
                        "w-full h-48 object-cover rounded-md mb-4";
                      firstCard.appendChild(img);
                    }
                    const title = document.createElement("h3");
                    title.textContent =
                      firstPage.metaTitle || firstPage.title || "";
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

                    container.appendChild(firstCard);

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
                          img.className =
                            "w-full h-48 object-cover rounded-md mb-4";
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

                      container.appendChild(secondCard);
                    }

                    // Only render pagination if enabled
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
                  })
                  .catch((err) => {
                    container.innerHTML =
                      '<p class="col-span-full text-center text-red-500">Failed to load pages.</p>';
                    console.error(err);
                  });
              };

              if (showSearch && searchInput) {
                searchInput.addEventListener(
                  "input",
                  (e: ChangeEvent<HTMLInputElement>) => {
                    searchQuery = e.target?.value;
                    currentPage = 1;
                    renderPages();
                  },
                );
              }

              renderPages();
            },
          },
          init() {
            this.on("change:showSearch change:showPagination", () => {
              const showSearch = this.get("showSearch");
              const showPagination = this.get("showPagination");
              const tags = this.get("tags");
              this.addAttributes({
                "data-show-search": `${showSearch}`,
                "data-show-pagination": `${showPagination}`,
                "data-tags": `${tags}`,
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

      //register default navbar
      editor.BlockManager.add("custom-navbar", {
        label: "Navbar",
        category: "Basic",
        content: `
    <header data-gjs-type="custom-navbar" class="w-full shadow-md">
      <div class="max-w-screen mx-auto px-4 py-4 flex items-center bg-gray-300 absolute top-0  justify-between">
        <div class="flex items-center gap-4 overflow-x-scroll">
          <img src="/uploads/logo-rsf-transparant.webp" alt="Logo" class="h-10"/>
          <nav class="hidden md:flex gap-6 text-sm font-medium">
            <a href="https://globalresearchecosystem.com/" class="relative text-blue-900 after:absolute after:left-0 after:-bottom-1 after:h-1 after:w-full after:bg-yellow-400">Home</a>
            <a href="/about">About</a>
            <a href="">Membership</a>
            <a href="/conferences">Conferences</a>
            <a href="/publications">Publication</a>
            <a href="/learnings">Learning</a>
            <a href="/articles">Updates</a>
          </nav>
        </div>
        <div class="hidden md:flex items-center gap-4">
          <div class="relative">
            <input type="text" placeholder="Search" class="pl-10 pr-4 py-2 border rounded-full" />
            <svg class="absolute left-3 top-2.5 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </div>
          <button class="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-full">Join Us</button>
        </div>

        <!-- Burger -->
        <div class="md:hidden text-gray-700 burger-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu-icon lucide-menu"><path d="M4 12h16"/><path d="M4 18h16"/><path d="M4 6h16"/></svg>
        </div>
      </div>

      <!-- Mobile nav -->
      <div class="mobile-menu hidden md:hidden flex-col gap-4 px-4 pb-4">
        <nav class="flex flex-col gap-2 text-sm font-medium">
          <a href="#" class="text-blue-900">Home</a>
          <a href="/about">About</a>
          <a href="#">Membership</a>
          <a href="/conferneces">Conferences</a>
          <a href="/publications">Publication</a>
          <a href="/learning">Learning</a>
          <a href="/articles">Updates</a>
        </nav>
        <div class="mt-3">
          <input type="text" placeholder="Search" class="w-full pl-10 pr-4 py-2 border rounded-full relative" />
        </div>
      </div>
    </header>
  `,
      });

      // Register the custom component type to include script
      editor.DomComponents.addType("custom-navbar", {
        model: {
          defaults: {
            attributes: {
              class: "custom-navbar",
              "data-gjs-type": "custom-navbar",
            },
            script: function () {
              const burger = this.querySelector(".burger-btn");
              const menu = this.querySelector(".mobile-menu");
              if (burger && menu) {
                burger.addEventListener("click", () => {
                  menu.classList.toggle("hidden");
                });
              }
            },
          },
        },
      });

      //register default footer
      editor.BlockManager.add("custom-footer", {
        label: "Footer",
        category: "Basic",
        content: `
    <footer class="bg-[#1e4c56] text-white px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-6 text-sm">
        <!-- Logo + Contact Info -->
        <div class="col-span-1 space-y-4">
          <img src="https://via.placeholder.com/180x80?text=Logo" alt="Logo" class="mb-4">
          <p>123 Academic Avenue, Research Park, CA 94103</p>
          <p>📞 +1 (555) 123-4567</p>
          <p>✉️ contact@researchplatform.com</p>
        </div>

        <!-- Ecosystem -->
        <div>
          <h4 class="font-bold mb-2">Ecosystem</h4>
          <ul class="space-y-1">
            <li><a href="#">Research Journals</a></li>
            <li><a href="#">Conference Papers</a></li>
            <li><a href="#">Data Repository</a></li>
            <li><a href="#">Research Tools</a></li>
          </ul>
        </div>

        <!-- Join Us -->
        <div>
          <h4 class="font-bold mb-2">Join Us</h4>
          <ul class="space-y-1">
            <li><a href="#">For Researchers</a></li>
            <li><a href="#">For Reviewers</a></li>
            <li><a href="#">For Institutions</a></li>
            <li><a href="#">For Publishers</a></li>
          </ul>
        </div>

        <!-- Menu -->
        <div>
          <h4 class="font-bold mb-2">Menu</h4>
          <ul class="space-y-1">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Our Team</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

        <!-- Social Icons -->
        <div>
          <h4 class="font-bold mb-2">Follow Us</h4>
          <div class="flex gap-4">
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" class="w-5 h-5" alt="LinkedIn" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" class="w-5 h-5" alt="Instagram" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" class="w-5 h-5" alt="Facebook" /></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733646.png" class="w-5 h-5" alt="YouTube" /></a>
          </div>
        </div>
      </div>
    </footer>
  `,
      });

      // register count up card component

      editor.Components.addType("count-up", {
        model: {
          defaults: {
            tagName: "div",
            droppable: false,
            endValue: 1000,
            duration: 2000,
            attributes: {
              class: "count-up",
              "data-gjs-type": "count-up", // Custom type attribute for GrapesJS
            },
            traits: [
              {
                type: "number",
                label: "End Value",
                name: "endValue",
                placeholder: "e.g. 1000",
                changeProp: true,
              },
              {
                type: "number",
                label: "Duration (ms)",
                name: "duration",
                placeholder: "e.g. 2000",
                changeProp: true,
              },
            ],
            script: function () {
              const endValue = parseInt(
                this?.getAttribute("endvalue") || "100",
              );
              const duration = parseInt(
                this?.getAttribute("duration") || "2000",
              );

              const animateCount = () => {
                const startTime = performance.now();

                const step = (timestamp: number) => {
                  const progress = Math.min(
                    (timestamp - startTime) / duration,
                    1,
                  );
                  const current = Math.floor(progress * endValue);
                  this.innerHTML = current.toLocaleString();
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
              observer.observe(this as unknown as Element);
            },
          },

          init() {
            this.on("change:endValue change:duration", () => {
              const el: any = this.view?.el;
              if (el && typeof el.__grapesjs_script === "function") {
                el.__grapesjs_script.call(el);
              }
            });
          },
        },

        view: {
          renderCountUp() {
            const { el, model } = this;
            const endValue = parseInt(model?.get("endValue") || "100");
            const duration = parseInt(model?.get("duration") || "2000");

            const animateCount = () => {
              const startTime = performance.now();

              const step = (timestamp: number) => {
                const progress = Math.min(
                  (timestamp - startTime) / duration,
                  1,
                );
                const current = Math.floor(progress * endValue);
                el.innerHTML = current.toLocaleString();
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
            observer.observe(el);
          },
          initialize(...args) {
            defaultView.prototype.initialize.apply(this, ...args);

            // Listen to changes in specific traits (autoplay, interval)
            this.listenTo(
              this.model,
              "change:duration change:endValue",
              this.renderCountUp,
            );
          },

          onRender() {
            const { el, model } = this;
            const endValue = model.get("endValue") || 100;
            const duration = model.get("duration") || 2000;

            el.setAttribute("endvalue", endValue);
            el.setAttribute("duration", duration);

            el.innerHTML = `0`;
          },
        },
      });

      editor.Blocks.add("count-up", {
        label: "Count Up",
        category: "Basic",
        content: {
          type: "count-up",
          attributes: {
            endValue: 1000,
            duration: 2000,
          },
        },
      });
      //register infinite image slides
      editor.DomComponents.addType("infinite-slides", {
        model: {
          defaults: {
            tagName: "div", // The HTML tag that will wrap the React component
            stylable: true, // Allow styling
            draggable: true,
            droppable: false,
            attributes: {
              // Default attributes for the component
              "data-gjs-type": "infinite-slides", // Custom type attribute for GrapesJS
            },
            speed: 30, // Default speed
            direction: "left", // Default speed
            images: [
              "https://placehold.co/150x80/FF5733/FFFFFF?text=Default+A",
              "https://placehold.co/150x80/33FF57/FFFFFF?text=Default+B",
            ],
            imageList: [
              "https://placehold.co/150x80/FF5733/FFFFFF?text=Default+A",
              "https://placehold.co/150x80/33FF57/FFFFFF?text=Default+B",
            ],
            // Define traits for the component
            traits: [
              {
                type: "selected-images-viewer", // This is the key
                label: "Manage Slider Images",
                name: "imageList",
                changeProp: true, // IMPORTANT: This trait needs to update when 'images' property changes
                // It doesn't modify a prop directly, but `onUpdate` relies on prop changes.
              },
              {
                type: "button", // This is the key
                name: "images",
                label: "Select Images",
                text: "Open Asset Manager",
                full: true, // Make it full width
                command: "open-assets-multiple", // Custom command to open asset manager
                changeProp: true, // IMPORTANT: This trait needs to update when 'images' property changes
              },
              {
                type: "select",
                label: "Direction",
                name: "direction",
                options: [
                  { id: "left", label: "Left" },
                  { id: "right", label: "Right" },
                ],
                changeProp: true,
              },
              {
                type: "number",
                label: "Speed",
                name: "speed",
                placeholder: "3000",
                min: 1,
                max: 100,
                changeProp: true, // Update property on change
              },
            ],
          },
        },
        view: defaultView.extend({
          tagName: "div",
          className: "gjs-infinite-slides-react-wrapper", // Class for the GrapesJS wrapper element
          root: null, // To store the React root for React 18+

          // Method to render/re-render the React component
          // Using useCallback to memoize to prevent unnecessary re-creations
          renderReactSlider() {
            // Use `function` to ensure `this` context
            const el = this.el; // The DOM element managed by GrapesJS for this component
            const model = this.model;

            const imagesArray = model.get("images");
            const direction = model.get("direction") === "right";
            const speed = parseInt(model.get("speed"), 10) || 100;
            // Initialize or update the React root
            if (!this.root) {
              this.root = ReactDOM.createRoot(el);
            }
            model.set("imageList", imagesArray);
            model.set("speed", speed);
            this.root.render(
              <InfiniteSlides
                speed={speed}
                images={imagesArray}
                direction={direction ? "right" : "left"}
              />,
            );
          },

          // This initializes the view and sets up event listeners
          initialize(...args: any[]) {
            defaultView.prototype.initialize.apply(this, ...args);

            // Listen to changes in specific traits (autoplay, interval)
            this.listenTo(
              this.model,
              "change:speed change:direction change:images",
              this.renderReactSlider,
            );

            // Listen to changes in the components collection (children added/removed)
            // 'add', 'remove', 'reset' are events on the components collection itself
            this.listenTo(
              this.model.get("components"),
              "add remove reset",
              this.renderReactSlider,
            );

            // Listen for general updates to any child component's content/style
            // This ensures if a child component's inner HTML changes (e.g., text content edited),
            // the carousel re-renders to reflect that.
            this.listenTo(
              this.model.get("components"),
              "change",
              this.renderReactSlider,
            );
            // Initial render of the React component
            this.renderReactSlider();
          },

          // onRender is called frequently (e.g., when component is selected)
          // We moved the actual rendering and listener setup to initialize()
          // and renderReactCarousel(). So, onRender doesn't need to do much.
          onRender() {
            return this;
          },

          // Cleanup: unmount React component and remove listeners
          onRemove(...args: any[]) {
            if (this.root) {
              this.root.unmount(); // Unmount React component from the DOM
              this.root = null;
            }
            this.stopListening(); // Removes all listeners attached with this.listenTo
            defaultView.prototype.onRemove.apply(this, ...args); // Call super's onRemove
          },
        }),
      });

      // register custom carousel
      editor.DomComponents.addType("carousel-react", {
        model: {
          defaults: {
            tagName: "div",
            draggable: true,
            droppable: true,
            resizeable: true,
            stylable: true,
            attributes: {
              "data-gjs-type": "carousel-react", // Custom type attribute for GrapesJS
            },
            traits: [
              {
                type: "checkbox",
                label: "Auto",
                name: "autoplay",
                valueTrue: "true",
                valueFalse: "false",
                changeProp: true,
              },
              {
                type: "checkbox",
                label: "Show Indicator",
                name: "showIndicators",
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
                label: "Animation Type",
                name: "animationType",
                options: [
                  { id: "slide", label: "Slide" },
                  { id: "flip", label: "Flip" },
                  { id: "pan", label: "Pan" },
                  { id: "coverflow", label: "coverflow" },
                  { id: "none", label: "None" },
                ],
                changeProp: true,
              },
              {
                type: "number",
                label: "Interval (ms)",
                name: "interval",
                placeholder: "3000",
                changeProp: true,
              },
            ],
            autoplay: "false",
            showNavigation: "always",
            showIndicator: "true",
            zoomOnHover: "false",
            pauseOnHover: "false",
            animationType: "none",
            interval: "3000",
            components: [
              {
                type: "text",
                components: [{ type: "textnode", content: "slide1" }],
                style: {
                  padding: "20px",
                  background: "#f8f8f8",
                  minHeight: "200px",
                },
              },
              {
                type: "text",
                components: [{ type: "textnode", content: "slide3" }],
                style: {
                  padding: "20px",
                  background: "#f8f8f8",
                  minHeight: "200px",
                },
              },
            ],
          },
        },
        view: defaultView.extend({
          tagName: "div",
          className: "gjs-carousel-react-wrapper", // Class for the GrapesJS wrapper element
          root: null, // To store the React root for React 18+

          // Method to render/re-render the React component
          // Using useCallback to memoize to prevent unnecessary re-creations
          renderReactCarousel() {
            // Use `function` to ensure `this` context
            const el = this.el; // The DOM element managed by GrapesJS for this component
            const model = this.model;
            Array.from(el.childNodes).forEach((child) => {
              if ((child as { id: string }).id !== "unique") {
                el.removeChild(child);
              }
            });
            const autoplay = model.get("autoplay") === "true";
            const showIndicators = model.get("showIndicators") === "true";
            const showNavigation = model.get("showNavigation");
            const zoomOnHover = model.get("zoomOnHover") === "true";
            const pauseOnHover = model.get("pauseOnHover") === "true";
            const animationType = model.get("animationType");
            const interval = parseInt(model.get("interval"), 10) || 3000;

            // Map each GrapesJS component (slide) to a React element
            const childrenReactElements =
              model?.get("components")?.map((comp: any, index: any) => {
                const componentHtml = comp.toHTML(); // Get the HTML of the GrapesJS component
                // Wrap the HTML in a React element using dangerouslySetInnerHTML
                return React.createElement("div", {
                  key: comp.cid || `gjs-carousel-slide-${index}`, // Unique key for React list rendering
                  // You can pass GrapesJS classes if needed
                  "data-gjs-type": comp.get("type"), // Useful for debugging
                  dangerouslySetInnerHTML: { __html: componentHtml },
                });
              }) || [];

            // Initialize or update the React root
            if (!this.root) {
              this.root = ReactDOM.createRoot(el);
            }
            this.root.render(
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
          },

          // This initializes the view and sets up event listeners
          initialize(...args: any[]) {
            defaultView.prototype.initialize.apply(this, ...args);

            // Listen to changes in specific traits (autoplay, interval)
            this.listenTo(
              this.model,
              "change:autoplay change:interval change:animationType change:showNavigation change:zoomOnHover change:showIndicators",
              this.renderReactCarousel,
            );

            // Listen to changes in the components collection (children added/removed)
            // 'add', 'remove', 'reset' are events on the components collection itself
            this.listenTo(
              this.model.get("components"),
              "add remove reset",
              this.renderReactCarousel,
            );

            // Listen for general updates to any child component's content/style
            // This ensures if a child component's inner HTML changes (e.g., text content edited),
            // the carousel re-renders to reflect that.
            this.listenTo(
              this.model.get("components"),
              "change",
              this.renderReactCarousel,
            );

            // Initial render of the React component
            this.renderReactCarousel();
          },

          // onRender is called frequently (e.g., when component is selected)
          // We moved the actual rendering and listener setup to initialize()
          // and renderReactCarousel(). So, onRender doesn't need to do much.
          onRender() {
            return this;
          },

          // Cleanup: unmount React component and remove listeners
          onRemove(...args: any[]) {
            if (this.root) {
              this.root.unmount(); // Unmount React component from the DOM
              this.root = null;
            }
            this.stopListening(); // Removes all listeners attached with this.listenTo
            defaultView.prototype.onRemove.apply(this, ...args); // Call super's onRemove
          },
        }),
      });

      editor.BlockManager.add("carousel-react-block", {
        label: "Carousel",
        category: "Custom",
        media: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gallery-horizontal-end-icon lucide-gallery-horizontal-end"><path d="M2 7v10"/><path d="M6 5v14"/><rect width="12" height="18" x="10" y="3" rx="2"/></svg>
          `,
        content: {
          type: "carousel-react",
        },
      });

      editor.BlockManager.add("infinite-slides", {
        label: "Infinite Image Slides",
        category: "Custom",
        media: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gallery-horizontal-end-icon lucide-gallery-horizontal-end"><path d="M2 7v10"/><path d="M6 5v14"/><rect width="12" height="18" x="10" y="3" rx="2"/></svg>
          `,
        content: {
          type: "infinite-slides",
        },
      });

      const handleUpdate = () => {
        const json = editor.getProjectData();
        if (onContentChange) {
          onContentChange(json);
        }
      };

      if (content) {
        editor.loadProjectData(content);
        if (isPreview) {
          // ONLY for preview mode
          const html = editor.getHtml();
          const css = editor.getCss();
          setRenderedHtml(html);
          setRenderedCss(css || "");
          editor.destroy(); // Destroy the editor instance after extracting
          editorRef.current = null; // Clear the ref
        }
      }

      editor.on("update", handleUpdate);

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
    };

    loadPlugins();
  }, [content, isPreview, onContentChange]);

  function findComponentById(components: any, targetId: string) {
    for (const comp of components) {
      // Some components may nest under `component.components`
      const current = comp.component || comp;

      // Check current component's attributes
      if (current.attributes?.id === targetId) {
        return current;
      }

      // Recurse into children
      const children = current.components || [];
      const result: any = findComponentById(children, targetId);
      if (result) return result;
    }

    return null;
  }

  const renderSlider = () => {
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
      const images = component?.images || component?.imageList;
      const direction = component?.direction === "right";
      const speed = component?.speed;

      const root = ReactDOM.createRoot(slider);
      root.render(
        <InfiniteSlides
          speed={speed || 100}
          images={images}
          direction={direction ? "right" : "left"}
        />,
      );
    });
  };

  function componentToHTML(component: any): string {
    // Handle text node directly
    if (component.type === "textnode") {
      return component.content || "";
    }
    const style = content?.styles?.find((style: any) =>
      style.selectors.includes(`#${component?.attributes?.id}`),
    );
    let attrs = component.attributes
      ? Object.entries(component.attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ")
      : "";

    const classes = component?.classes
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
      .map((child: any) => componentToHTML(child))
      .join("");

    const styleObj = style?.style || {};
    const styleString = Object.entries(styleObj)
      .map(([k, v]) => `${k}:${v}`)
      .join(";");

    return `<${component.type || "div"} ${attrs} style="${styleString || ""}" class="${classes || ""}">${inner}</${component.type || "div"}>`;
  }

  const renderCarousel = () => {
    const carousels = document?.querySelectorAll(
      '[data-gjs-type="carousel-react"]',
    );
    // find model inside content
    carousels.forEach((carousel) => {
      const id = carousel.id;
      const component = findComponentById(content?.pages[0].frames, id);

      const autoplay = component?.autoplay === "true";
      const showIndicators = component?.showIndicators === "true";
      const showNavigation = component?.showNavigation || "always";
      const zoomOnHover = component?.zoomOnHover === "true";
      const pauseOnHover = component?.pauseOnHover === "true";
      const animationType = component?.animationType;
      const interval = parseInt(component?.interval, 10) || 3000;

      // Map each GrapesJS component (slide) to a React element
      const childrenReactElements =
        component?.components?.map((comp: any, index: any) => {
          const componentHtml = componentToHTML(comp); // Get the HTML of the GrapesJS component
          // Wrap the HTML in a React element using dangerouslySetInnerHTML
          return React.createElement("div", {
            key: comp.cid || `gjs-carousel-slide-${index}`, // Unique key for React list rendering
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
  };

  const renderCountUp = () => {
    const counts = document?.querySelectorAll('[data-gjs-type="count-up"]');
    // find model inside content
    counts.forEach((count) => {
      const id = count.id;
      const component = findComponentById(content?.pages[0].frames, id);
      const duration =
        component?.duration || component?.attributes?.duration || 2000;
      const endValue =
        component?.endValue || component?.attributes?.duration || 2000;
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
  };

  const renderPageList = () => {
    const containers = document?.querySelectorAll(
      '[data-gjs-type="page-list"]',
    );
    if (!containers) return;
    containers.forEach((container) => {
      const id = container.id;
      const component = findComponentById(content?.pages[0].frames, id);
      const pageContainer = container.querySelector(".page-list-container");
      const paginationContainer = container.querySelector(".page-pagination");
      const searchInput = container.querySelector(
        ".page-search",
      ) as HTMLInputElement;
      let currentPage = 1;
      let totalPages = 1;
      const tags = component.tags;
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
        searchInput.addEventListener("input", (e: any) => {
          searchQuery = e.target?.value;
          currentPage = 1;
          renderPages();
        });
      }

      renderPages();
    });
  };

  const renderLinkList = () => {
    const containers = document?.querySelectorAll(
      '[data-gjs-type="link-list"]',
    );
    if (!containers) return;
    containers.forEach((children) => {
      const id = children.id;
      const component = findComponentById(content?.pages[0].frames, id);
      const container = children.querySelector(".link-list-container");
      if (!container) return;
      const paginationContainer = children.querySelector(".link-pagination");
      const searchInput = children.querySelector(
        ".link-search",
      ) as HTMLInputElement;
      const dynamicFilters = children.querySelector(".link-dynamic-filters");
      let currentPage = 1;
      let totalPages = 1;
      let searchQuery = "";
      const dynamicAttributes: Record<string, string> = {};

      const showSearch = component.attributes["data-show-search"] === "true";
      const showPagination =
        component.attributes["data-show-pagination"] === "true";
      const tags = component.attributes["data-tags"];
      const filterAttrs = component.attributes["data-filter-attributes"] || "";
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
          input.addEventListener("input", (e: any) => {
            dynamicAttributes[key] = e.target.value;
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
        searchInput.addEventListener("input", (e: any) => {
          searchQuery = e.target?.value;
          currentPage = 1;
          renderLinks();
        });
      }

      renderDynamicInputs();
      renderLinks();
    });
  };

  const renderTabs = () => {
    const tabComponents = document?.querySelectorAll(
      '[data-gjs-type="custom-tabs"]',
    );
    // find model inside content
    if (!tabComponents) return;
    tabComponents.forEach((tab) => {
      const id = tab.id;
      const component = findComponentById(content?.pages[0].frames, id);
      const raw =
        component.tabs ||
        JSON.stringify([{ label: "Tab 1" }, { label: "Tab 2" }]);
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
      const panels = component.components[1];
      const tabPanels = tabs
        .map(
          (tab, idx) => `
                <div class="tab-panel ${idx === 0 ? "" : "hidden"}" data-gjs-slot="tab-${idx}">
                  ${
                    componentToHTML(
                      panels.components.find((c: any) => {
                        return c.slot === `tab-${idx}`;
                      }),
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
  };

  const renderNavbar = () => {
    const navbars = document.querySelectorAll(
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

      const searchInputs = navbar.querySelectorAll(
        'input[placeholder="Search"]',
      );

      const debounce = (fn: (...args: any[]) => void, delay: number) => {
        let timeout: any;
        return (...args: any[]) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => fn(...args), delay);
        };
      };

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
          debounce((e: any) => {
            const query = e.target.value.trim();
            resultsContainer.classList.remove("hidden");
            fetchResults(query, resultsContainer);
          }, 300),
        );

        // Hide results on outside click
        document.addEventListener("click", (e: any) => {
          if (!wrapper.contains(e.target)) {
            resultsContainer.classList.add("hidden");
          }
        });
      });
    });
  };

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
  }, [renderedHtml, content]);

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
