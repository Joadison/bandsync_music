"use client";

import { Song } from "@/lib/types";
import styles from "./Songlist.module.css";
import { useEffect, useMemo, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";

interface Props {
  songs: Song[];
  currentIndex: number;
  onSelect: (idx: number) => void;
}

export default function SongList({ songs, currentIndex, onSelect }: Props) {
  const [expandedCategorias, setExpandedCategorias] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  
  // Agrupa as músicas por artista
  const groupedSongs = useMemo(() => {
    const groups: { [categoria: string]: { song: Song; originalIndex: number }[] } = {};
    
    songs.forEach((song, index) => {
      const categorias = song.categoria || "Desconecido";
      if (!groups[categorias]) {
        groups[categorias] = [];
      }
      groups[categorias].push({
        song,
        originalIndex: index,
      });
    });
    
    return groups;
  }, [songs]);

  // Filtra artistas e músicas baseado no termo de busca
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) {
      return groupedSongs;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered: { [artist: string]: { song: Song; originalIndex: number }[] } = {};

    Object.entries(groupedSongs).forEach(([artist, artistSongs]) => {
      const artistMatches = artist.toLowerCase().includes(term);

      const matchingSongs = artistSongs.filter(({ song }) =>
        song.title.toLowerCase().includes(term)
      );

      const idSongMatches = artistSongs.filter(({ song }) =>
        String(song.id ?? "").toLowerCase().includes(term)
      );

      const uniqueSongs = [...matchingSongs];

      idSongMatches.forEach((item) => {
        if (!uniqueSongs.some((s) => s.originalIndex === item.originalIndex)) {
          uniqueSongs.push(item);
        }
      });

      if (artistMatches) {
        filtered[artist] = artistSongs;
      } else if (uniqueSongs.length > 0) {
        filtered[artist] = uniqueSongs;
      }
    });

    return filtered;
  }, [groupedSongs, searchTerm]);

  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedCategorias(new Set(Object.keys(filteredGroups)));
    }
  }, [filteredGroups, searchTerm]);

  const toggleCategoria = (categoria: string) => {
    setExpandedCategorias(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoria)) {
        newSet.delete(categoria);
      } else {
        newSet.add(categoria);
      }
      return newSet;
    });
  };

  // Expande todos os artistas
  const expandAll = () => {
    const allCategorias = new Set(Object.keys(filteredGroups));
    setExpandedCategorias(allCategorias);
  };

  // Colapsa todos os artistas
  const collapseAll = () => {
    setExpandedCategorias(new Set());
  };

  // Limpa a busca
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Calcula o total de músicas após o filtro
  const totalFilteredSongs = useMemo(() => {
    return Object.values(filteredGroups).reduce(
      (total, songs) => total + songs.length,
      0
    );
  }, [filteredGroups]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>𝄞</span>
        <div>
          <h3 className={styles.headerTitle}>SETLIST</h3>
          <p className={styles.headerSub}>
            {searchTerm 
              ? `${totalFilteredSongs} de ${songs.length} música${songs.length !== 1 ? "s" : ""}`
              : `${songs.length} música${songs.length !== 1 ? "s" : ""}`
            }
          </p>
        </div>
      </div>

      {/* Campo de pesquisa */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}><SearchIcon /></span>
          <input
            type="text"
            placeholder="Pesquisar artista ou música..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={clearSearch} className={styles.clearBtn}>
              <XIcon/>
            </button>
          )}
        </div>
      </div>

      {songs.length > 0 && (
        <div className={styles.controls}>
          <button onClick={expandAll} className={styles.controlBtn}>
            Expandir todos
          </button>
          <button onClick={collapseAll} className={styles.controlBtn}>
            Recolher todos
          </button>
        </div>
      )}

      <div className={styles.list}>
        {songs.length === 0 ? (
          <div className={styles.empty}>
            <span>📭</span>
            <p>Carregue um arquivo JSON para começar</p>
          </div>
        ) : Object.keys(filteredGroups).length === 0 ? (
          <div className={styles.empty}>
            <span><SearchIcon/></span>
            <p>Nenhum resultado encontrado para &quot;{searchTerm}&quot;</p>
            <button onClick={clearSearch} className={styles.clearSearchBtn}>
              Limpar busca
            </button>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([categoria, artistSongs]) => {
            const isExpanded = expandedCategorias.has(categoria);
            return (
              <div key={categoria} className={styles.artistGroup}>
                <button
                  className={styles.artistHeader}
                  onClick={() => toggleCategoria(categoria)}
                >
                  <div className={styles.artistInfo}>
                    <span className={styles.expandIcon}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span className={styles.artistName}>{categoria}</span>
                  </div>
                  <span className={styles.artistCount}>
                    {artistSongs.length} música{artistSongs.length !== 1 ? "s" : ""}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className={styles.songsList}>
                    {artistSongs.map(({ song, originalIndex }, idx) => {
                      const highlightTitle = (title: string, term: string) => {
                        if (!term) return title;
                        const parts = title.split(new RegExp(`(${term})`, "gi"));
                        return parts.map((part, i) =>
                          part.toLowerCase() === term.toLowerCase() ? (
                            <mark key={i} className={styles.highlight}>
                              {part}
                            </mark>
                          ) : (
                            part
                          )
                        );
                      };

                      return (
                        <button
                          key={song.id ?? `${artist}-${idx}`}
                          className={`${styles.item} ${originalIndex === currentIndex ? styles.active : ""}`}
                          onClick={() => onSelect(originalIndex)}
                        >
                          <span className={styles.num}>
                            {String(song.id ?? originalIndex + 1).padStart(2, "0")}
                          </span>

                          <div className={styles.info}>
                            <span className={styles.title}>
                              {highlightTitle(song.title, searchTerm)}
                            </span>
                          </div>

                          {originalIndex === currentIndex && (
                            <span className={styles.playing}>▶</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}