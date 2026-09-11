# video-music-downloader

[English](README.md) · **Français** · [Español](README.es.md) · [Português (BR)](README.pt-BR.md) · [Deutsch](README.de.md) · [Italiano](README.it.md)

Site web simple (Node.js + Express) pour télécharger des vidéos **YouTube**, **Facebook**
et **Instagram** en **MP4** ou **MP3**.

- On colle un lien, le site analyse la vidéo et affiche les qualités disponibles.
- YouTube : choix de la résolution (jusqu'à la meilleure disponible) + option MP3.
- Facebook / Instagram : téléchargement MP4 (meilleure qualité) + option MP3.
- Si la vidéo exige une connexion (contenu privé, réservé aux membres, limite d'âge,
  vérification anti-robot, story Instagram, vidéo Facebook non publique), le site l'indique
  clairement au lieu de planter.

## Langues

L'interface est disponible en **français, anglais, espagnol, portugais du Brésil,
allemand et italien**. À la première visite, l'application suit la langue du navigateur ;
si celle-ci n'est pas prise en charge, elle bascule sur l'**anglais**. Un sélecteur de
langue en haut de page permet de forcer le choix, qui est ensuite mémorisé (dans le
`localStorage`).

## Fonctionnement

- [`yt-dlp`](https://github.com/yt-dlp/yt-dlp) fait l'extraction et le téléchargement.
  Le binaire est installé automatiquement par la dépendance `youtube-dl-exec`.
- [`ffmpeg`](https://ffmpeg.org/) fusionne l'audio + la vidéo et convertit en MP3.
  Le binaire vient de la dépendance `ffmpeg-static` (aucune installation système requise).
- Le serveur ne stocke rien de façon permanente : `yt-dlp` écrit un fichier temporaire,
  le serveur le streame vers le navigateur puis le supprime une fois le transfert terminé.

## Prérequis

- Node.js 18 ou plus.
- **Mac / Linux uniquement :** un **Python 3.10 ou plus** installé sur le système. Sur ces
  plateformes, le binaire `yt-dlp` installé a besoin d'un interpréteur Python séparé pour
  fonctionner (le build Windows est autonome, donc ça ne s'applique pas là). Vérifier avec
  `python3 --version` ; sur Mac, `brew install python3` si la version est trop vieille.

## Installation

```bash
npm install
```

Si les binaires ne se téléchargent pas (scripts d'install bloqués) :

```bash
node node_modules/ffmpeg-static/install.js
node node_modules/youtube-dl-exec/scripts/postinstall.js
```

## Lancement

```bash
npm start
```

Puis ouvrir http://localhost:3000

Variables d'environnement :

- `PORT` : port d'écoute (défaut `3000`).

## Limites connues

| Plateforme | Sans connexion |
|---|---|
| YouTube | La plupart des vidéos publiques. Bloqué : limite d'âge, vidéo privée, vérification anti-robot ponctuelle. |
| Facebook | Vidéos **publiques** uniquement. Tout contenu privé / groupe / réservé aux amis exige des cookies de connexion. |
| Instagram | Reels et posts publics passent parfois ; Instagram impose souvent une connexion même pour du public. Stories : connexion **toujours** requise. |

## Note légale

Outil destiné à un usage personnel. Télécharger du contenu tiers peut enfreindre les
conditions d'utilisation des plateformes et le droit d'auteur selon l'usage qui en est fait.
