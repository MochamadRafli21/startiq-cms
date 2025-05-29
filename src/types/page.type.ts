export interface Page {
  id?: number;
  title?: string;
  slug?: string;
  content?: Record<string, any>;
  isPublic?: boolean;
  createdAt?: string | Date;
}
