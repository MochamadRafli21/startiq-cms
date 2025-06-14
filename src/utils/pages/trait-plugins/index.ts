import { registerLinkTagsSelector } from "./trait-link-tags";
import { registerTagsSelector } from "./trait-tags";
import { registerImagesSelector } from "./trait-images";

export const customTraitPlugins = [
  registerLinkTagsSelector,
  registerTagsSelector,
  registerImagesSelector,
];
