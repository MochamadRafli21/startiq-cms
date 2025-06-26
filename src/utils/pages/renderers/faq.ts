import { ProjectData } from "grapesjs";
import { findComponentById } from "../tools";

export const renderFaq = (content: ProjectData) => {
  const faqs = document?.querySelectorAll('[data-gjs-type="faq-list"]');
  faqs.forEach((faq) => {
    const titleEl = faq.querySelector(".faq-title");
    const searchEl = faq.querySelector(".faq-search") as HTMLInputElement;
    const items = [...faq.querySelectorAll(".faq-item")];

    const id = faq.id;
    const component = findComponentById(content?.pages[0].frames, id);

    const enableSearch =
      component?.enableSearch === "true" ||
      component?.attributes?.["data-enable-search"] === "true";
    const title =
      component?.title || component?.attributes?.["data-title"] || "FAQs";

    if (titleEl) {
      titleEl.textContent = title as string;
    }

    if (!enableSearch && searchEl) {
      searchEl.style.display = "none";
    }

    if (searchEl) {
      searchEl.addEventListener("input", (e: Event) => {
        const q = (e.target as HTMLInputElement).value.toLowerCase();
        items.forEach((item) => {
          const match = (item as HTMLElement).innerText
            .toLowerCase()
            .includes(q);
          (item as HTMLElement).style.display = match ? "" : "none";
        });
      });
    }

    // Render each faq-item's content
    items.forEach((item) => {
      const itemId = item.id;
      const itemComponent = findComponentById(
        component?.components || [],
        itemId,
      );

      const questionText =
        itemComponent?.question ||
        itemComponent?.components?.[0]?.content ||
        "Question?";
      const answerText =
        itemComponent?.answer ||
        itemComponent?.components?.[1]?.content ||
        "Answer";

      const q = item.querySelector(".faq-question") as HTMLElement;
      const a = item.querySelector(".faq-answer") as HTMLElement;

      if (q && a) {
        q.textContent = questionText as string;
        a.textContent = answerText as string;

        q.addEventListener("click", () => {
          const isOpen = a.style.display === "block";
          a.style.display = isOpen ? "none" : "block";
        });

        a.style.display = "none";
      }
    });
  });
};
