import { Editor } from "grapesjs";
import { ChangeEvent } from "react";
import type { Content } from "@/types/content.type";

export function registerContentList(editor: Editor) {
  // register custom content list
  editor.DomComponents.addType("content-list", {
    model: {
      defaults: {
        attributes: {
          class: "content-list",
          "data-gjs-type": "content-list",
          "data-show-search": false,
          "data-show-pagination": false,
          "data-tags": "",
          "data-filter-attributes": "",
          "data-layout": "news",
        },
        traits: [
          {
            type: "select",
            label: "Layout",
            name: "layout",
            options: [
              { id: "news", label: "News" },
              { id: "list", label: "List" },
              { id: "grid", label: "grid" },
            ],
            changeProp: true,
          },
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
          const container = this.querySelector(".content-list-container");
          const paginationContainer = this.querySelector(".content-pagination");
          const searchInput = this.querySelector(".content-search");
          const dynamicFilters = this.querySelector(".content-dynamic-filters");

          let currentPage = 1;
          let totalPages = 1;
          let searchQuery = "";
          const dynamicAttributes: Record<string, string> = {};

          const showSearch = this.getAttribute("data-show-search") === "true";
          const showPagination =
            this.getAttribute("data-show-pagination") === "true";
          const tags = this.getAttribute("data-tags");
          const layout = this.getAttribute("data-layout");
          const filterAttrs = this.getAttribute("data-filter-attributes") || "";
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
              label.className = "block text-sm font-medium text-gray-700 mb-1";
              label.textContent = `Filter by ${key}`;
              wrapper.appendChild(label);

              const input = document.createElement("input");
              input.type = "text";
              input.className =
                "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm";
              input.placeholder = `Enter ${key}`;
              input.addEventListener("input", (e) => {
                dynamicAttributes[key] = (e.target as HTMLInputElement)?.value;
                currentPage = 1;
                renderContents();
              });

              wrapper.appendChild(input);
              dynamicFilters.appendChild(wrapper);
            });
          };

          const renderContents = () => {
            container.innerHTML =
              '<p class="col-span-full text-center text-gray-500">Loading data...</p>';

            const query = new URLSearchParams({
              page: currentPage.toString(),
              limit: layout === "grid" ? "6" : "3",
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

            fetch(`/api/public/contents?${query.toString()}`)
              .then((res) => res.json())
              .then((body: { contents: Content[]; total: number }) => {
                container.innerHTML = "";
                if (!Array.isArray(body?.contents) || body.total === 0) {
                  container.innerHTML =
                    '<p class="col-span-full text-center text-gray-400 italic">No data found.</p>';
                  return;
                }

                totalPages = Math.ceil(body.total / 5);

                const contents = body.contents;
                if (layout === "list") {
                  contents.forEach((link: Content) => {
                    const card = document.createElement("div");
                    card.className =
                      "bg-white md:col-span-full rounded-lg shadow-md p-4 flex items-start justify-between my-4";

                    const textSection = document.createElement("div");

                    const title = document.createElement("h3");
                    title.textContent = link.title || "";
                    title.className = "text-lg font-semibold mb-2";
                    textSection.appendChild(title);

                    const excerpt = document.createElement("p");
                    excerpt.textContent = link.descriptions || "";
                    excerpt.className =
                      "text-sm text-gray-600 line-clamp-4 grow text-sm text-ellipsis";
                    textSection.appendChild(excerpt);

                    if (link.target) {
                      const btn = document.createElement("a");
                      btn.href =
                        link.type === "page"
                          ? `/${link.target}`
                          : `${link.target}`;
                      btn.textContent = "Read More";
                      btn.className =
                        "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
                      textSection.appendChild(btn);
                    }

                    card.appendChild(textSection);

                    if (link.banner) {
                      const img = document.createElement("img");
                      img.src = link.banner;
                      img.alt = link.title || "";
                      img.className =
                        "w-full h-48 object-cover rounded-md mb-4";
                      card.appendChild(img);
                    }

                    container.appendChild(card);
                  });
                } else if (layout === "grid") {
                  contents.forEach((link: Content) => {
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
                    excerpt.className =
                      "text-sm text-gray-600 line-clamp-4 grow text-sm text-ellipsis";
                    card.appendChild(excerpt);

                    if (link.target) {
                      const btn = document.createElement("a");
                      btn.href = `${link.target}`;
                      btn.textContent = "Read More";
                      btn.className =
                        "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
                      card.appendChild(btn);
                    }

                    container.appendChild(card);
                  });
                } else {
                  const firstLink = contents[0];

                  const firstCard = document.createElement("div");
                  firstCard.className =
                    "md:col-span-2 bg-white rounded-lg shadow-md p-4 h-full flex flex-col grow";
                  if (firstLink.banner) {
                    const img = document.createElement("img");
                    img.src = firstLink.banner;
                    img.alt = firstLink.title || "";
                    img.className = "w-full h-64 object-cover rounded-md mb-4";
                    firstCard.appendChild(img);
                  }
                  const title = document.createElement("h3");
                  title.textContent = firstLink.title || "";
                  title.className = "text-lg font-semibold mb-2";
                  firstCard.appendChild(title);

                  const excerpt = document.createElement("p");
                  excerpt.textContent = firstLink.descriptions || "";
                  excerpt.className =
                    "text-sm text-gray-600 grow text-ellipsis";
                  firstCard.appendChild(excerpt);

                  if (firstLink.target) {
                    const btn = document.createElement("a");
                    btn.href = `${firstLink.target}`;
                    btn.textContent = "Read More";
                    btn.className =
                      "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1 w-fit";
                    firstCard.appendChild(btn);
                  }

                  container.appendChild(firstCard);

                  if (contents.length > 1) {
                    const secondCard = document.createElement("div");
                    secondCard.className = "lg:col-span-1";

                    contents.slice(1).forEach((link: Content) => {
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
                      excerpt.className =
                        "text-sm text-gray-600 grow line-clamp-4 text-sm text-ellipsis";
                      card.appendChild(excerpt);

                      if (link.target) {
                        const btn = document.createElement("a");
                        btn.href = `${link.target}`;
                        btn.textContent = "Read More";
                        btn.className =
                          "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1 w-fit";
                        card.appendChild(btn);
                      }

                      secondCard.appendChild(card);
                    });

                    container.appendChild(secondCard);
                  }
                }

                // Only render pagination if enabled
                paginationContainer.innerHTML = "";
                if (showPagination && totalPages > 1) {
                  // Previous button
                  if (currentPage > 1) {
                    const prevBtn = document.createElement("button");
                    prevBtn.textContent = (currentPage - 1).toString();
                    prevBtn.className = "px-3 py-1 border rounded bg-white";
                    prevBtn.addEventListener("click", () => {
                      currentPage = currentPage - 1;
                      renderContents();
                    });
                    paginationContainer.appendChild(prevBtn);
                  }

                  // Current page button
                  const currentBtn = document.createElement("button");
                  currentBtn.textContent = currentPage.toString();
                  currentBtn.className =
                    "px-3 py-1 border rounded bg-yellow-400";
                  currentBtn.disabled = true; // Optional: disable current page button
                  paginationContainer.appendChild(currentBtn);

                  // Next button
                  if (currentPage < totalPages) {
                    const nextBtn = document.createElement("button");
                    nextBtn.textContent = (currentPage + 1).toString();
                    nextBtn.className = "px-3 py-1 border rounded bg-white";
                    nextBtn.addEventListener("click", () => {
                      currentPage = currentPage + 1;
                      renderContents();
                    });
                    paginationContainer.appendChild(nextBtn);
                  }
                }
              })
              .catch((err) => {
                container.innerHTML =
                  '<p class="col-span-full text-center text-red-500">Failed to load data.</p>';
                console.error(err);
              });
          };

          if (showSearch && searchInput) {
            searchInput.addEventListener(
              "input",
              (e: ChangeEvent<HTMLInputElement>) => {
                searchQuery = e.target?.value;
                currentPage = 1;
                renderContents();
              },
            );
          }

          renderDynamicInputs();
          renderContents();
        },
      },
      init() {
        this.on(
          "change:showSearch change:showPagination, change:tags, change:filterAttributes, change:layout",
          () => {
            const showSearch = this.get("showSearch");
            const showPagination = this.get("showPagination");
            const tags = this.get("tags");
            const filterAttributes = this.get("filterAttributes");
            const layout = this.get("layout");
            this.addAttributes({
              "data-show-search": `${showSearch}`,
              "data-show-pagination": `${showPagination}`,
              "data-tags": `${tags}`,
              "data-filter-attributes": filterAttributes,
              "data-layout": layout,
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
  editor.BlockManager.add("content-list", {
    label: "Content List",
    category: "Custom",
    content: `
          <section data-gjs-type="content-list" class="w-full max-w-6xl mx-auto py-10 px-4 min-h-44">
            <div class="mb-4 flex justify-between items-center">
              <input type="text" placeholder="Search content..." class="content-search border px-3 py-1 rounded w-full max-w-xs" />
            </div>
            <div class="mb-4 flex flex-col md:flex-row flex-wrap justify-between items-center content-dynamic-filters">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 content-list-container">
              <p class="col-span-full text-center text-gray-500">Loading Data...</p>
            </div>
            <div class="mt-6 flex justify-center gap-2 content-pagination">
              <!-- Pagination buttons injected by script -->
            </div>
          </section>
        `,
  });
}
