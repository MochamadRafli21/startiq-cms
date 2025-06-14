import type { GjsComponent } from "@/types/grapesjs-extra.type";
import { ProjectData } from "grapesjs";

export const findComponentById = (
  components: GjsComponent[],
  targetId: string,
): GjsComponent | null => {
  for (const comp of components) {
    // Some components may nest under `component.components`
    const current = comp.component || comp;

    // Check current component's attributes
    if (current.attributes?.id === targetId) {
      return current;
    }

    // Recurse into children
    const children = current.components || [];
    const result: GjsComponent | null = findComponentById(children, targetId);
    if (result) return result;
  }

  return null;
};

export const componentToHTML = (
  component: GjsComponent,
  content: ProjectData,
): string => {
  // Handle text node directly
  if (component.type === "textnode") {
    return (component.content || "") as string;
  }
  const style = content?.styles?.find((style: { selectors: string[] }) =>
    style.selectors.includes(`#${component?.attributes?.id}`),
  );
  let attrs = component.attributes
    ? Object.entries(component.attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
    : "";

  const classes = (component?.classes as string[])
    ?.map((cls: string | { name: string }) =>
      typeof cls === "string" ? cls : cls.name,
    )
    .filter(Boolean)
    .join(" ");

  if (component?.type === "video") {
    component.type = "iframe";
    attrs = `${attrs} src=${component?.src}`;
  }

  const inner = (component.components || [])
    .map((child) => componentToHTML(child, content))
    .join("");

  const styleObj = style?.style || {};
  const styleString = Object.entries(styleObj)
    .map(([k, v]) => `${k}:${v}`)
    .join(";");

  return `<${component.type || "div"} ${attrs} style="${styleString || ""}" class="${classes || ""}">${inner}</${component.type || "div"}>`;
};
