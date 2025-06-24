import { ProjectData } from "grapesjs";

export interface Page {
  id?: number;
  title?: string;
  slug?: string;
  tags?: string[];
  category?: string[];
  html?: string;
  css?: string;
  content?: ProjectData;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  iconImage?: string;
  isPublic?: boolean;
  createdAt?: string | Date;
}
