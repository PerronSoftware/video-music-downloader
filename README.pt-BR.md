# video-music-downloader

[English](README.md) · [Français](README.fr.md) · [Español](README.es.md) · **Português (BR)** · [Deutsch](README.de.md) · [Italiano](README.it.md)

Aplicação web simples (Node.js + Express) para baixar vídeos do **YouTube**,
**Facebook** e **Instagram** em **MP4** ou **MP3**.

- Cole um link, o site analisa o vídeo e mostra as qualidades disponíveis.
- YouTube: escolha a resolução (até a melhor disponível) + opção MP3.
- Facebook / Instagram: download em MP4 (melhor qualidade) + opção MP3.
- Se o vídeo exigir login (conteúdo privado, exclusivo para membros, com restrição
  de idade, verificação anti-robô, story do Instagram, vídeo não público do
  Facebook), o site avisa claramente em vez de travar.

## Idiomas

A interface está disponível em **francês, inglês, espanhol, português do Brasil,
alemão e italiano**. Na primeira visita, o aplicativo segue o idioma do navegador;
se ele não for suportado, usa o **inglês** como padrão. Um seletor de idioma no
topo da página permite forçar a escolha, que depois é lembrada (armazenada no
`localStorage`).

## Como funciona

- O [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) faz a extração e o download.
  O binário é instalado automaticamente pela dependência `youtube-dl-exec`.
- O [`ffmpeg`](https://ffmpeg.org/) junta o áudio + o vídeo e converte para MP3.
  O binário vem da dependência `ffmpeg-static` (nenhuma instalação no sistema é necessária).
- O servidor não armazena nada de forma permanente: o `yt-dlp` grava um arquivo
  temporário, o servidor o transmite ao navegador e o exclui assim que a transferência termina.

## Pré-requisitos

- Node.js 18 ou superior.

## Instalação

```bash
npm install
```

Se os binários não forem baixados (scripts de instalação bloqueados):

```bash
node node_modules/ffmpeg-static/install.js
node node_modules/youtube-dl-exec/scripts/postinstall.js
```

## Execução

```bash
npm start
```

Depois abra http://localhost:3000

Variáveis de ambiente:

- `PORT`: porta de escuta (padrão `3000`).

## Limitações conhecidas

| Plataforma | Sem login |
|---|---|
| YouTube | A maioria dos vídeos públicos. Bloqueado: restrição de idade, vídeos privados, verificação anti-robô ocasional. |
| Facebook | Apenas vídeos **públicos**. Qualquer conteúdo privado / de grupo / somente para amigos exige cookies de login. |
| Instagram | Reels e posts públicos às vezes funcionam; o Instagram muitas vezes exige login mesmo para conteúdo público. Stories: login **sempre** obrigatório. |

## Nota legal

Ferramenta destinada a uso pessoal. Baixar conteúdo de terceiros pode violar os
termos de uso das plataformas e a lei de direitos autorais, dependendo do uso que
for feito.
