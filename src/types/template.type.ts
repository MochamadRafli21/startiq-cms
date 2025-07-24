import { ProjectData } from "grapesjs";

export interface Template {
  id?: number;
  title?: string;
  content?: ProjectData;
  created_at?: string | Date;
}
