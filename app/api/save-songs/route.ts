import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const filePath = path.join(process.cwd(), "public", "musicas.json");

    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar músicas:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao salvar JSON" },
      { status: 500 }
    );
  }
}