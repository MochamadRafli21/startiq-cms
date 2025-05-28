"use client";

import { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";

interface PageEditorProps {
  content?: Record<string, any>;
  onContentChange?: (data: Record<string, any>) => void;
}

export default function PageEditor({
  content,
  onContentChange,
}: PageEditorProps) {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    // Dynamically import all plugins here
    const loadPlugins = async () => {
      const basicBlocks = (await import("grapesjs-blocks-basic")).default;
      const flexbox = (await import("grapesjs-blocks-flexbox")).default;
      const countdown = (await import("grapesjs-component-countdown")).default;
      const customCode = (await import("grapesjs-custom-code")).default;
      const navbar = (await import("grapesjs-navbar")).default;
      const postcss = (await import("grapesjs-parser-postcss")).default;
      const pluginExport = (await import("grapesjs-plugin-export")).default;
      const presetWebpage = (await import("grapesjs-preset-webpage")).default;
      const styleBg = (await import("grapesjs-style-bg")).default;
      const imageEditor = (await import("grapesjs-tui-image-editor")).default;
      const touch = (await import("grapesjs-touch")).default;
      const forms = (await import("grapesjs-plugin-forms")).default;
      const typed = (await import("grapesjs-typed")).default;
      const tooltip = (await import("grapesjs-tooltip")).default;

      if (!containerRef.current) {
        console.error("GrapesJS container not found.");
        return;
      }

      const editor = grapesjs.init({
        container: containerRef.current,
        height: "100vh",
        fromElement: false,
        storageManager: false,
        plugins: [
          basicBlocks,
          flexbox,
          countdown,
          customCode,
          navbar,
          postcss,
          pluginExport,
          forms,
          presetWebpage,
          styleBg,
          tooltip,
          touch,
          imageEditor,
          typed,
        ],
        pluginsOpts: {
          [presetWebpage.name]: {},
          [imageEditor.name]: {
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

      if (content) {
        editor.loadProjectData(content);
      }

      editorRef.current = editor;

      const handleUpdate = () => {
        const json = editor.getProjectData();
        if (onContentChange) {
          onContentChange(json);
        }
      };

      editor.on("update", handleUpdate);

      return () => {
        editor.destroy();
        editorRef.current = null;
      };
    };

    loadPlugins();
  }, [content]);

  return (
    <div className="overflow-hidden min-h-screen w-full flex flex-col">
      <div ref={containerRef} className="grow relative" />
    </div>
  );
}
