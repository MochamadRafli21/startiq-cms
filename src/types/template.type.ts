import { ProjectData } from "grapesjs";

export interface Template {
  id?: number;
  title?: string;
  content?: ProjectData;
  createdAt?: string | Date;
}
