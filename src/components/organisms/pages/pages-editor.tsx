"use client";
import React, { useEffect, useRef, useState } from "react";
import { Editor, ProjectData } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { initEditor } from "@/utils/pages/editor-init";
import { renderAllComponents } from "@/utils/pages/renderers";

interface PageEditorProps {
  content?: ProjectData;
  onContentChange?: (data: ProjectData) => void;
  isPreview?: boolean;
}

export default function PageEditor({
  content,
  onContentChange,
  isPreview = false,
}: PageEditorProps) {
  const editorRef = useRef<Editor>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [renderedCss, setRenderedCss] = useState<string>("");

  useEffect(() => {
    if (!containerRef.current) return;
    if (!editorRef.current) {
      initEditor({
        containerRef: containerRef,
        editorRef: editorRef,
        onInit: (editor) => {
          if (content) {
            if (isPreview) {
              editor.loadProjectData(content);
              const html = editor.getHtml();
              const css = editor.getCss();
              setRenderedHtml(html);
              setRenderedCss(css || "");
              editor.destroy(); // Destroy the editor instance after extracting
              editorRef.current = null;
            } else {
              editor.on("load", () => {
                editor.loadProjectData(content);
              });
            }
          }

          const handleUpdate = () => {
            const json = editor.getProjectData();
            if (onContentChange) {
              onContentChange(json);
            }
          };

          editor.on("update", handleUpdate);

          // editor.destroy();
          // editorRef.current = null;
        },
        isPreview,
      });
    }
  }, [content, isPreview]);

  useEffect(() => {
    if (content) {
      renderAllComponents(content);
    }
  }, [renderedHtml, content]);

  if (isPreview) {
    return (
      <div className="grapesjs-public-page-wrapper min-h-screen">
        <style>{renderedCss}</style>
        <div id="root" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        <div ref={containerRef} />
      </div>
    );
  } else {
    return (
      <div className="overflow-hidden min-h-screen w-full flex flex-col">
        <div ref={containerRef} className="grow relative" />
      </div>
    );
  }
}
