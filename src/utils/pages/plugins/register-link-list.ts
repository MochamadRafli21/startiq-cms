import { Editor } from "grapesjs";
import { ChangeEvent } from "react";
import type { Link } from "@/types/link.type";

export function registerLinkList(editor: Editor) {
  // register custom link list
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
          const paginationContainer = this.querySelector(".link-pagination");
          const searchInput = this.querySelector(".link-search");
          const dynamicFilters = this.querySelector(".link-dynamic-filters");

          let currentPage = 1;
          let totalPages = 1;
          let searchQuery = "";
          const dynamicAttributes: Record<string, string> = {};

          const showSearch = this.getAttribute("data-show-search") === "true";
          const showPagination =
            this.getAttribute("data-show-pagination") === "true";
          const tags = this.getAttribute("data-tags");
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
}
