import { Editor } from "grapesjs";
import { ChangeEvent } from "react";

export function registerFaqComponent(editor: Editor) {
  editor.DomComponents.addType("faq-item", {
    model: {
      defaults: {
        tagName: "div",
        classes: ["faq-item", "border-b", "py-2"],
        draggable: ".faq-list",
        traits: [
          {
            type: "text",
            name: "question",
            label: "Question",
            changeProp: true,
          },
          {
            type: "textarea",
            name: "answer",
            label: "Answer",
            changeProp: true,
          },
        ],
        question: "Sample Question?",
        answer: "Sample answer content goes here.",
        components: [
          {
            tagName: "h3",
            classes: ["faq-question", "font-medium", "cursor-pointer"],
            content: "Sample Question?",
          },
          {
            tagName: "div",
            classes: ["faq-answer", "mt-1", "text-sm", "text-gray-600"],
            content: "Sample answer content goes here.",
          },
        ],
      },
      init() {
        this.on("change:question change:answer", () => {
          const question = this.get("question");
          const answer = this.get("answer");
          this.components().at(0)?.set("content", question);
          this.components().at(1)?.set("content", answer);
        });
      },
    },
  });

  // Register FAQ container
  editor.DomComponents.addType("faq-list", {
    model: {
      defaults: {
        tagName: "section",
        classes: ["faq-list", "max-w-3xl", "mx-auto", "py-10", "px-4"],
        attributes: {
          "data-title": "Frequently Asked Questions",
          "data-gjs-type": "faq-list", // Custom type attribute for GrapesJS
          "data-enable-search": "false",
        },
        traits: [
          {
            type: "text",
            label: "Title",
            name: "title",
            changeProp: true,
          },
          {
            type: "checkbox",
            label: "Enable Search",
            name: "enableSearch",
            changeProp: true,
          },
        ],
        title: "Frequently Asked Questions",
        enableSearch: "false",
        components: [
          {
            tagName: "h2",
            classes: ["faq-title", "text-2xl", "font-bold", "mb-4"],
            content: "Frequently Asked Questions",
          },
          {
            tagName: "input",
            classes: [
              "faq-search",
              "border",
              "px-3",
              "py-1",
              "rounded",
              "mb-4",
              "w-full",
            ],
            attributes: {
              type: "text",
              placeholder: "Search FAQ...",
            },
          },
          {
            type: "faq-item",
          },
        ],
        script: function () {
          const titleEl = this.querySelector(".faq-title");
          const searchEl = this.querySelector(".faq-search");
          const items = [...this.querySelectorAll(".faq-item")];
          const enableSearch =
            this.getAttribute("data-enable-search") === "true";

          titleEl.textContent = this.getAttribute("data-title") || "FAQs";

          if (!enableSearch && searchEl) {
            searchEl.style.display = "none";
          }

          if (searchEl) {
            searchEl.addEventListener(
              "input",
              (e: ChangeEvent<HTMLInputElement>) => {
                const q = e.target.value.toLowerCase();
                items.forEach((item) => {
                  const match = item.innerText.toLowerCase().includes(q);
                  item.style.display = match ? "" : "none";
                });
              },
            );
          }

          items.forEach((item) => {
            const q = item.querySelector(".faq-question");
            const a = item.querySelector(".faq-answer");

            if (q && a) {
              q.addEventListener("click", () => {
                const isOpen = a.style.display === "block";
                a.style.display = isOpen ? "none" : "block";
              });
              a.style.display = "none";
            }
          });
        },
      },
      init() {
        const rerunScript = () => {
          if (
            this.attributes.script &&
            typeof this.attributes.script === "function" &&
            this.view?.el
          ) {
            this.attributes.script.call(this.view.el);
          }
        };

        this.on("change:title change:enableSearch", () => {
          this.addAttributes({
            "data-title": this.get("title"),
            "data-enable-search": `${this.get("enableSearch")}`,
          });
          rerunScript();
        });

        this.on("components:add", rerunScript);
        this.on("components:remove", rerunScript);
      },
    },
  });

  // Add block for FAQ list
  editor.BlockManager.add("faq-list", {
    label: "FAQ List",
    category: "Custom",
    content: {
      type: "faq-list",
    },
  });

  // Add block for individual FAQ item (for adding inside the FAQ list)
  editor.BlockManager.add("faq-item", {
    label: "FAQ Item",
    category: "Custom",
    content: {
      type: "faq-item",
    },
  });
}
