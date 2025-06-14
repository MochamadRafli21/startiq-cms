import { Editor } from "grapesjs";
import ReactDOM from "react-dom/client";
import { mountInfiniteSlides } from "./mount-components/mount-infinite-slider";
import { DefaultComponentViewType } from "@/types/grapesjs-extra.type";

export function registerSlider(
  editor: Editor,
  defaultView: DefaultComponentViewType,
) {
  // register custom slider
  editor.DomComponents.addType("infinite-slides", {
    model: {
      defaults: {
        tagName: "div", // The HTML tag that will wrap the React component
        stylable: true, // Allow styling
        draggable: true,
        droppable: false,
        style: {
          "min-height": "75px",
        },
        attributes: {
          // Default attributes for the component
          "data-gjs-type": "infinite-slides", // Custom type attribute for GrapesJS
        },
        speed: 30, // Default speed
        direction: "left", // Default speed
        images: [],
        imageList: [],
        // Define traits for the component
        traits: [
          {
            type: "selected-images-viewer", // This is the key
            label: "Manage Slider Images",
            name: "imageList",
            changeProp: true, // IMPORTANT: This trait needs to update when 'images' property changes
            // It doesn't modify a prop directly, but `onUpdate` relies on prop changes.
          },
          {
            type: "button", // This is the key
            name: "images",
            label: "Select Images",
            text: "Open Asset Manager",
            full: true, // Make it full width
            command: "open-assets-multiple", // Custom command to open asset manager
            changeProp: true, // IMPORTANT: This trait needs to update when 'images' property changes
          },
          {
            type: "select",
            label: "Direction",
            name: "direction",
            options: [
              { id: "left", label: "Left" },
              { id: "right", label: "Right" },
            ],
            changeProp: true,
          },
          {
            type: "number",
            label: "Speed",
            name: "speed",
            placeholder: "3000",
            min: 1,
            max: 100,
            changeProp: true, // Update property on change
          },
        ],
      },
    },
    view: defaultView.extend({
      tagName: "div",
      className: "gjs-infinite-slides-react-wrapper", // Class for the GrapesJS wrapper element
      root: null, // To store the React root for React 18+

      // Method to render/re-render the React component
      // Using useCallback to memoize to prevent unnecessary re-creations
      renderReactSlider() {
        // Use `function` to ensure `this` context
        const el = this.el; // The DOM element managed by GrapesJS for this component
        const model = this.model;

        const imagesArray = model.get("images");
        const direction = model.get("direction") === "right";
        const speed = parseInt(model.get("speed"), 10) || 100;

        if (!this.root) {
          this.root = ReactDOM.createRoot(el);
        }

        mountInfiniteSlides(this.root, {
          speed,
          images: imagesArray,
          direction: direction ? "right" : "left",
        });
      },

      // This initializes the view and sets up event listeners
      initialize(...args: unknown[]) {
        defaultView.prototype.initialize.apply(this, args);

        // Listen to changes in specific traits (autoplay, interval)
        this.listenTo(
          this.model,
          "change:speed change:direction change:images",
          this.renderReactSlider,
        );

        // Listen to changes in the components collection (children added/removed)
        // 'add', 'remove', 'reset' are events on the components collection itself
        this.listenTo(
          this.model.get("components"),
          "add remove reset",
          this.renderReactSlider,
        );

        // Listen for general updates to any child component's content/style
        // This ensures if a child component's inner HTML changes (e.g., text content edited),
        // the carousel re-renders to reflect that.
        this.listenTo(
          this.model.get("components"),
          "change",
          this.renderReactSlider,
        );
        // Initial render of the React component
        this.renderReactSlider();
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

  editor.BlockManager.add("infinite-slides", {
    label: "Infinite Image Slides",
    category: "Custom",
    media: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gallery-horizontal-end-icon lucide-gallery-horizontal-end"><path d="M2 7v10"/><path d="M6 5v14"/><rect width="12" height="18" x="10" y="3" rx="2"/></svg>
          `,
    content: {
      type: "infinite-slides",
    },
  });
}
