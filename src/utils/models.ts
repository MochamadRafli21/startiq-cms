import React, { ReactElement } from "react";
import type { Component } from "grapesjs";
import { kebabToCamel } from "./string";

// List of HTML5 void elements
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "keygen",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
export function renderGrapesComponentToReact(
  comp: Component,
  key: string | number,
) {
  const tagName = comp.get("tagName") || "div";
  const attributes = comp.get("attributes") || {};
  const classes = comp.get("classes") || [];
  const rawStyles = comp.get("style") || {};
  const styles: React.CSSProperties = Object.entries(rawStyles).reduce(
    (acc, [key, value]) => {
      const realKey = kebabToCamel(key) as keyof React.CSSProperties;
      acc[realKey] = value;
      return acc;
    },
    {} as React.CSSProperties,
  );
  const components = comp.get("components") || [];

  // Reconstruct children recursively
  const children = components.map((child: Component, i: number) =>
    renderGrapesComponentToReact(child, `${key}-${i}`),
  ) as ReactElement[];

  const combinedProps = {
    key,
    ...attributes,
    className: classes
      .map((c: Component) => (typeof c === "string" ? c : c.id || ""))
      .join(" "),
    style: styles,
    "data-gjs-type": comp.get("type"),
  };

  console.log(comp);

  if (VOID_TAGS.has(tagName)) {
    return React.createElement(tagName, combinedProps);
  }

  return React.createElement(
    tagName,
    combinedProps,
    children.length > 0 ? children : comp.get("content"),
  );
}
