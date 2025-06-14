import { ComponentViewDefinition, ComponentView } from "grapesjs";

export interface ScriptedElement extends HTMLElement {
  __grapesjs_script?: () => void;
}

export interface GjsComponent {
  attributes?: {
    [key: string]: string;
  };
  components?: GjsComponent[];
  component?: GjsComponent;
  styles: {
    selectors: string[];
    style: Record<string, string | number>;
  };
  [key: string]: unknown;
}

interface GrapesJSComponentViewPrototypeWithOnRemove {
  initialize: {
    apply: (instance: ComponentViewDefinition, args: unknown[]) => void;
  };
  onRemove: {
    apply: (instance: ComponentViewDefinition, args: unknown[]) => void;
  };
}

export type DefaultComponentViewType = typeof ComponentView & {
  prototype: GrapesJSComponentViewPrototypeWithOnRemove;
};
