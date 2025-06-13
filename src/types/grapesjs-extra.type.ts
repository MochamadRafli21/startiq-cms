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
