# video-music-downloader

[English](README.md) · [Français](README.fr.md) · **Español** · [Português (BR)](README.pt-BR.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

Aplicación web sencilla (Node.js + Express) para descargar vídeos de **YouTube**,
**Facebook** e **Instagram** en **MP4** o **MP3**.

- Pega un enlace, el sitio analiza el vídeo y muestra las calidades disponibles.
- YouTube: elige la resolución (hasta la mejor disponible) + opción MP3.
- Facebook / Instagram: descarga MP4 (mejor calidad) + opción MP3.
- Si el vídeo requiere iniciar sesión (contenido privado, solo para miembros,
  restringido por edad, verificación anti-robot, historia de Instagram, vídeo de
  Facebook no público), el sitio lo indica claramente en lugar de fallar.

## Idiomas

La interfaz está disponible en **francés, inglés, español, portugués de Brasil,
alemán e italiano**. En la primera visita, la aplicación sigue el idioma del
navegador; si no es compatible, recurre al **inglés**. Un selector de idioma en la
parte superior de la página permite forzar la elección, que luego se recuerda
(guardada en `localStorage`).

## Cómo funciona

- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) se encarga de la extracción y la descarga.
  El binario lo instala automáticamente la dependencia `youtube-dl-exec`.
- [`ffmpeg`](https://ffmpeg.org/) combina el audio + el vídeo y convierte a MP3.
  El binario proviene de la dependencia `ffmpeg-static` (no requiere instalación en el sistema).
- El servidor no almacena nada de forma permanente: `yt-dlp` escribe un archivo
  temporal, el servidor lo transmite al navegador y lo elimina cuando termina la transferencia.

## Requisitos

- Node.js 18 o superior.

## Instalación

```bash
npm install
```

Si los binarios no se descargan (scripts de instalación bloqueados):

```bash
node node_modules/ffmpeg-static/install.js
node node_modules/youtube-dl-exec/scripts/postinstall.js
```

## Ejecución

```bash
npm start
```

Luego abre http://localhost:3000

Variables de entorno:

- `PORT`: puerto de escucha (por defecto `3000`).

## Limitaciones conocidas

| Plataforma | Sin iniciar sesión |
|---|---|
| YouTube | La mayoría de los vídeos públicos. Bloqueado: restricción de edad, vídeos privados, verificación anti-robot ocasional. |
| Facebook | Solo vídeos **públicos**. Cualquier contenido privado / de grupo / solo para amigos requiere cookies de sesión. |
| Instagram | Los reels y publicaciones públicos a veces funcionan; Instagram suele exigir iniciar sesión incluso para contenido público. Historias: sesión **siempre** obligatoria. |

## Nota legal

Herramienta destinada a un uso personal. Descargar contenido de terceros puede
infringir las condiciones de uso de las plataformas y la ley de derechos de autor
según el uso que se le dé.
