"use client";
import React, { useEffect } from "react";
import { ProjectData } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { renderAllComponents } from "@/utils/pages/renderers";

interface PageRendererProps {
  content: ProjectData;
  html: string;
  css: string;
}

export default function PageRenderer({
  content,
  html,
  css,
}: PageRendererProps) {
  useEffect(() => {
    if (content) {
      renderAllComponents(content);
    }
  }, [html, content]);

  return (
    <>
      <style>{css}</style>
      <main id="root" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
