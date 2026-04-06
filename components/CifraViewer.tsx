"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { detectTom, expandRefrainReferences, getSemitoneDistance, parseCifraLines, transposeChordLine } from "@/lib/utils";
import { Song } from "@/lib/types";
import styles from "./CifraViewer.module.css";
import { ChangeTone } from "./ChangeTone";

interface Props {
  song: Song;
  mode: "banda" | "vocal";
}

export default function CifraViewer({ song, mode }: Props) {
  const [version, setVersion] = useState(0);
  const [selectedTom, setSelectedTom] = useState<string>("");
  
  const [showControls, setShowControls] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const rawText = useMemo(() => {
    if (song.cifras?.length) {
      return song.cifras[version]?.conteudo ?? song.cifras[0].conteudo;
    }
    
    return song.lyrics?.full_text ?? "";
  }, [song, version]);

  // Detecta tom original
  const originalTom = useMemo(() => {
    const cifraTom = song.cifras?.[version]?.tom ?? "";
    return detectTom(cifraTom || rawText);
  }, [song, version, rawText]);
  
  const effectiveTom = selectedTom || originalTom;

  const semitones = useMemo(() => {
    if (!originalTom || originalTom === "---" || !effectiveTom || effectiveTom === "---") {
      return 0;
    }
    return getSemitoneDistance(originalTom, effectiveTom);
  }, [originalTom, effectiveTom]);

  const lines = useMemo(() => {
    const parsed = parseCifraLines(rawText);
    const expanded = expandRefrainReferences(parsed);

    if (semitones === 0) return expanded;

    return expanded.map((line) => {
      if (line.type === "chord") {
        return {
          ...line,
          content: transposeChordLine(line.content, semitones),
        };
      }

      if (line.type === "tom") {
        return {
          ...line,
          content: `Tom: ${effectiveTom}`,
        };
      }

      return line;
    });
  }, [rawText, semitones, effectiveTom]);

  // Função para mostrar controles temporariamente
  const showControlsTemporarily = () => {
    setShowControls(true);
    
    // Limpa timeout anterior
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Esconde controles após 2 segundos se não houver interação
    scrollTimeoutRef.current = setTimeout(() => {
      if (!isScrolling) {
        setShowControls(false);
      }
    }, 2000);
  };

  // Handler para scroll
  const handleScroll = () => {
    setIsScrolling(true);
    setShowControls(false);
    
    // Limpa timeout anterior
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Quando parar de rolar, mostra controles temporariamente
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      setShowControls(true);
      
      // Esconde novamente após 2 segundos
      scrollTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }, 150);
  };

  // Handler para clique na área do viewer
  const handleViewerClick = () => {
    if (showControls) {
      setShowControls(false);
    } else {
      showControlsTemporarily();
    }
  };

  // Efeito para adicionar/remover listener de scroll
  useEffect(() => {
    const viewerElement = viewerRef.current?.parentElement?.parentElement;
    
    if (viewerElement) {
      viewerElement.addEventListener('scroll', handleScroll);
      return () => {
        viewerElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  // Limpa timeout ao desmontar
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);
  if (!rawText.trim()) {
    return (
      <div className={styles.empty}>
        <span>🎵</span>
        <p>Letra não disponível para esta música.</p>
      </div>
    );
  }

  return (
    <div  className={styles.cifraContainer}>
      <div ref={controlsRef} className={`${styles.cifrasControl} ${showControls ? styles.controlsVisible : styles.controlsHidden}`}>
        <select
          className={styles.cifrasSelect}
          value={version}
          onChange={(e) => {
            setVersion(Number(e.target.value));
            setSelectedTom(""); 
            showControlsTemporarily();
          }}
        >
          {song.cifras?.map((c, i) => (
            <option key={i} value={i}>
              {c.tipo}
            </option>
          ))}
        </select>
        <ChangeTone
          originalKey={originalTom}
          selectedKey={effectiveTom}
          onChange={(tom) => {
            setSelectedTom(tom);
            showControlsTemporarily();
          }}
        />
      </div>
      <div ref={viewerRef} className={`${styles.viewer} ${mode === "vocal" ? styles.vocal : styles.banda}`} onClick={handleViewerClick}>
        {lines.map((line, i) => {
          if (line.type === "empty") return <div key={i} className={styles.spacer} />;
          if (line.type === "tom") return null;
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