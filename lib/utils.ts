export function detectTom(cifraText: string): string {
  // Validação mais rigorosa
  if (!cifraText || typeof cifraText !== 'string') return "---";
  
  let tom = "";

  const jsonMatch = cifraText.match(/"tom":\s*"([^"]+)"/i);
  if (jsonMatch) {
    tom = jsonMatch[1];
  }
  
  const oldFormatMatch = cifraText.match(/Tom:\s*([^,\n]+)/i);
  if (oldFormatMatch) {
    tom = oldFormatMatch[1];
  }

  if (!tom && cifraText.trim()) {
    tom = cifraText.trim();
    console.log("Tom recebido diretamente:", tom);
  }
  
  if (!tom) return "---";
  
  if (/^[A-G][#b]?$/i.test(tom)) {
    return tom.toUpperCase();
  }
  
  const conversao: { [key: string]: string } = {
    "si b maior": "Bb",
    "si b": "Bb",
    "si bemol maior": "Bb",
    "si bemol": "Bb",
    "do maior": "C",
    "do sustenido maior": "C#",
    "do sustenido": "C#",
    "do": "C",
    "re maior": "D",
    "ré maior": "D",
    "re bemol maior": "Db",
    "re bemol": "Db",
    "re": "D",
    "ré": "D",
    "mi maior": "E",
    "mi bemol maior": "Eb",
    "mi bemol": "Eb",
    "mi": "E",
    "fa maior": "F",
    "fa sustenido maior": "F#",
    "fa sustenido": "F#",
    "fa": "F",
    "sol maior": "G",
    "sol bemol maior": "Gb",
    "sol bemol": "Gb",
    "sol": "G",
    "la maior": "A",
    "la bemol maior": "Ab",
    "la bemol": "Ab",
    "la": "A",
    "si maior": "B",
    "si": "B"
  };
  
  const tomNormalizado = tom.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
  
  if (conversao[tomNormalizado]) {
    return conversao[tomNormalizado];
  }
  
  for (const [portugues, padrao] of Object.entries(conversao)) {
    if (tomNormalizado.includes(portugues)) {
      return padrao;
    }
  }
  
  return tom;
}

export function isChordLine(line: string): boolean {
  if (!line.trim()) return false;
  if (/tom:/i.test(line)) return false;
  const trimmed = line.trim();
  const chordPattern = /^[A-G]([#b]?)(maj|min|m|sus|dim|aug|7|9|11|13|2|4|5|6)*(\/[A-G][#b]?)?$/i;
  const words = trimmed.split(/\s+/);
  if (!words.length) return false;
  let chordCount = 0;
  for (const w of words) {
    const clean = w.replace(/[,;:!?]$/, "");
    if (chordPattern.test(clean)) chordCount++;
  }
  const ratio = chordCount / words.length;
  return ratio > 0.35 && chordCount >= 1;
}

export function isSectionLabel(line: string): boolean {
  const t = line.trim();
  return t.startsWith("[") && t.endsWith("]");
}

export interface ParsedLine {
  type: "section" | "chord" | "lyric" | "tom" | "empty" | "refrain";
  content: string;
  isRefrain?: boolean; 
   _isRepeatedRefrain?: boolean;
}

export function parseCifraLines(rawText: string): ParsedLine[] {
  const lines = rawText.split(/\r?\n/);
  const result: ParsedLine[] = [];
  let insideRefrain = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      result.push({ type: "empty", content: "" });
      continue;
    }

    if (trimmed === "---Refrão---") {
      insideRefrain = !insideRefrain;
      result.push({ type: "refrain", content: trimmed, isRefrain: true });
      continue;
    }
    
    
    if (/^Tom:/i.test(trimmed)) {
      result.push({ type: "tom", content: trimmed, isRefrain: insideRefrain });
      continue;
    }
    
    if (isSectionLabel(line)) {
      result.push({ type: "section", content: trimmed, isRefrain: insideRefrain });
      continue;
    }
    
    if (isChordLine(line)) {
      result.push({ type: "chord", content: line, isRefrain: insideRefrain });
      continue;
    }
    
    // Para linhas de letra comum
    result.push({ type: "lyric", content: line, isRefrain: insideRefrain });
  }
  
  return result;
}

export function slugCC(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function expandRefrainReferences(lines: ParsedLine[]): ParsedLine[] {
  const result: ParsedLine[] = [];
  let lastRefrainBlock: ParsedLine[] = [];
  let currentRefrainBlock: ParsedLine[] = [];

  for (const line of lines) {
    const normalized = line.content?.replace(/[-\s!]/g, "").toLowerCase();

    // Oculta marcador ---Refrão---
    if (line.type === "refrain" && normalized === "refrão") {
      currentRefrainBlock = [];
      continue;
    }

    // !Refrão => repete último bloco salvo
    if (normalized === "refrão" && line.content.trim().startsWith("!")) {
      if (lastRefrainBlock.length > 0) {
        result.push(
          ...lastRefrainBlock.map((item) => ({
            ...item,
            isRefrain: true,
            _isRepeatedRefrain: true,
          }))
        );
      }
      continue;
    }

    if (line.isRefrain) {
      currentRefrainBlock.push({
        ...line,
        isRefrain: true,
      });
      lastRefrainBlock = [...currentRefrainBlock];
    }

    result.push(line);
  }

  return result;
}