import type { Page } from "@/types/page.type";

export const renderNavbar = () => {
  const navbars = document?.querySelectorAll('[data-gjs-type="custom-navbar"]');
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
          const query = ((e as Event).target as HTMLInputElement)?.value.trim();
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
};
