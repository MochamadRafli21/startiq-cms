export interface Link {
  id?: number;
  title?: string;
  descriptions?: string;
  banner?: string;
  target?: string;
  attributes?: Record<string, string>;
  tags?: string[];
  created_at?: string | Date;
}
