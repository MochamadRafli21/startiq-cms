import { Editor } from "grapesjs";
import { ChangeEvent } from "react";
import type { Page } from "@/types/page.type";

export function registerPageList(editor: Editor) {
  editor.DomComponents.addType("page-list", {
    model: {
      defaults: {
        attributes: {
          class: "page-list",
          "data-gjs-type": "page-list",
          "data-show-search": false,
          "data-show-pagination": false,
          "data-layout": "news",
          "data-tags": "",
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
        ],
        layout: "news",
        showSearch: "false",
        showPagination: "false",
        tags: "",
        script: function () {
          const container = this.querySelector(".page-list-container");
          const paginationContainer = this.querySelector(".page-pagination");
          const searchInput = this.querySelector(".page-search");
          let currentPage = 1;
          let totalPages = 1;
          let searchQuery = "";
          const showSearch = this.getAttribute("data-show-search") === "true";
          const showPagination =
            this.getAttribute("data-show-pagination") === "true";
          const tags = this.getAttribute("data-tags");
          const layout = this.getAttribute("data-layout");

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
              limit: layout === "grid" ? "6" : "3",
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
                if (layout === "list") {
                  pages.forEach((page: Page) => {
                    const card = document.createElement("div");
                    card.className =
                      "bg-white md:col-span-full rounded-lg shadow-md p-4 flex items-start justify-between my-4";

                    const textSection = document.createElement("div");

                    const title = document.createElement("h3");
                    title.textContent = page.metaTitle || page.title || "";
                    title.className = "text-lg font-semibold mb-2";
                    textSection.appendChild(title);

                    const excerpt = document.createElement("p");
                    excerpt.textContent = page.metaDescription || "";
                    excerpt.className =
                      "text-sm text-gray-600 line-clamp-4 text-sm text-ellipsis";
                    textSection.appendChild(excerpt);

                    if (page.slug) {
                      const btn = document.createElement("a");
                      btn.href = `/${page.slug}`;
                      btn.textContent = "Read More";
                      btn.className =
                        "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
                      textSection.appendChild(btn);
                    }

                    card.appendChild(textSection);

                    if (page.metaImage) {
                      const img = document.createElement("img");
                      img.src = page.metaImage;
                      img.alt = page.metaTitle || page.title || "";
                      img.className =
                        "w-full h-48 object-cover rounded-md mb-4";
                      card.appendChild(img);
                    }

                    container.appendChild(card);
                  });
                } else if (layout === "grid") {
                  pages.forEach((page: Page) => {
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
                    excerpt.className =
                      "text-sm text-gray-600 line-clamp-4 text-sm text-ellipsis";
                    card.appendChild(excerpt);

                    if (page.slug) {
                      const btn = document.createElement("a");
                      btn.href = `/${page.slug}`;
                      btn.textContent = "Read More";
                      btn.className =
                        "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
                      card.appendChild(btn);
                    }

                    container.appendChild(card);
                  });
                } else {
                  const firstPage = pages[0];

                  const firstCard = document.createElement("div");
                  firstCard.className =
                    "md:col-span-2 bg-white rounded-lg shadow-md p-4 h-full flex flex-col flex-grow";
                  if (firstPage.metaImage) {
                    const img = document.createElement("img");
                    img.src = firstPage.metaImage;
                    img.alt = firstPage.metaTitle || firstPage.title || "";
                    img.className = "w-full h-64 object-cover rounded-md mb-4";
                    firstCard.appendChild(img);
                  }
                  const title = document.createElement("h3");
                  title.textContent =
                    firstPage.metaTitle || firstPage.title || "";
                  title.className = "text-lg font-semibold mb-2";
                  firstCard.appendChild(title);

                  const excerpt = document.createElement("p");
                  excerpt.textContent = firstPage.metaDescription || "";
                  excerpt.className =
                    "text-sm text-gray-600 flex-grow text-ellipsis";
                  firstCard.appendChild(excerpt);

                  if (firstPage.slug) {
                    const btn = document.createElement("a");
                    btn.href = `/${firstPage.slug}`;
                    btn.textContent = "Read More";
                    btn.className =
                      "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1 w-fit";
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
                      excerpt.className =
                        "text-sm text-gray-600 line-clamp-4 text-sm text-ellipsis";
                      card.appendChild(excerpt);

                      if (page.slug) {
                        const btn = document.createElement("a");
                        btn.href = `/${page.slug}`;
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
        this.on(
          "change:showSearch change:showPagination change:tags change:layout",
          () => {
            const showSearch = this.get("showSearch");
            const showPagination = this.get("showPagination");
            const tags = this.get("tags");
            const layout = this.get("layout");
            this.addAttributes({
              "data-show-search": `${showSearch}`,
              "data-show-pagination": `${showPagination}`,
              "data-layout": `${layout}`,
              "data-tags": `${tags}`,
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
  editor.BlockManager.add("page-list", {
    label: "Page List",
    category: "Custom",
    content: `
          <section data-gjs-type="page-list" class="w-full max-w-6xl mx-auto py-10 px-4 min-h-44">
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
}
