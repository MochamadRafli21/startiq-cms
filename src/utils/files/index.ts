import { readdir, stat } from "fs/promises";
import path from "path";

export async function getFolderSize(dir: string): Promise<number> {
  const files = await readdir(dir);
  const stats = await Promise.all(
    files.map((file) => stat(path.join(dir, file))),
  );
  return stats.reduce((total, f) => total + (f.isFile() ? f.size : 0), 0);
}
