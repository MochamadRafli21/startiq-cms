import { Editor, Component } from "grapesjs";

export function registerTagsSelector(editor: Editor) {
  editor.TraitManager.addType("tags-selector", {
    createInput() {
      const el = document.createElement("select");
      el.multiple = true;
      el.style.minHeight = "80px";
      el.style.width = "100%";
      el.style.padding = "4px";

      fetch("/api/pages/tags")
        .then((res) => res.json())
        .then((body: { tags: string[] }) => {
          const tags = body.tags;
          tags.forEach((tag) => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = tag;
            el.appendChild(opt);
          });
        })
        .catch((err) => {
          console.error("Failed to load tags:", err);
        });

      fetch("/api/links/tags")
        .then((res) => res.json())
        .then((body: { tags: string[] }) => {
          const tags = body.tags;
          tags.forEach((tag) => {
            const opt = document.createElement("option");
            opt.value = tag;
            opt.textContent = tag;
            el.appendChild(opt);
          });
        })
        .catch((err) => {
          console.error("Failed to load tags:", err);
        });
      return el;
    },
    onEvent({
      elInput,
      component,
    }: {
      elInput: HTMLInputElement;
      component: Component;
    }) {
      const input = elInput as unknown as HTMLSelectElement;
      const selectedTags = Array.from(input.selectedOptions).map(
        (opt) => opt.value,
      );
      component.set("tags", selectedTags.join(","));
      component.addAttributes({ "data-tags": selectedTags.join(",") });

      // Re-run script
      const script = component.get("script");
      component.set("script", "");
      component.set("script", script);
    },
  });
  // --- 1. Define Custom Trait: AssetManagerOpenerTrait ---
}
