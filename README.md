 Sinfonia

Um player de música moderno, desenvolvido com React e TypeScript, com foco em experiência de reprodução, organização de músicas e recursos offline.

 Sobre o projeto

Sinfonia é uma aplicação web de reprodução e gerenciamento de músicas desenvolvida com React + TypeScript + Vite.

O projeto foi criado com uma arquitetura baseada em componentes e serviços, permitindo organizar playlists, reproduzir faixas, importar arquivos de áudio e armazenar dados localmente no navegador.

A aplicação utiliza IndexedDB para persistência de playlists, músicas importadas e arquivos de áudio disponíveis offline.

 Funcionalidades

 Reprodução de músicas

 Play / Pause

 Próxima faixa

 Faixa anterior

 Reprodução aleatória

 Modos de repetição

 Controle de volume e mute

 Favoritar músicas

 Fila de reprodução

 Criação e gerenciamento de playlists

 Adição e remoção de músicas das playlists

 Reordenação das músicas nas playlists

 Disponibilidade de músicas para reprodução offline

 Armazenamento local utilizando IndexedDB

 Importação de arquivos de áudio locais

 Suporte a letras sincronizadas

 Equalizador

 Temporizador de suspensão (Sleep Timer)

 Modo escuro

 Modo claro

 Visualização do armazenamento utilizado

 Geração procedural de áudio em formato WAV

 Geração de áudio

O projeto possui um sintetizador de áudio baseado na Web Audio API, capaz de gerar faixas musicais proceduralmente.

Entre os presets disponíveis estão:

Lo-Fi

Synthwave

Bossa

Acoustic

Ambient

As faixas podem ser renderizadas como arquivos WAV estéreo PCM 16-bit diretamente no navegador.

 Funcionamento offline

O Sinfonia utiliza IndexedDB para armazenar informações localmente no navegador.

São utilizados diferentes armazenamentos para:

Arquivos de áudio

Playlists

Faixas importadas pelo usuário

Configurações

Isso permite que determinadas músicas sejam disponibilizadas para reprodução mesmo sem conexão com a internet.

🛠️ Tecnologias utilizadas

Front-end

React 19

TypeScript

Vite

Tailwind CSS

Lucide React

Motion

APIs e recursos do navegador

Web Audio API

OfflineAudioContext

IndexedDB

LocalStorage

Storage API

Outras tecnologias

Google GenAI

Express

dotenv

esbuild

 Estrutura do projeto

Sinfonia/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Header
│   │   ├── PlayerBar
│   │   ├── HomeView
│   │   ├── PlaylistsView
│   │   ├── OfflineView
│   │   ├── LyricsView
│   │   ├── EqualizerModal
│   │   ├── SleepTimerModal
│   │   ├── QueueDrawer
│   │   ├── ImportAudioModal
│   │   └── PlaylistModal
│   │
│   ├── data/
│   │   └── initialCatalog
│   │
│   ├── services/
│   │   ├── audioPlayerService
│   │   ├── audioSynthesizer
│   │   └── indexedDbService
│   │
│   ├── types/
│   │   └── music
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts

A estrutura real do projeto possui componentes separados para reprodução, playlists, letras, modo offline, equalizador, fila, importação de áudio e temporizador.

 Como executar o projeto

1. Clone o repositório

git clone https://github.com/Wellinton98/Sinfonia.git

2. Entre na pasta

cd Sinfonia

3. Instale as dependências

npm install

4. Execute em modo de desenvolvimento

npm run dev

O projeto será disponibilizado em:

http://localhost:3000/

5. Criar uma versão de produção

npm run build

6. Visualizar o build

npm run preview

 Verificação de tipos

O projeto possui um script para verificar o TypeScript:

npm run lint

 Interface

O Sinfonia possui suporte a:

Tema claro

Tema escuro

Interface responsiva

Componentização em React

Ícones através do Lucide React

Animações utilizando Motion

O tema escolhido pelo usuário é persistido no navegador através do localStorage.

 Persistência local

As playlists, faixas importadas e arquivos de áudio offline são armazenados utilizando IndexedDB.

O banco utilizado pela aplicação é:

SinfoniaMusicDB_v1

Com estruturas destinadas a:

audio_blobs
playlists
custom_tracks
settings



 Modelo de reprodução

O estado do player controla informações como:

Música atual

Tempo atual

Duração

Volume

Mute

Shuffle

Repeat

Fila

Status de reprodução

As informações das músicas são tipadas através de interfaces TypeScript, incluindo artista, álbum, gênero, ano, duração, letras, favoritos e disponibilidade offline.

 Roadmap

Algumas melhorias que podem ser adicionadas futuramente:

Melhorar suporte para diferentes formatos de áudio

Sincronização de playlists entre dispositivos

Sistema de autenticação

Backend para armazenamento em nuvem

Compartilhamento de playlists

Mais presets de equalização

Melhorias na geração procedural de músicas

Testes automatizados

Deploy em produção

 Autor

Desenvolvido por Wellinton Lima.

GitHub: @Wellinton98

 Licença

Este projeto está em desenvolvimento e pode ser utilizado para fins de estudo e evolução do projeto.
