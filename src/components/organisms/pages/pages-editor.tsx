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
        },
        isPreview,
      });
    }
  }, [content, isPreview]);

  useEffect(() => {
    if (content && isPreview) {
      renderAllComponents(content);
    }
  }, [renderedHtml, content]);

  useEffect(() => {
    if (editorRef.current && !isPreview) {
      const interval = setInterval(() => {
        // Wait until iframe is mounted and accessible
        const iframe = document.querySelector(
          "iframe.gjs-frame",
        ) as HTMLIFrameElement;
        if (iframe && iframe.contentDocument?.head) {
          // Inject Tailwind CSS
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href =
            "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

          // Inject Custom Animation
          const style = document.createElement("style");
          style.textContent = `
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
              perspective: 1000px;
              transform-style: preserve-3d;
              transition: transform 0.5s ease-in-out;
              display: flex;
              width: 100%;
            }
            
            .carousel-slide {
              flex: 0 0 100%;
              backface-visibility: hidden;
              transform-style: preserve-3d;
              transition: transform 0.6s ease;
            }

            .carousel-zoom {
                transition: transform 0.3s ease;
                transform: scale(1.05) !important;
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

          const head = iframe.contentDocument.head;
          head.appendChild(link);
          head.appendChild(style);

          clearInterval(interval); // Stop polling
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [editorRef.current]);

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
      <div className="relative overflow-hidden min-h-screen w-full flex flex-col">
        <div ref={containerRef} className="grow relative" />
      </div>
    );
  }
}
