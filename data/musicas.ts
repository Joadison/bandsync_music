import fs from "fs";
import path from "path";
import { Song } from "@/lib/types";

export function getSongs(): Song[] {
  const filePath = path.join(process.cwd(), "public", "musicas.json");

  if (!fs.existsSync(filePath)) {
    console.error("Arquivo não encontrado:", filePath);
    return [];
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(fileContents);
  return Array.isArray(data) ? data : [data];
}