# Senlive

Application mobile de lives payants par abonnement mensuel (Sénégal). Construite avec Expo (React Native), elle tourne sur Android, iOS et le web.

## Lancer l'app

```bash
npm install
cp .env.example .env.local
npx expo start
```

Scanne le QR code avec l'app **Expo Go** sur ton téléphone, ou appuie sur `w` pour l'ouvrir dans le navigateur.

## État du projet

Voir **[docs/CONTEXTE.md](docs/CONTEXTE.md)** : décisions, état, carte du code et prochaines étapes.
La connexion se fait par code e-mail (Supabase), les paiements via PayTech, l'APK Android est compilé par EAS (branche `apk`).

## Structure

- `src/app/` : écrans (Expo Router)
- `src/components/` : composants réutilisables
- `src/theme.ts` : couleurs et styles communs
