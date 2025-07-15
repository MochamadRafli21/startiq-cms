import { ProjectData } from "grapesjs";
import { findComponentById } from "../tools";
import type { PageFullRecord } from "@/types/page.type";

export const renderPageList = (content: ProjectData) => {
  const containers = document?.querySelectorAll('[data-gjs-type="page-list"]');

  if (!containers) return;
  containers.forEach((container) => {
    const id = container.id;
    const component = findComponentById(content?.pages[0].frames, id);
    if (!component) return;
    const urlParams = new URLSearchParams(window.location.search);
    let currentPage = parseInt(urlParams.get("page") || "1", 10);
    let searchQuery = urlParams.get("search") || "";
    const categoryQuery = urlParams.get("category") || "";
    let totalPages = 1;

    const pageContainer = container.querySelector(".page-list-container");
    const paginationContainer = container.querySelector(".page-pagination");
    const searchInput = container.querySelector(
      ".page-search",
    ) as HTMLInputElement;
    const tags = component.tags as string;
    const showSearch = component.showSearch;
    const showPagination = component.showPagination;
    const layout = component.layout;

    if (!showSearch && searchInput) {
      searchInput.style.display = "none";
    } else if (searchInput) {
      searchInput.style.display = "block";
    }

    if (searchInput && searchQuery) {
      searchInput.value = searchQuery;
    }

    const renderPages = () => {
      if (!pageContainer) return;
      pageContainer.innerHTML =
        '<p class="col-span-full text-center text-gray-500">Loading pages...</p>';

      const query = new URLSearchParams({
        page: currentPage.toString(),
        limit: layout === "grid" ? "6" : "4",
      });

      if (showSearch && searchQuery) {
        query.set("search", searchQuery);
      }

      if (tags) {
        query.set("tags", tags);
      }

      if (categoryQuery) {
        query.set("category", categoryQuery);
      }

      fetch(`/api/public?${query.toString()}`)
        .then((res) => res.json())
        .then((body: { pages: PageFullRecord[]; total: number }) => {
          if (!pageContainer) return;
          pageContainer.innerHTML = "";
          if (!Array.isArray(body?.pages) || body.total === 0) {
            pageContainer.innerHTML =
              '<p class="col-span-full text-center text-gray-400 italic">No pages found.</p>';
            return;
          }

          totalPages = Math.ceil(body.total / 5);

          const pages = body.pages;
          if (layout === "list") {
            pages.forEach((page: PageFullRecord) => {
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
                "text-sm text-gray-600 line-clamp-4 grow text-sm text-ellipsis";
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
                img.className = "w-full h-24 object-cover rounded-md mb-4";
                card.appendChild(img);
              }

              pageContainer.appendChild(card);
            });
          } else if (layout === "grid") {
            pages.forEach((page: PageFullRecord) => {
              const card = document.createElement("div");
              card.className = "bg-white rounded-lg shadow-md p-4";

              if (page.metaImage) {
                const img = document.createElement("img");
                img.src = page.metaImage;
                img.alt = page.metaTitle || page.title || "";
                img.className = "w-full h-24 object-cover rounded-md mb-4";
                card.appendChild(img);
              }

              const title = document.createElement("h3");
              title.textContent = page.metaTitle || page.title || "";
              title.className = "text-lg font-semibold mb-2";
              card.appendChild(title);

              const excerpt = document.createElement("p");
              excerpt.textContent = page.metaDescription || "";
              excerpt.className =
                "text-sm text-gray-600 line-clamp-4 grow text-sm text-ellipsis";
              card.appendChild(excerpt);

              if (page.slug) {
                const btn = document.createElement("a");
                btn.href = `/${page.slug}`;
                btn.textContent = "Read More";
                btn.className =
                  "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1";
                card.appendChild(btn);
              }

              pageContainer.appendChild(card);
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
              img.className = "w-full h-48 object-cover rounded-md mb-4";
              firstCard.appendChild(img);
            }
            const title = document.createElement("h3");
            title.textContent = firstPage.metaTitle || firstPage.title || "";
            title.className = "text-lg font-semibold mb-2";
            firstCard.appendChild(title);

            const excerpt = document.createElement("p");
            excerpt.textContent = firstPage.metaDescription || "";
            excerpt.className = "text-sm text-gray-600 grow text-ellipsis";
            firstCard.appendChild(excerpt);

            if (firstPage.slug) {
              const btn = document.createElement("a");
              btn.href = `/${firstPage.slug}`;
              btn.textContent = "Read More";
              btn.className =
                "mt-2 inline-block text-sm font-semibold hover:underline font-medium rounded-full bg-yellow-400 px-2 py-1 w-fit";
              firstCard.appendChild(btn);
            }

            pageContainer.appendChild(firstCard);

            if (pages.length > 1) {
              const secondCard = document.createElement("div");
              secondCard.className = "lg:col-span-1";

              pages.slice(1).forEach((page: PageFullRecord) => {
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
                excerpt.className =
                  "text-sm text-gray-600 line-clamp-4 grow text-sm text-ellipsis";
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
          }

          // Only render pagination if enabled
          if (paginationContainer) {
            paginationContainer.innerHTML = "";
            if (showPagination && totalPages > 1) {
              // Previous button
              if (currentPage > 1) {
                const prevBtn = document.createElement("button");
                prevBtn.textContent = (currentPage - 1).toString();
                prevBtn.className = "px-3 py-1 border rounded bg-white";
                prevBtn.addEventListener("click", () => {
                  currentPage = currentPage - 1;
                  renderPages();
                });
                paginationContainer.appendChild(prevBtn);
              }

              // Current page button
              const currentBtn = document.createElement("button");
              currentBtn.textContent = currentPage.toString();
              currentBtn.className = "px-3 py-1 border rounded bg-yellow-400";
              currentBtn.disabled = true; // Optional: disable current page button
              paginationContainer.appendChild(currentBtn);

              // Next button
              if (currentPage < totalPages) {
                const nextBtn = document.createElement("button");
                nextBtn.textContent = (currentPage + 1).toString();
                nextBtn.className = "px-3 py-1 border rounded bg-white";
                nextBtn.addEventListener("click", () => {
                  currentPage = currentPage + 1;
                  renderPages();
                });
                paginationContainer.appendChild(nextBtn);
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
};
