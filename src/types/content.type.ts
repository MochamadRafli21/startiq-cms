export interface Content {
  id?: number;
  title?: string;
  descriptions?: string;
  banner?: string;
  target?: string;
  type: "page" | "link";
  createdAt?: string | Date;
}
