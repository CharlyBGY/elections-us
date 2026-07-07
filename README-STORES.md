# Publication sur les stores — état des lieux et marche à suivre

L'app existe sous trois formes qui partagent le même code :
1. **Le site / PWA** — https://charlybgy.github.io/elections-us/ (installable depuis le navigateur, hors ligne, mis à jour à chaque push) ;
2. **L'app Android** — projet Capacitor dans `android/` (appId `com.baguerey.uselections`) ;
3. **L'app iOS** — projet Capacitor dans `ios/`.

Le fichier **`public/widget.json`** (régénéré à chaque build, servi sur
`https://charlybgy.github.io/elections-us/widget.json`) est le contrat de données
des widgets natifs et des notifications : approbation, generic ballot, control odds,
toss-ups, prochain événement. Les widgets n'ont qu'à lire ce JSON.

Le service worker (`public/sw.js`) gère déjà l'affichage des notifications Web Push
(événements `push` et `notificationclick`) — il ne manque qu'un service d'envoi.

## Ce qu'il reste à faire, dans l'ordre

### Play Store (l'étape suivante prévue)
1. Installer **Android Studio** (gratuit) — fournit le SDK et Gradle.
2. Créer le compte **Google Play Console** (25 $, une seule fois).
3. Créer un projet **Firebase** (gratuit) pour les notifications : télécharger
   `google-services.json` dans `android/app/`, installer `@capacitor/push-notifications`.
4. Construire : `npm run build && npx cap sync android`, puis dans Android Studio
   « Build > Generate Signed App Bundle » (créer la clé de signature et la garder précieusement).
5. Téléverser l'AAB dans la Play Console, remplir la fiche (captures, descriptions,
   questionnaire données personnelles — l'app ne collecte rien), soumettre.

### App Store
1. Installer **Xcode** (App Store) et **CocoaPods** (`sudo gem install cocoapods`),
   puis `npx cap sync ios` (lance `pod install`).
2. Compte **Apple Developer Program** (99 $/an).
3. Notifications : activer « Push Notifications » dans les capacités Xcode,
   relier Firebase à APNs (clé APNs à créer dans le portail Apple).
4. **Widgets** (l'argument « intérêt natif » pour la règle 4.2) : ajouter une extension
   WidgetKit dans Xcode qui lit `widget.json` — compte à rebours, generic ballot,
   control odds. Équivalent Android : un App Widget (Glance) dans `android/`.
5. Archiver dans Xcode, téléverser via l'Organizer, soumettre à la review.

## Commandes courantes

```bash
npm run build          # régénère widget.json + build web (dist/)
npx cap sync android   # copie dist/ dans le projet Android
npx cap sync ios       # idem iOS (nécessite CocoaPods)
npx cap open android   # ouvre Android Studio
npx cap open ios       # ouvre Xcode
```

## Prérequis manquants sur cette machine (au 5 juillet 2026)
- Xcode (seuls les Command Line Tools sont installés) et CocoaPods ;
- Android Studio / SDK Android ;
- Comptes : Google Play Console, Apple Developer, Firebase.
