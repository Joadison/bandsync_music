export interface Paragraph {
  number: number;
  description: string;
  text: string;
  translations: null | Record<string, string>;
}

export interface Lyrics {
  full_text: string;
  paragraphs: Paragraph[];
}

export interface Cifra {
  tipo: string;
  url?: string;
  tom?: string | null;
  conteudo: string;
}

export interface Song {
  id: number;
  categoria: Categorias;
  title: string;
  artist: string;
  author?: string;
  language?: string;
  lyrics: Lyrics;
  cifra?: string | null;
  cifras?: Cifra[] | null;
}

export type Categorias = "Harpa" | "Corinhos" | "Louvor" | "Adoração" | "Gospel" | "Infantil" | "Outros";