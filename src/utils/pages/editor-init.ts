import { RefObject } from "react";

import grapesjs, { Editor } from "grapesjs";
import tailwindPlugin from "grapesjs-tailwindcss-plugin";

import { customPlugins } from "@/utils/pages/plugins";
import { customTraitPlugins } from "@/utils/pages/trait-plugins";

export const initEditor = async ({
  containerRef,
  editorRef,
  isPreview,
  onInit,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  editorRef: RefObject<Editor | null>;
  isPreview: boolean;
  onInit: (editor: Editor) => void;
}) => {
  const [
    basicBlocks,
    flexbox,
    countdown,
    customCode,
    navbar,
    postcss,
    pluginExport,
    presetWebpage,
    styleBg,
    imageEditor,
    touch,
    forms,
    typed,
    tooltip,
  ] = await Promise.all([
    import("grapesjs-blocks-basic"),
    import("grapesjs-blocks-flexbox"),
    import("grapesjs-component-countdown"),
    import("grapesjs-custom-code"),
    import("grapesjs-navbar"),
    import("grapesjs-parser-postcss"),
    import("grapesjs-plugin-export"),
    import("grapesjs-preset-webpage"),
    import("grapesjs-style-bg"),
    import("grapesjs-tui-image-editor"),
    import("grapesjs-touch"),
    import("grapesjs-plugin-forms"),
    import("grapesjs-typed"),
    import("grapesjs-tooltip"),
  ]);

  if (!containerRef.current) {
    console.error("GrapesJS container not found.");
    return;
  }

  const editor = grapesjs.init({
    container: containerRef.current,
    height: "100vh",
    headless: isPreview,
    fromElement: false,
    storageManager: false,
    parser: {
      optionsHtml: {
        allowUnsafeAttr: true,
      },
    },
    assetManager: !isPreview
      ? {
          upload: "/api/uploads",
          uploadName: "file",
          autoAdd: true,
          multiUpload: false,
          assets: [],
        }
      : {},
    plugins: [
      basicBlocks.default,
      tailwindPlugin,
      flexbox.default,
      countdown.default,
      customCode.default,
      navbar.default,
      postcss.default,
      pluginExport.default,
      forms.default,
      presetWebpage.default,
      styleBg.default,
      tooltip.default,
      touch.default,
      imageEditor.default,
      typed.default,
    ],
    pluginsOpts: {
      [presetWebpage.default.name]: {},
      [imageEditor.default.name]: {
        script: [
          "https://cdn.jsdelivr.net/npm/fabric@4.6.0/dist/fabric.min.js",
          "https://cdn.jsdelivr.net/npm/tui-image-editor@3.15.2/dist/tui-image-editor.min.js",
        ],
        style: [
          "https://cdn.jsdelivr.net/npm/tui-image-editor@3.15.2/dist/tui-image-editor.min.css",
        ],
      },
    },
  });

  const domComponents = editor.DomComponents;
  if (!domComponents) return;

  editor.on("canvas:ready", () => {
    const iframe = editor.Canvas.getFrameEl();
    const head = iframe.contentDocument?.head;
    const doc = editor.Canvas.getDocument();
    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

    const animationCSS = `
          @keyframes scroll-right {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(0%); }
            100% { transform: translateX(50%); }
          }
          .animate-scroll-left {
            animation-name: scroll-left;
          }
          .animate-scroll-right {
            animation-name: scroll-right;
          }

          .carousel-track {
            transition: transform 0.5s ease-in-out;
            display: flex;
            width: 100%;
          }
          
          .carousel-slide {
            flex: 0 0 100%;
            backface-visibility: hidden;
          }
          
          [data-animation="flip"] .carousel-track {
            transition: transform 0.8s;
            transform-style: preserve-3d;
          }
          
          [data-animation="coverflow"] .carousel-slide {
            transition: transform 0.5s ease;
            transform-origin: center center;
          }
          
          [data-animation="pan"] .carousel-track {
            transition: transform 1s ease-in-out;
          }
        `;
    if (head) {
      const styleEl = doc.createElement("style");
      styleEl.innerHTML = animationCSS;
      head.appendChild(styleEl);
      head.appendChild(link);
    }

    // populate image selector
    fetch("/api/assets") // Call your new API route
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((assets) => {
        if (assets && assets.length > 0) {
          // Add the fetched assets to the GrapesJS Asset Manager
          editor.AssetManager.add(assets);
        }
      })
      .catch((error) =>
        console.error("Error fetching existing assets:", error),
      );
  });

  editorRef.current = editor;
  const defaultView = editor.Components.getType("default").view;
  customTraitPlugins.forEach((plugin) => plugin(editor));
  customPlugins.forEach((plugin) => plugin(editor, defaultView));

  onInit(editor);
};
