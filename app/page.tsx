import { getSongs } from "@/data/musicas";
import BandSyncApp from "@/components/BandSyncApp";

export default function Page() {
  const songs = getSongs();
  return <BandSyncApp initialSongs={songs} />;
}