export interface Content {
  id?: number;
  title?: string;
  descriptions?: string;
  banner?: string;
  target?: string;
  type: "page" | "link";
  created_at?: string | Date;
}
