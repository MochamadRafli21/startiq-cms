import { Editor, PropertySelect } from "grapesjs";

export function registerFontStyle(editor: Editor) {
  const styleManager = editor.StyleManager;
  const fontProperty = styleManager.getProperty(
    "typography",
    "font-family",
  ) as PropertySelect;

  const fonts = [
    { id: "Arial", value: "Arial, sans-serif", name: "Arial" },
    { id: "Open Sans", value: '"Open Sans", sans-serif', name: "Open Sans" },
    { id: "Helvetica", value: "Helvetica, sans-serif", name: "Helvetica" },
    { id: "Geist", value: "Gest, sans-serif", name: "Geist" },
  ];

  fontProperty?.setOptions(fonts);
  fontProperty?.set("default", "Arial");
  styleManager.render();
}
