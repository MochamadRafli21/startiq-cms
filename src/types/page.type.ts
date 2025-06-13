export interface Page {
  id?: number;
  title?: string;
  slug?: string;
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: Record<string, any>;
  metaTitle?: string;
  metaDescription?: string;
  metaImage?: string;
  iconImage?: string;
  isPublic?: boolean;
  createdAt?: string | Date;
}
