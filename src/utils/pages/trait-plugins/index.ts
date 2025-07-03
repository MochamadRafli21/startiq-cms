import { registerLinkTagsSelector } from "./trait-link-tags";
import { registerTagsSelector } from "./trait-tags";
import { registerImagesSelector } from "./trait-images";
import { registerPageTagsSelector } from "./trait-page-tags";

export const customTraitPlugins = [
  registerLinkTagsSelector,
  registerTagsSelector,
  registerPageTagsSelector,
  registerImagesSelector,
];
