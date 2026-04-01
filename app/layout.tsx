import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BandSync Music",
  description: "Leitor de cifras e letras para sua banda",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}