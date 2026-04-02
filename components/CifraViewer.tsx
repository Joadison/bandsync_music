"use client";

import { useMemo, useState } from "react";
import { expandRefrainReferences, parseCifraLines } from "@/lib/utils";
import { Song } from "@/lib/types";
import styles from "./CifraViewer.module.css";

interface Props {
  song: Song;
  mode: "banda" | "vocal";
}

export default function CifraViewer({ song, mode }: Props) {
  const [version, setVersion] = useState(0);

  
  const rawText = useMemo(() => {
    if (song.cifras?.length) {
      return song.cifras[version]?.conteudo ?? song.cifras[0].conteudo;
    }
    
    return song.lyrics?.full_text ?? "";
  }, [song, version]);
  

  const lines = useMemo(() => {
    const parsed = parseCifraLines(rawText);
    return expandRefrainReferences(parsed);
  }, [rawText]);

  if (!rawText.trim()) {
    return (
      <div className={styles.empty}>
        <span>🎵</span>
        <p>Letra não disponível para esta música.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.cifrasControl}>
        <select
          className={styles.cifrasSelect}
          value={version}
          onChange={(e) => setVersion(Number(e.target.value))}
        >
          {song.cifras?.map((c, i) => (
            <option key={i} value={i}>
              {c.tipo}
            </option>
          ))}
        </select>
      </div>
      <div className={`${styles.viewer} ${mode === "vocal" ? styles.vocal : styles.banda}`}>
        {lines.map((line, i) => {
          if (line.type === "empty") return <div key={i} className={styles.spacer} />;
          if (line.type === "tom") return null;
          //if (line.type === "tom") {
          //  return (
          //    <div key={i} className={styles.tom}>
          //      <span className={styles.tomLabel}>TOM</span>
          //      <span className={styles.tomValue}>
          //        {line.content.replace(/tom:\s*/i, "")}
          //      </span>
          //    </div>
          //  );
          //} 

          const normalized = line.content?.replace(/[-\s!]/g, "").toLowerCase();
          if (line.type === "refrain" && normalized === "refrão") {
            return null;
          }

          if (line.type === "section") {
            return (
              <div key={i} className={styles.section}>
                {line.content}
              </div>
            );
          }

          if (line.type === "chord") {
            return (
              <div 
                key={i} 
                className={`${line.isRefrain ? styles.chordRefrain : styles.chord}`}
              >
                {line.content}
              </div>
            );
          }

          // Para linhas de letra (lyric)
          return (
            <div 
              key={i} 
              className={`${styles.lyric} ${line.isRefrain ? styles.lyricRefrain : ""}`}
            >
              {line.content}
            </div>
          );
        })}
        <div className={styles.endPad} />
      </div>
    </div>
  );
}