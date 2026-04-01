# 🎵 BandSync Gospel

Leitor de cifras e letras para bandas gospel, construído com **Next.js 14**.

## Estrutura do Projeto

```
bandsync/
├── app/               → App Router do Next.js (layout, page, globals.css)
├── components/        → Componentes React
│   ├── BandSyncApp    → Componente principal (estado global, layout)
│   ├── SongList       → Sidebar com lista de músicas
│   └── CifraViewer    → Renderizador de cifras e letras
├── lib/               → Lógica compartilhada
│   ├── types.ts       → Tipos TypeScript (Song, Lyrics, Paragraph...)
│   ├── utils.ts       → Detecção de acordes, slugify, parser de linhas
│   └── useAutoScroll  → Hook de auto-scroll com barra de progresso
├── scraper/
│   └── index.mjs      → Script Node.js para capturar do CifraClub
└── public/            → Arquivos estáticos (musicas.json vai aqui)
```

## Primeiros Passos

### 1. Instalar dependências

```bash
npm install
```

### 2. Rodar o servidor de desenvolvimento

```bash
npm run dev
# Acesse: http://localhost:3000
```

### 3. Usar o Scraper

Crie um arquivo `musicas.txt` na raiz do projeto:

```txt
Deus Velará Por Ti - Harpa Cristã
Cristo Cura, Sim! - Harpa Cristã
Ó Cristão, Eia Avante - Harpa Cristã
```

Execute o scraper:

```bash
npm run scraper
```

O arquivo `public/musicas.json` será gerado automaticamente.  
Na UI, clique em **JSON** e carregue o arquivo gerado.

## Formato do JSON

```json
[
  {
    "id": 1,
    "title": "Nome da Música",
    "artist": "Nome do Artista",
    "language": "pt-BR",
    "lyrics": {
      "full_text": "letra completa...",
      "paragraphs": [{ "number": 1, "text": "verso..." }]
    },
    "cifra": "Tom: G\n\nG  D  Em  C\nLetra da música..."
  }
]
```

## Modos de Visualização

| Modo       | Descrição                              |
|------------|----------------------------------------|
| **Banda**  | Exibe acordes (em amarelo) + letra     |
| **Vocal**  | Oculta acordes, amplia a letra         |

## Scripts Disponíveis

| Comando             | Descrição                            |
|---------------------|--------------------------------------|
| `npm run dev`       | Servidor de desenvolvimento          |
| `npm run build`     | Build de produção                    |
| `npm run start`     | Iniciar em produção                  |
| `npm run scraper`   | Capturar músicas do Cifra Club       |"# bandsync_music" 
