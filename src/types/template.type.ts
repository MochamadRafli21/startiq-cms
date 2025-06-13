export interface Template {
  id?: number;
  title?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: Record<string, any>;
  createdAt?: string | Date;
}
