import { ProjectData } from "grapesjs";
import { findComponentById } from "../tools";
import type { Link } from "@/types/link.type";

export const renderLinkList = (content: ProjectData) => {
  const containers = document?.querySelectorAll('[data-gjs-type="link-list"]');
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
    const tags = component.attributes ? component.attributes["data-tags"] : "";
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
};
