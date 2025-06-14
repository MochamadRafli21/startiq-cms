import { Editor, Component } from "grapesjs";

export function registerTabs(editor: Editor) {
  // register custom tabs
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
}
