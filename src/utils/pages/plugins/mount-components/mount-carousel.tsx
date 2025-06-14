import React from "react";
import { Root } from "react-dom/client";
import {
  Carousel,
  type CarouselProps,
} from "@/components/organisms/grapesjs/carousel";

export function mountCarousel(root: Root, props: CarouselProps) {
  root.render(<Carousel {...props} />);
}
