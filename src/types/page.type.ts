import { ProjectData } from "grapesjs";

export interface PageRecord {
  id: number;
  title: string;
  slug: string;
  is_public: boolean;
  created_at?: Date | null;
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
  is_public: boolean;
  content: ProjectData;
  css: string | null;
  html: string | null;
  meta_image?: string | null;
  icon_image?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface PageFullRecord extends PageBodyInput {
  id: number;
  created_at: Date;
}

export interface PageParams {
  id: string;
}

export interface PagePublicParams {
  slug: string;
}
