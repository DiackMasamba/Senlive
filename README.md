# Senlive

Application mobile de lives payants par abonnement mensuel (Sénégal). Construite avec Expo (React Native), elle tourne sur Android, iOS et le web.

## Lancer l'app

```bash
npm install
npx expo start
```

Scanne le QR code avec l'app **Expo Go** sur ton téléphone, ou appuie sur `w` pour l'ouvrir dans le navigateur.

## État actuel (maquette fonctionnelle)

- Écran de démarrage, accueil, menu latéral, connexion par numéro +221 et code SMS
- Explorer (recherche et catégories), préparation d'un live, écran de live avec chat
- Offre Senlive Premium avec choix Wave, Orange Money ou carte

Les données, la connexion et le paiement sont **simulés** (`src/data/mock.ts`, `src/context/session.tsx`).
La suite suit le cahier des charges : API et comptes (lot 1), vidéo WebRTC (lot 2), paiement réel (lot 3), modération et back-office (lot 4).

## Structure

- `src/app/` : écrans (Expo Router)
- `src/components/` : composants réutilisables
- `src/theme.ts` : couleurs et styles communs
