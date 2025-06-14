import { Editor, Component } from "grapesjs";
import React from "react";
import ReactDOM from "react-dom/client";
import { mountCarousel } from "./mount-components/mount-carousel";
import { DefaultComponentViewType } from "@/types/grapesjs-extra.type";

export function registerCarousel(
  editor: Editor,
  defaultView: DefaultComponentViewType,
) {
  // register custom carousel
  editor.DomComponents.addType("carousel-react", {
    model: {
      defaults: {
        tagName: "div",
        draggable: true,
        droppable: true,
        resizeable: true,
        stylable: true,
        attributes: {
          "data-gjs-type": "carousel-react", // Custom type attribute for GrapesJS
        },
        traits: [
          {
            type: "checkbox",
            label: "Auto",
            name: "autoplay",
            valueTrue: "true",
            valueFalse: "false",
            changeProp: true,
          },
          {
            type: "checkbox",
            label: "Show Indicator",
            name: "showIndicators",
            valueTrue: "true",
            valueFalse: "false",
            changeProp: true,
          },
          {
            type: "select",
            label: "Show Navigation",
            name: "showNavigation",
            options: [
              { id: "none", label: "None" },
              { id: "hover", label: "Hover" },
              { id: "always", label: "Always" },
            ],
            changeProp: true,
          },
          {
            type: "checkbox",
            label: "Zoom On Hover",
            name: "zoomOnHover",
            valueTrue: "true",
            valueFalse: "false",
            changeProp: true,
          },
          {
            type: "checkbox",
            label: "Pause On Hover",
            name: "pauseOnHover",
            valueTrue: "true",
            valueFalse: "false",
            changeProp: true,
          },
          {
            type: "select",
            label: "Animation Type",
            name: "animationType",
            options: [
              { id: "slide", label: "Slide" },
              { id: "flip", label: "Flip" },
              { id: "pan", label: "Pan" },
              { id: "coverflow", label: "coverflow" },
              { id: "none", label: "None" },
            ],
            changeProp: true,
          },
          {
            type: "number",
            label: "Interval (ms)",
            name: "interval",
            placeholder: "3000",
            changeProp: true,
          },
        ],
        autoplay: "false",
        showNavigation: "always",
        showIndicator: "true",
        zoomOnHover: "false",
        pauseOnHover: "false",
        animationType: "none",
        interval: "3000",
        components: [
          {
            type: "text",
            components: [{ type: "textnode", content: "slide1" }],
            style: {
              padding: "20px",
              background: "#f8f8f8",
              minHeight: "200px",
            },
          },
          {
            type: "text",
            components: [{ type: "textnode", content: "slide3" }],
            style: {
              padding: "20px",
              background: "#f8f8f8",
              minHeight: "200px",
            },
          },
        ],
      },
    },
    view: defaultView.extend({
      tagName: "div",
      className: "gjs-carousel-react-wrapper", // Class for the GrapesJS wrapper element
      root: null, // To store the React root for React 18+

      // Method to render/re-render the React component
      // Using useCallback to memoize to prevent unnecessary re-creations
      renderReactCarousel() {
        // Use `function` to ensure `this` context
        const el = this.el; // The DOM element managed by GrapesJS for this component
        const model = this.model;
        // Array.from(el.childNodes).forEach((child) => {
        //   if ((child as { id: string }).id !== "unique") {
        //     el.removeChild(child);
        //   }
        // });
        const autoplay = model.get("autoplay") === "true";
        const showIndicators = model.get("showIndicators") === "true";
        const showNavigation = model.get("showNavigation");
        const zoomOnHover = model.get("zoomOnHover") === "true";
        const pauseOnHover = model.get("pauseOnHover") === "true";
        const animationType = model.get("animationType");
        const interval = parseInt(model.get("interval"), 10) || 3000;

        // Map each GrapesJS component (slide) to a React element
        const childrenReactElements =
          model?.get("components")?.map((comp: Component, index: number) => {
            const componentHtml = comp.toHTML(); // Get the HTML of the GrapesJS component
            // Wrap the HTML in a React element using dangerouslySetInnerHTML
            return React.createElement("div", {
              key: comp.cid || `gjs-carousel-slide-${index}`, // Unique key for React list rendering
              // You can pass GrapesJS classes if needed
              "data-gjs-type": comp.get("type"), // Useful for debugging
              dangerouslySetInnerHTML: { __html: componentHtml },
            });
          }) || [];

        // Initialize or update the React root
        // if (!this.root) {
        //   this.root = ReactDOM.createRoot(el);
        // }
        // this.root.render(
        //   <Carousel
        //     autoplay={autoplay}
        //     interval={interval}
        //     animation={animationType}
        //     showIndicators={showIndicators}
        //     navButtons={showNavigation}
        //     pauseOnHover={pauseOnHover}
        //     zoomOnHover={zoomOnHover}
        //   >
        //     {childrenReactElements}
        //   </Carousel>,
        // );

        if (!this.root) {
          this.root = ReactDOM.createRoot(el);
        }

        mountCarousel(this.root, {
          autoplay,
          interval,
          animation: animationType,
          showIndicators,
          navButtons: showNavigation,
          pauseOnHover,
          zoomOnHover,
          children: childrenReactElements,
        });
      },

      // This initializes the view and sets up event listeners
      initialize(...args: unknown[]) {
        defaultView.prototype.initialize.apply(this, args);

        // Listen to changes in specific traits (autoplay, interval)
        this.listenTo(
          this.model,
          "change:autoplay change:interval change:animationType change:showNavigation change:zoomOnHover change:showIndicators",
          this.renderReactCarousel,
        );

        // Listen to changes in the components collection (children added/removed)
        // 'add', 'remove', 'reset' are events on the components collection itself
        this.listenTo(
          this.model.get("components"),
          "add remove reset",
          this.renderReactCarousel,
        );

        // Listen for general updates to any child component's content/style
        // This ensures if a child component's inner HTML changes (e.g., text content edited),
        // the carousel re-renders to reflect that.
        this.listenTo(
          this.model.get("components"),
          "change",
          this.renderReactCarousel,
        );

        // Initial render of the React component
        this.renderReactCarousel();
      },

      // onRender is called frequently (e.g., when component is selected)
      // We moved the actual rendering and listener setup to initialize()
      // and renderReactCarousel(). So, onRender doesn't need to do much.
      onRender() {
        return this;
      },

      // Cleanup: unmount React component and remove listeners
      onRemove(...args: unknown[]) {
        if (this.root) {
          this.root.unmount(); // Unmount React component from the DOM
          this.root = null;
        }
        this.stopListening(); // Removes all listeners attached with this.listenTo
        defaultView.prototype.onRemove.apply(this, args); // Call super's onRemove
      },
    }),
  });

  editor.BlockManager.add("carousel-react-block", {
    label: "Carousel",
    category: "Custom",
    media: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gallery-horizontal-end-icon lucide-gallery-horizontal-end"><path d="M2 7v10"/><path d="M6 5v14"/><rect width="12" height="18" x="10" y="3" rx="2"/></svg>
          `,
    content: {
      type: "carousel-react",
    },
  });
}
