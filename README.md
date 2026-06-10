# Selfware

Une PWA personnelle pour remplir ses **colonnes de Beck** (relevé de pensées dysfonctionnelles, TCC) en
douceur, depuis son téléphone. Saisie guidée pas à pas, relecture de ses grilles, export PDF pour partager
avec un·e thérapeute.

**100 % local · hors-ligne · aucun compte · aucune donnée envoyée sur un serveur.** Tout est stocké
uniquement sur votre appareil (IndexedDB).

➡️ **Application : <https://basttran.github.io/selfware/>**

## Installer sur Android

1. Ouvrez **<https://basttran.github.io/selfware/>** dans **Chrome**.
2. Menu **⋮** → **« Ajouter à l'écran d'accueil »** (ou « Installer l'application »).
3. Lancez Selfware depuis son icône : elle s'ouvre en plein écran et fonctionne hors-ligne.

> Sur iPhone : Safari → bouton Partager → « Sur l'écran d'accueil ».

## Utilisation

- **Nouvelle grille** : bouton **+** en bas de l'écran. Un assistant en 7 étapes vous guide :
  événement → émotions (1–10) → pensées automatiques → faits pour → faits contre →
  pensées alternatives (avec les distorsions cognitives) → ré-évaluation des émotions.
- **Brouillons** : quittez quand vous voulez, tout est sauvegardé automatiquement ; la grille reprend là où
  vous vous étiez arrêté·e (badge « Brouillon » dans l'historique).
- **Étapes facultatives** : « faits pour / contre » et « pensées alternatives » peuvent être passées et
  complétées plus tard.
- **Relire / modifier** : touchez une grille dans l'historique.
- **Exporter en PDF** : depuis une grille (icône ⤴) ou une période entière — au choix en **fiche A5 portrait**
  (mobile) ou **tableau A4 paysage** (impression), puis partage via la feuille de partage du téléphone.
- **Réglages** (⚙) :
  - **Code d'accès** : protège l'ouverture de l'app (verrou d'accès, ne chiffre pas les données).
  - **Mes données** : **export/import JSON** — votre sauvegarde. Exportez régulièrement et conservez le
    fichier (Drive, mail à soi-même…) pour pouvoir restaurer sur un nouveau téléphone.
  - **Couleurs des émotions** : personnalisables.

## Confidentialité

Les grilles contiennent des pensées intimes. Elles **ne quittent jamais l'appareil** : pas de serveur, pas de
synchronisation, pas de télémétrie. Le code d'accès optionnel empêche un coup d'œil indiscret, mais ne chiffre
pas la base — pour une protection forte, comptez sur le verrouillage de votre téléphone. Désinstaller la PWA ou
vider les données du navigateur **efface tout** : pensez à l'export JSON comme sauvegarde.

## Développement

Prérequis : **Node 22+** et **pnpm**.

```bash
pnpm install      # installer les dépendances
pnpm dev          # serveur de dev → http://localhost:5173/selfware/
pnpm build        # build de production dans dist/
pnpm preview      # prévisualiser le build
pnpm lint         # Biome (lint + format check)
pnpm typecheck    # vérification TypeScript
```

## Déploiement

Push sur `main` → la GitHub Action [`deploy.yml`](.github/workflows/deploy.yml) build et publie sur
**GitHub Pages**. L'app est servie sous le sous-chemin `/selfware/` (configuré via `base` dans
[`vite.config.ts`](vite.config.ts)).

Activer une fois : **Settings → Pages → Build and deployment → Source : GitHub Actions**.

## Stack

React 19 · TypeScript · Vite · Tailwind v4 · Dexie (IndexedDB) · react-i18next · @react-pdf/renderer ·
zod · vite-plugin-pwa · Biome.

L'interface est entièrement localisable (clés i18n, `src/i18n/locales/fr.json`) ; seul le français est fourni
pour l'instant.
