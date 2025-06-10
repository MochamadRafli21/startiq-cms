export interface Page {
  id?: number;
  title?: string;
  slug?: string;
  content?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  iconImage?: string;
  isPublic?: boolean;
  createdAt?: string | Date;
}
