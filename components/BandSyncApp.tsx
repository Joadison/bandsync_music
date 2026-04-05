"use client";

import { useCallback, useRef, useState } from "react";
import { Song } from "@/lib/types";
import { detectTom } from "@/lib/utils";
import { useAutoScroll } from "@/lib/useAutoScroll";
import SongList from "./SongList";
import CifraViewer from "./CifraViewer";
import styles from "./BandSyncApp.module.css";
import { ChevronLeftIcon, ChevronRightIcon, MenuIcon, MicVocalIcon, Music4Icon, PauseIcon, PencilRulerIcon, RefreshCcwIcon, RewindIcon, UploadIcon, XIcon } from "lucide-react";

type Mode = "banda" | "vocal";

interface Props {
  initialSongs: Song[];
}

export default function BandSyncApp({ initialSongs }: Props) {
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>("banda");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  //const [saving, setSaving] = useState(false);

  const areaRef = useRef<HTMLDivElement>(null);
  const {
    scrolling,
    progress,
    speed,
    setSpeed,
    speedOptions,
    toggle: toggleScroll,
    reset: resetScroll,
    updateProgress,
  } = useAutoScroll(areaRef as React.RefObject<HTMLElement>);

  const currentSong = songs[currentIndex];
  const tom = detectTom(currentSong.cifras?.[0]?.tom ?? "");

  const handleSelect = useCallback(
    (idx: number) => {
      setCurrentIndex(idx);
      resetScroll();
      if (areaRef.current) areaRef.current.scrollTop = 0;
    },
    [resetScroll]
  );

  const handleFileLoad = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          const arr: Song[] = Array.isArray(parsed) ? parsed : [parsed];
          setSongs(arr);
          setCurrentIndex(0);
          resetScroll();
          if (areaRef.current) areaRef.current.scrollTop = 0;
        } catch {
          alert("Erro ao ler JSON. Verifique o formato do arquivo.");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [resetScroll]
  );

  const handleLoadSample = () => {
    setCurrentIndex(0);
    resetScroll();
  };

  /* const handleEdit = () => {
    if (!currentSong?.cifras?.[0]) return;
    setEditedContent(currentSong.cifras[0].conteudo || "");
    setEditing(true);
  }; */ 

  /* const handleSaveLocal = () => {
    if (!currentSong?.cifras?.[0]) return;

    const updatedSongs = [...songs];
    updatedSongs[currentIndex] = {
      ...updatedSongs[currentIndex],
      cifras: updatedSongs[currentIndex].cifras.map((cifra, idx) =>
        idx === 0
          ? {
              ...cifra,
              conteudo: editedContent,
            }
          : cifra
      ),
    };

    setSongs(updatedSongs);
    setEditing(false);
  }; */ 

  /* const handleSaveJson = async () => {
    if (!currentSong?.cifras?.[0]) return;

    const updatedSongs = [...songs];
      updatedSongs[currentIndex] = {
        ...updatedSongs[currentIndex],
        cifras: updatedSongs[currentIndex].cifras.map((cifra, idx) =>
          idx === 0
            ? {
                ...cifra,
                conteudo: editedContent,
              }
            : cifra
        ),
      };

      setSongs(updatedSongs);
      setSaving(true);

      try {
        const res = await fetch("/api/save-songs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSongs),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Erro ao salvar");
        }

        alert("JSON salvo com sucesso!");
        setEditing(false);
      } catch (error) {
        console.error(error);
        alert("Erro ao salvar o arquivo JSON.");
      } finally {
        setSaving(false);
      }
  }; */

  return (
    <div className={styles.app}>
      {/* SIDEBAR */}
      <div className={`${styles.sidebarWrap} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <SongList 
          songs={songs} 
          currentIndex={currentIndex} 
          onSelect={handleSelect}
        />
      </div>

      {/* MAIN */}
      <div className={styles.main}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen((o) => !o)} title="Alternar menu">
              {sidebarOpen ? <XIcon /> : <MenuIcon />}
            </button>
            <div className={styles.songMeta}>
              {currentSong ? (
                <>
                  <p className={styles.metaArtist}>{currentSong.artist}</p>
                  <h1 className={styles.metaTitle}>{currentSong.title} - {currentSong.id}</h1>
                </>
              ) : (
                <h1 className={styles.metaTitle}>BandSync Gospel</h1>
              )}
            </div>
          </div>

          <div className={styles.headerRight}>
            {currentSong && (
              <div className={styles.tomBadge}>
                <span className={styles.tomBadgeLabel}>TOM</span>
                <span className={styles.tomBadgeValue}>{tom}</span>
              </div>
            )}
            <div className={styles.mainGroup}>
              <label className={styles.sampleBtn}>
                <UploadIcon className="w-4" />
                JSON
                <input type="file" accept=".json" onChange={handleFileLoad} style={{ display: "none" }} />
              </label>
              {songs.length === 0 && ( 
                <button className={styles.sampleBtn} onClick={handleLoadSample}>
                  <RefreshCcwIcon className="w-4"/> Recarregar
                </button>
              )}
              {/* {currentSong?.cifras?.[0] && (
                <button className={styles.sampleBtn} onClick={handleEdit}>
                 <PencilRulerIcon className="w-4"/> Editar 
                </button>
              )}  */}
            </div>
          </div>
        </header>

        {/* PROGRESS BAR */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        {/* PERFORMANCE AREA */}
        <div
          className={styles.perfArea}
          ref={areaRef}
          onScroll={updateProgress}
        >
          {!currentSong ? ( 
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>𝄞</div>
              <h2>BandSync Gospel</h2>
              <p>Carregue um arquivo <code>.json</code> ou clique em <strong>Exemplo</strong> para começar</p>
            </div>
           ) : editing ? (
            <div className={styles.editorWrap}>
              <textarea
                className={styles.editorTextarea}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                spellCheck={false}
              />
              <div className={styles.editorActions}>
                <button className={styles.ctrlBtn} onClick={() => setEditing(false)}>
                  Cancelar
                </button>
                {/* <button className={styles.ctrlBtn} onClick={handleSaveJson} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar JSON"}
                </button> */}
              </div>
            </div>
          ) : (
            <CifraViewer song={currentSong} mode={mode} />
          )}
          {/* {!currentSong ? ( 
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>𝄞</div>
              <h2>BandSync Gospel</h2>
              <p>Carregue um arquivo <code>.json</code> ou clique em <strong>Exemplo</strong> para começar</p>
            </div>
           ) : editing ? (
            <div className={styles.editorWrap}>
              <textarea
                className={styles.editorTextarea}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                spellCheck={false}
              />
              <div className={styles.editorActions}>
                <button className={styles.ctrlBtn} onClick={() => setEditing(false)}>
                  Cancelar
                </button>
                <button className={styles.ctrlBtn} onClick={handleSaveJson} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar JSON"}
                </button> 
              </div>
            </div>
          ) : (
            <CifraViewer song={currentSong} mode={mode} />
          )} */}
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.controls}>
            <button
              className={`${styles.ctrlBtn} ${mode === "banda" ? styles.ctrlActive : ""}`}
              onClick={() => setMode("banda")}
            >
              <Music4Icon className="w-5"/>
              Banda
            </button>
            <button
              className={`${styles.ctrlBtn} ${mode === "vocal" ? styles.ctrlActive : ""}`}
              onClick={() => setMode("vocal")}
            >
              <MicVocalIcon className="w-5"/>
              Vocal
            </button>
            <div className={styles.divider} />
            <button
              className={`${styles.ctrlBtn} ${scrolling ? styles.ctrlActive : ""}`}
              onClick={toggleScroll}
            >
              {scrolling ? (
                <>
                  <PauseIcon className="w-4"/>
                  Pausar
                </>
              ) : (
                <>
                  <RewindIcon className="-rotate-90 w-4"/>
                  Auto-Scroll
                </>
              )}
            </button>

            <div className={styles.speedControl}>
              <span className={styles.speedLabel}>Velocidade</span>
              <select
                className={styles.speedSelect}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                {speedOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}x
                  </option>
                ))}
              </select>
            </div>
            
            {songs.length > 0 && (
              <>
                <div className={styles.divider} />
                <button
                  className={styles.ctrlBtn}
                  onClick={() => handleSelect(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeftIcon className="w-5" /> Anterior
                </button>
                <span className={styles.counter}>{currentIndex + 1} / {songs.length}</span>
                <button
                  className={styles.ctrlBtn}
                  onClick={() => handleSelect(Math.min(songs.length - 1, currentIndex + 1))}
                  disabled={currentIndex === songs.length - 1}
                >
                  Próxima <ChevronRightIcon className="w-5" /> 
                </button>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}