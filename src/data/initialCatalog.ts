import { Playlist, Track } from '../types/music';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Chuva na Cidade',
    artist: 'Sofia Lima & Nocturne Drift',
    album: 'Nocturne Drift: Rain Reflections',
    duration: 65,
    coverUrl: '/src/assets/images/album_midnight_vibes_1793144450565.jpg',
    genre: 'Lo-Fi Chill & MPB',
    year: 2026,
    colorAccent: 'from-indigo-600 to-purple-900',
    plays: 1420,
    isFavorite: true,
    synthPreset: 'lofi',
    fileSizeMB: 5.6,
    lyricsLRC: `[00:00.00] (Intro instrumental suave de piano e chuva)
[00:04.50] Luzes de néon refletem no asfalto molhado
[00:09.20] O café da esquina acabou de fechar
[00:14.00] Passo devagar com meu casaco cinzento
[00:18.80] Olhando a cidade respirar devagar
[00:23.50] O som da garoa no guarda-chuva aberto
[00:28.00] Traz aquela lembrança que não quer passar
[00:33.20] Mas a noite acolhe quem sabe escutar
[00:38.00] O compasso tranquilo do vento a passar
[00:43.00] (Solo instrumental de Rhodes com eco suave)
[00:51.50] Amanhã o sol volta a brilhar na avenida
[00:56.50] Mas agora o silêncio é a melhor canção
[01:01.00] Boa noite, cidade... até amanhã.`,
  },
  {
    id: 'track-2',
    title: 'Horizonte Neon',
    artist: 'Cyber Sunset & Neon Voyagers',
    album: 'Synthetic Dreams: 1984 Revisited',
    duration: 65,
    coverUrl: '/src/assets/images/album_cyber_synth_1793144452016.jpg',
    genre: 'Synthwave & Retrowave',
    year: 2026,
    colorAccent: 'from-fuchsia-600 to-cyan-900',
    plays: 2890,
    isFavorite: true,
    synthPreset: 'synthwave',
    fileSizeMB: 5.8,
    lyricsLRC: `[00:00.00] (Batida eletrônica pulsante e arpejos analógicos)
[00:04.00] Acelerando na pista sem olhar pra trás
[00:08.50] Painel digital marcando a rota estelar
[00:13.20] Raios magenta cortando a escuridão
[00:17.50] A frequência do futuro toca no coração
[00:22.00] Linhas de laser, horizonte sem fim
[00:26.50] Se você quer voar, vem comigo enfim
[00:31.00] Sintetizadores ecoam na atmosfera
[00:35.80] Não há gravidade nessa nova era!
[00:40.50] (Breakdown eletrizante com solo de sintetizador)
[00:49.00] Cidade cibernética acordando em neon
[00:53.80] Sentindo a energia do mais puro som
[00:59.00] Somos viajantes do espaço infinito!`,
  },
  {
    id: 'track-3',
    title: 'Bossa da Tarde',
    artist: 'Trio Rio Azul',
    album: 'Avenida Atlântica: The Ipanema Sound',
    duration: 65,
    coverUrl: '/src/assets/images/album_bossa_sol_1793144458297.jpg',
    genre: 'Bossa Nova & Jazz',
    year: 2026,
    colorAccent: 'from-amber-500 to-teal-800',
    plays: 980,
    isFavorite: false,
    synthPreset: 'bossa',
    fileSizeMB: 5.4,
    lyricsLRC: `[00:00.00] (Violão de nylon suave e ritmo sincopado)
[00:04.20] Olha que tarde bonita que veio me ver
[00:09.50] A brisa do mar convidando a sorrir
[00:14.80] Um gole de café, a calma do entardecer
[00:20.00] Não tenho pressa de ir a lugar algum
[00:25.20] As ondas conversam com o calçadão
[00:30.40] E o sol doura o tempo no meu coração
[00:35.80] Quem tem harmonia não tem solidão
[00:41.00] Faz de qualquer esquina uma canção
[00:46.00] (Harmonia delicada com baixo acústico e cordas)
[00:54.00] O céu vai ficando azul e lilás
[00:59.20] Essa bossa mansa é tudo que me traz paz.`,
  },
  {
    id: 'track-4',
    title: 'Noite Acústica',
    artist: 'Lucas Brandão',
    album: 'Canções da Janela Aberta',
    duration: 65,
    coverUrl: '/src/assets/images/album_acoustic_sunset_1793144462564.jpg',
    genre: 'Indie Folk Acústico',
    year: 2026,
    colorAccent: 'from-amber-700 to-stone-900',
    plays: 1820,
    isFavorite: true,
    synthPreset: 'acoustic',
    fileSizeMB: 5.5,
    lyricsLRC: `[00:00.00] (Dedilhado suave de violão acústico)
[00:05.20] Deixei a janela aberta pro vento entrar
[00:10.50] Com o caderno na mão comecei a cantar
[00:16.00] Histórias simples guardadas no peito
[00:21.20] Coisas que a gente não sabe direito
[00:26.50] Mas quando a corda vibra com emoção
[00:31.80] Tudo se ajeita numa oração
[00:37.00] A xícara esfria em cima da mesa
[00:42.50] Mas a música é pura certeza
[00:47.80] (Solo de violão intimista e acolhedor)
[00:55.00] A noite acende estrelas lá fora
[01:00.50] E a alma se aquieta na hora.`,
  },
];

export const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-chill-night',
    name: 'Madrugadas Tranquilas',
    description: 'Faixas lo-fi acolhedoras e sons acústicos para estudar, relaxar ou dormir.',
    gradient: 'from-indigo-600 via-purple-700 to-slate-900',
    trackIds: ['track-1', 'track-4'],
    createdAt: '2026-10-20',
  },
  {
    id: 'pl-synth-energy',
    name: 'Energia Neon & Foco',
    description: 'Vaporwave acelerado, sintetizadores retro e ritmo pulsante para alta produtividade.',
    gradient: 'from-fuchsia-600 via-pink-600 to-violet-950',
    trackIds: ['track-2'],
    createdAt: '2026-10-22',
  },
  {
    id: 'pl-bossa-vibes',
    name: 'Tarde de Sol & Bossa',
    description: 'Acústica brasileira e melodias suaves inspiradas no litoral do Rio de Janeiro.',
    gradient: 'from-amber-500 via-orange-600 to-teal-900',
    trackIds: ['track-3', 'track-4'],
    createdAt: '2026-10-24',
  },
];
