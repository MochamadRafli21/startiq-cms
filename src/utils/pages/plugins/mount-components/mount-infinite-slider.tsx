import React from "react";
import { Root } from "react-dom/client";
import {
  InfiniteSlides,
  type SlideProps,
} from "@/components/organisms/grapesjs/infinite-slides";

export function mountInfiniteSlides(root: Root, props: SlideProps) {
  root.render(<InfiniteSlides key={JSON.stringify(props.images)} {...props} />);
}
