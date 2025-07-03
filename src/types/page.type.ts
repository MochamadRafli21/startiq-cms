import { ProjectData } from "grapesjs";

export interface PageRecord {
  id: number;
  title: string;
  slug: string;
  isPublic: boolean;
  createdAt?: Date | null;
}

export interface PageResponse {
  pages: PageRecord[];
  total: number;
}

export interface PageQuery {
  search?: string;
  page?: number;
  limit?: number;
  tags?: string[];
}

export interface PageBodyInput {
  title: string;
  slug: string;
  tags: string[];
  category: string[];
  isPublic: boolean;
  content: ProjectData;
  contentCss: string | null;
  contentHtml: string | null;
  metaImage?: string | null;
  iconImage?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface PageFullRecord extends PageBodyInput {
  id: number;
  createdAt: Date;
}

export interface PageParams {
  id: string;
}

export interface PagePublicParams {
  slug: string;
}
