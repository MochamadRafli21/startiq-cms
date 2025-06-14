import type { GjsComponent } from "@/types/grapesjs-extra.type";
import { findComponentById, componentToHTML } from "../tools";
import { ProjectData } from "grapesjs";

export const renderTabs = (content: ProjectData) => {
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
                      content,
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
