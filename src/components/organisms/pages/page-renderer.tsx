"use client";
import { useEffect } from "react";
import { ProjectData } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { renderAllComponents } from "@/utils/pages/renderers";

interface PageRendererProps {
  content: ProjectData;
}

export default function PageRenderer({ content }: PageRendererProps) {
  useEffect(() => {
    if (content) {
      renderAllComponents(content);
    }
  }, [content]);

  return null;
}
