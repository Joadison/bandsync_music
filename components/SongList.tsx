"use client";

import { Song } from "@/lib/types";
import styles from "./Songlist.module.css";
import { useMemo, useState } from "react";

interface Props {
  songs: Song[];
  currentIndex: number;
  onSelect: (idx: number) => void;
}

export default function SongList({ songs, currentIndex, onSelect }: Props) {
  const [expandedArtists, setExpandedArtists] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  
  // Agrupa as músicas por artista
  const groupedSongs = useMemo(() => {
    const groups: { [artist: string]: Song[] } = {};
    
    songs.forEach((song) => {
      const artist = song.artist;
      if (!groups[artist]) {
        groups[artist] = [];
      }
      groups[artist].push(song);
    });
    
    return groups;
  }, [songs]);

  // Filtra artistas e músicas baseado no termo de busca
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) {
      return groupedSongs;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered: { [artist: string]: Song[] } = {};
    
    Object.entries(groupedSongs).forEach(([artist, artistSongs]) => {
      // Verifica se o artista corresponde à busca
      const artistMatches = artist.toLowerCase().includes(term);
      
      // Filtra as músicas do artista que correspondem à busca
      const matchingSongs = artistSongs.filter(song => 
        song.title.toLowerCase().includes(term)
      );
      
      // Inclui o artista se:
      // 1. O nome do artista corresponde, mostra todas as músicas
      // 2. Alguma música do artista corresponde, mostra apenas as músicas que correspondem
      if (artistMatches) {
        filtered[artist] = artistSongs;
      } else if (matchingSongs.length > 0) {
        filtered[artist] = matchingSongs;
      }
    });
    
    return filtered;
  }, [groupedSongs, searchTerm]);

  // Expande automaticamente os artistas que têm resultados na busca
  useMemo(() => {
    if (searchTerm.trim()) {
      const artistsToExpand = new Set(Object.keys(filteredGroups));
      setExpandedArtists(artistsToExpand);
    }
  }, [filteredGroups, searchTerm]);

  // Alterna a expansão de um artista
  const toggleArtist = (artist: string) => {
    setExpandedArtists(prev => {
      const newSet = new Set(prev);
      if (newSet.has(artist)) {
        newSet.delete(artist);
      } else {
        newSet.add(artist);
      }
      return newSet;
    });
  };

  // Expande todos os artistas
  const expandAll = () => {
    const allArtists = new Set(Object.keys(filteredGroups));
    setExpandedArtists(allArtists);
  };

  // Colapsa todos os artistas
  const collapseAll = () => {
    setExpandedArtists(new Set());
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

  // Mantém o índice global para saber qual música está tocando
  let globalIndex = 0;
  
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
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Pesquisar artista ou música..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button onClick={clearSearch} className={styles.clearBtn}>
              ✕
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
            <span>🔍</span>
            <p>Nenhum resultado encontrado para "{searchTerm}"</p>
            <button onClick={clearSearch} className={styles.clearSearchBtn}>
              Limpar busca
            </button>
          </div>
        ) : (
          Object.entries(filteredGroups).map(([artist, artistSongs]) => {
            const isExpanded = expandedArtists.has(artist);
            
            return (
              <div key={artist} className={styles.artistGroup}>
                <button
                  className={styles.artistHeader}
                  onClick={() => toggleArtist(artist)}
                >
                  <div className={styles.artistInfo}>
                    <span className={styles.expandIcon}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <span className={styles.artistName}>{artist}</span>
                  </div>
                  <span className={styles.artistCount}>
                    {artistSongs.length} música{artistSongs.length !== 1 ? "s" : ""}
                  </span>
                </button>
                
                {isExpanded && (
                  <div className={styles.songsList}>
                    {artistSongs.map((song, idx) => {
                      const currentGlobalIndex = globalIndex++;
                      // Destaca o termo de busca no título da música
                      const highlightTitle = (title: string, term: string) => {
                        if (!term) return title;
                        const parts = title.split(new RegExp(`(${term})`, 'gi'));
                        return parts.map((part, i) => 
                          part.toLowerCase() === term.toLowerCase() ? 
                            <mark key={i} className={styles.highlight}>{part}</mark> : 
                            part
                        );
                      };
                      
                      return (
                        <button
                          key={song.id ?? `${artist}-${idx}`}
                          className={`${styles.item} ${currentGlobalIndex === currentIndex ? styles.active : ""}`}
                          onClick={() => onSelect(currentGlobalIndex)}
                        >
                          <span className={styles.num}>
                            {String(currentGlobalIndex + 1).padStart(2, "0")}
                          </span>
                          <div className={styles.info}>
                            <span className={styles.title}>
                              {highlightTitle(song.title, searchTerm)}
                            </span>
                          </div>
                          {currentGlobalIndex === currentIndex && (
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