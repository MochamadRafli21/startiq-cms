import { Editor, Component, Trait, TraitProperties } from "grapesjs";

export function registerImagesSelector(editor: Editor) {
  editor.TraitManager.addType("selected-images-viewer", {
    createInput(this) {
      const container = document.createElement("div");

      container.className = "gjs-selected-images-container";

      // Initialize empty content
      container.innerHTML = '<p style="color: #888;">Loading images...</p>';

      return container;
    },
    // `onUpdate` is crucial: it updates the trait's UI whenever the component's 'images' property changes

    onUpdate(
      this,
      {
        component,
        elInput,
      }: { component: Component; elInput: HTMLElement; trait: Trait },
    ) {
      const container = elInput;
      const images: string[] = component.get("images") || [];

      container.innerHTML = ""; // Clear it first

      if (images.length === 0) {
        container.innerHTML =
          '<p style="font-size: 0.9em; color: #888;">No images selected yet.</p>';
        return;
      }

      if (images.length === 0) {
        container.innerHTML =
          '<p style="font-size: 0.9em; color: #888; margin: 0;">No images selected yet.</p>';
        return;
      }

      images.forEach((url: string, index: number) => {
        // Added type annotations for url, index
        const imgItem = document.createElement("div");
        imgItem.className = "gjs-selected-image-item";
        imgItem.style.cssText = `
              display: flex;
              align-items: center;
              margin-bottom: 5px;
              border: 1px solid #eee;
              padding: 5px;
              background-color: #fff;
              border-radius: 3px;
              box-shadow: 0 1px 2px rgba(0,0,0,0.05);
            `;

        const img = document.createElement("img");
        img.src = url;
        img.alt = `Selected Image ${index + 1}`;
        img.style.cssText = `
              width: 40px;
              height: 40px;
              object-fit: cover;
              margin-right: 10px;
              border-radius: 2px;
            `;
        imgItem.appendChild(img);

        const removeBtn = document.createElement("button");
        removeBtn.className = "gjs-remove-image gjs-btn-prim gjs-btn-button"; // Add a unique class for event listener
        removeBtn.innerHTML = "&times;";
        removeBtn.title = "Remove image";
        removeBtn.setAttribute("data-index", String(index)); // Store index for removal
        removeBtn.style.cssText = `
              margin-left: 10px;
              background-color: #dc3545;
              border: none;
              color: white;
              width: 25px;
              height: 25px;
              line-height: 1;
              border-radius: 3px;
              cursor: pointer;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
            `;
        const currentComponent = component; // Capture component reference

        removeBtn.onclick = (e) => {
          e.stopPropagation(); // Prevent potential bubbling issues

          const target = e.target as HTMLElement;
          const indexToRemove = parseInt(
            target.getAttribute("data-index") || "-1",
            10,
          );

          if (!isNaN(indexToRemove) && indexToRemove >= 0) {
            const currentImages: string[] =
              currentComponent.get("images") || [];
            const newImages = currentImages.filter(
              (_, idx) => idx !== indexToRemove,
            );

            // This still triggers onUpdate, so the UI will refresh
            currentComponent.set("images", newImages);

            // If you implemented undo, you'd call it like:
            // (currentTrait as any).handleUndoLogic(currentComponent, prevImages, removedImage, indexToRemove);
          }
        };
        imgItem.appendChild(removeBtn);

        container.appendChild(imgItem);
      });
    },
    // Event handler for removing an image
    onRemoveImage(this: Trait, event: Event) {
      // Added type annotation for event
      const target = event.target as HTMLElement; // Cast to HTMLElement for attribute access
      const indexToRemove = parseInt(
        target.getAttribute("data-index") || "-1",
        10,
      );
      const component = this.target; // The component associated with this trait
      const images: string[] = component.get("images") || [];

      if (indexToRemove >= 0 && indexToRemove < images.length) {
        images.splice(indexToRemove, 1); // Remove the image at the given index
        // Crucially, set a new array to trigger GrapesJS reactivity
        component.set("images", [...images]);
      }
    },

    // Helper function (private-like convention with underscore)
    _truncateUrl(this: Trait, url: string, maxLength: number): string {
      // Added type annotations
      if (url.length <= maxLength) {
        return url;
      }
      const start = url.lastIndexOf("/") + 1;
      const filename = url.substring(start);
      if (filename.length <= maxLength) {
        return filename;
      }
      return "..." + filename.substring(filename.length - maxLength + 3);
    },
  } as TraitProperties);

  //adding custom command to open multi select asset manager
  editor.Commands.add("open-assets-multiple", {
    run(editor) {
      const selected = editor.getSelected();
      if (!selected || selected.get("type") !== "infinite-slides") {
        editor.Modal.open({
          title: "Select the Infinite Slides component first",
          content:
            "Please select an 'Infinite Slides' component before adding images.",
        });
        return;
      }

      const selectedAssets: string[] = [];

      editor.AssetManager.open({
        select: (asset, complete) => {
          const src = asset.get("src");
          if (!selectedAssets.includes(src)) {
            selectedAssets.push(src);
          }

          if (complete && selectedAssets.length > 0) {
            const prev = selected.get("images");
            selected.set("images", [...selectedAssets, ...prev]);
          }
        },
      });
    },
  });
}
