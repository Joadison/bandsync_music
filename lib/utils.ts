const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NOTES  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  "B#": 0,

  "C#": 1,
  Db: 1,

  D: 2,

  "D#": 3,
  Eb: 3,

  E: 4,
  Fb: 4,

  F: 5,
  "E#": 5,

  "F#": 6,
  Gb: 6,

  G: 7,

  "G#": 8,
  Ab: 8,

  A: 9,

  "A#": 10,
  Bb: 10,

  B: 11,
  Cb: 11,
};

export const AVAILABLE_KEYS = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
];

function normalizeNote(note: string): string {
  const clean = note.trim();
  if (NOTE_INDEX[clean] === undefined) return clean;
  return AVAILABLE_KEYS[NOTE_INDEX[clean]];
}

function transposeNote(note: string, semitones: number): string {
  const idx = NOTE_INDEX[note];
  if (idx === undefined) return note;

  const newIndex = (idx + semitones + 12) % 12;
  return AVAILABLE_KEYS[newIndex];
}

/**
 * Transpõe um acorde completo:
 * C -> D
 * Dm -> Em
 * G/B -> A/C#
 * F#7 -> G#7
 * Bbmaj7 -> Cmaj7
 */
export function transposeChord(chord: string, semitones: number): string {
  // Ex.: C, Dm, F#7, Bbmaj7, G/B, A/C#
  const chordRegex = /^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/;
  const match = chord.match(chordRegex);

  if (!match) return chord;

  const [, root, suffix, bass] = match;

  const newRoot = transposeNote(root, semitones);
  const newBass = bass ? transposeNote(bass, semitones) : null;

  return `${newRoot}${suffix}${newBass ? `/${newBass}` : ""}`;
}

/**
 * Transpõe uma linha de acordes preservando espaços
 */
export function transposeChordLine(line: string, semitones: number): string {
  return line.replace(
    /\b([A-G](?:#|b)?(?:maj|min|m|sus|dim|aug|add|M)?[0-9]*(?:\([^)]+\))?(?:\/[A-G](?:#|b)?)?)\b/g,
    (match) => transposeChord(match, semitones)
  );
}

/**
 * Calcula diferença entre tom atual e novo tom
 */
export function getSemitoneDistance(fromKey: string, toKey: string): number {
  const from = NOTE_INDEX[normalizeNote(fromKey)];
  const to = NOTE_INDEX[normalizeNote(toKey)];

  if (from === undefined || to === undefined) return 0;
  return to - from;
}

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

export function normalizeChordToken(token: string): string {
  let t = token.trim();

  // Correções específicas da sua cifra
  if (/^FIG$/i.test(t)) return "F/G";
  if (/^BdimlD$/i.test(t)) return "Bdim/D";

  // Corrige acordes simples em minúsculo
  if (/^[a-g]$/.test(t)) return t.toUpperCase();

  // Ex: am -> Am, em -> Em
  if (/^[a-g](maj|min|m|sus|dim|aug|7|9|11|13|2|4|5|6)$/i.test(t)) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  // Ex: f/g -> F/G
  if (/^[a-g](maj|min|m|sus|dim|aug|7|9|11|13|2|4|5|6)*(\/[a-g][#b]?)?$/i.test(t)) {
    return t.charAt(0).toUpperCase() + t.slice(1).replace(/\/([a-g])/, (_, n) => "/" + n.toUpperCase());
  }

  return t;
}

export function isChordLine(line: string): boolean {
  const trimmed = line.trim();

  if (!trimmed) return false;
  if (/^Tom:/i.test(trimmed)) return false;
  if (/^!Refrão$/i.test(trimmed)) return false;
  if (trimmed === "---Refrão---") return false;
  const chordPattern = /^[A-G](#|b)?(maj|min|m|sus|dim|aug|7|9|11|13|2|4|5|6)*(\/[A-G](#|b)?)?$/;
  const words = trimmed.split(/\s+/);
  if (!words.length) return false;
  let chordCount = 0;
  let nonChordCount = 0;

  for (const w of words) {
    const clean = w.replace(/[,;:!?]$/, "");
    const normalized = normalizeChordToken(clean);
    if (chordPattern.test(normalized)) {
      chordCount++;
    } else {
      nonChordCount++;
    }
  }

  const ratio = chordCount / words.length;
  if (nonChordCount >= 3 && chordCount <= 2) return false;
  if (words.length <= 4 && chordCount >= 1 && ratio >= 0.5) return true;
  return ratio >= 0.6 && chordCount >= 2;
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

//Alterar TOM!!!! No botão TOM alterar OS TONS!!!!
/* export function ChangeTone() {
  ...
} */