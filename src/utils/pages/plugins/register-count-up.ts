import { Editor } from "grapesjs";
import { ScriptedElement } from "@/types/grapesjs-extra.type";
import { DefaultComponentViewType } from "@/types/grapesjs-extra.type";

export function registerCountUp(
  editor: Editor,
  defaultView: DefaultComponentViewType,
) {
  editor.Components.addType("count-up", {
    model: {
      defaults: {
        tagName: "div",
        droppable: false,
        endValue: 1000,
        duration: 2000,
        attributes: {
          class: "count-up",
          "data-gjs-type": "count-up", // Custom type attribute for GrapesJS
        },
        traits: [
          {
            type: "number",
            label: "End Value",
            name: "endValue",
            placeholder: "e.g. 1000",
            changeProp: true,
          },
          {
            type: "number",
            label: "Duration (ms)",
            name: "duration",
            placeholder: "e.g. 2000",
            changeProp: true,
          },
        ],
        script: function () {
          const endValue = parseInt(this?.getAttribute("endvalue") || "100");
          const duration = parseInt(this?.getAttribute("duration") || "2000");

          const animateCount = () => {
            const startTime = performance.now();

            const step = (timestamp: number) => {
              const progress = Math.min((timestamp - startTime) / duration, 1);
              const current = Math.floor(progress * endValue);
              this.innerHTML = current.toLocaleString();
              if (progress < 1) requestAnimationFrame(step);
            };

            requestAnimationFrame(step);
          };

          // Lazy animation on enter view
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries[0].isIntersecting) {
                animateCount();
                observer.disconnect();
              }
            },
            { threshold: 0.6 },
          );
          observer.observe(this as unknown as Element);
        },
      },

      init() {
        this.on("change:endValue change:duration", () => {
          const el = this.view?.el as ScriptedElement;
          if (el && typeof el.__grapesjs_script === "function") {
            el.__grapesjs_script.call(el);
          }
        });
      },
    },

    view: {
      renderCountUp() {
        const { el, model } = this;
        const endValue = parseInt(model?.get("endValue") || "100");
        const duration = parseInt(model?.get("duration") || "2000");

        const animateCount = () => {
          const startTime = performance.now();

          const step = (timestamp: number) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(progress * endValue);
            el.innerHTML = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
        };

        // Lazy animation on enter view
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              animateCount();
              observer.disconnect();
            }
          },
          { threshold: 0.6 },
        );
        observer.observe(el);
      },
      initialize(...args) {
        defaultView.prototype.initialize.apply(this, args);

        // Listen to changes in specific traits (autoplay, interval)
        this.listenTo(
          this.model,
          "change:duration change:endValue",
          this.renderCountUp,
        );
      },

      onRender() {
        const { el, model } = this;
        const endValue = model.get("endValue") || 100;
        const duration = model.get("duration") || 2000;

        el.setAttribute("endvalue", endValue);
        el.setAttribute("duration", duration);

        el.innerHTML = `0`;
      },
    },
  });

  editor.Blocks.add("count-up", {
    label: "Count Up",
    category: "Basic",
    content: {
      type: "count-up",
      attributes: {
        endValue: 1000,
        duration: 2000,
      },
    },
  });
}
