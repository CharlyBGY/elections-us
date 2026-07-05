# U.S. Elections

Application mobile (interface en anglais) de suivi des élections américaines, sur le même socle qu'« Élysée 2027 » (React + Vite + Recharts). Style éditorial sobre inspiré de Politico : fond blanc, titres sérif, rouge en accent, pas de mode sombre.

## Contenu

- **Polls** : l'essentiel de la semaine, popularité du président, bulletin générique du Congrès avec courbes de tendance, **probabilités de contrôle de la Chambre et du Sénat** (marchés prédictifs), rapport de force au Congrès sortant.
- **Midterms** : les 35 sièges du Sénat et les 36 postes de gouverneur en jeu en 2026, chacun avec sa **carte des États-Unis colorée selon la cote de la course** (Solid / Likely / Lean / Toss-up), un **simulateur de Sénat** (toucher un État fait tourner son siège D → R → indécis, compteur et verdict en direct), des **filtres** (All / Competitive / Toss-ups), le **dernier sondage de chaque duel** dans les fiches et le **journal des changements de cote**.
- **2028 (Road to 270)** : carte présidentielle granulaire (Safe/Likely/Toss-up) avec mode **Simulate** pour construire sa propre carte à 270 (scénario sauvegardé sur l'appareil), barre des 538 grands électeurs à cinq segments avec le seuil de 270, colonnes façon Politico, détail des sept États pivots, premières enquêtes de primaires.
- **Calendar** : compte à rebours du prochain rendez-vous, primaires, midterms du 3 novembre 2026, jalons jusqu'à la présidentielle du 7 novembre 2028.
- **About** : sources, crédit, rappel du système électoral.

Les contours des États viennent du paquet [`@svg-maps/usa`](https://www.npmjs.com/package/@svg-maps/usa) (MIT).

## Mettre à jour les données

Tout est dans [`src/data.js`](src/data.js) : sondages, cotes des courses, calendrier, brèves de la semaine (contenu en anglais). Modifier `UPDATED` à chaque édition.

## Développement

```bash
npm install
npm run dev      # serveur local
npm run build    # build de production (dist/)
```

Sur GitHub Pages, l'app est servie sous `/elections-us/` (voir `vite.config.js`).
