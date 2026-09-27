# Senlive : mémoire du projet

Ce fichier est la mémoire partagée du projet. Claude le lit au début de chaque session (il est importé par `CLAUDE.md`).
**Mets-le à jour à la fin de chaque session de travail** (ce qui est fait, décisions, prochaines étapes).

Dernière mise à jour : 27 septembre 2026.

## Le projet

- **Senlive** : application de lives type TikTok pour le Sénégal. Les utilisateurs inscrits font des lives, les spectateurs envoient des cadeaux payés en pièces, et il existe un abonnement Premium mensuel.
- **Propriétaire** : Babacar (GitHub `DiackMasamba`). Il écrit en français : réponds en français, simplement, avec des étapes courtes. Budget serré : privilégier les solutions gratuites.
- **Cahier des charges validé** : https://claude.ai/code/artifact/fd289402-2739-4767-a4a1-2e94cced5770
- **Modèle économique (pièces)** : https://claude.ai/artifact/8Y3MsNwUgkA11e64kz9RfT
- **Démo web (téléphone)** : https://claude.ai/artifact/WKCuKaT3yXRmAjLKnUcG1P

## Règles de travail

- **Ne jamais demander de clés secrètes dans le chat** (PayTech, Brevo, Twilio…). Babacar les saisit lui-même dans les tableaux de bord (Supabase > Edge Functions > Secrets, etc.).
- Aucune action irréversible (suppression de données, passage en production, paiement réel) sans son accord écrit.
- Style visuel à garder : **noir et blanc**, police **Roboto**, style compact inspiré de Jumia. Le rouge sert uniquement au badge « EN DIRECT » et au point du logo.
- Après chaque changement : `npx tsc --noEmit`, commit, push sur `main`.

## Décisions prises

| Sujet | Décision |
|---|---|
| Abonnement Premium | 2 000 FCFA / mois, 60 % des revenus reversés aux créateurs |
| Pièces | 1 pièce = 10 FCFA. Packs de 500 à 25 000 FCFA avec bonus |
| Cadeaux | 10 à 500 pièces. Le créateur reçoit 50 % en diamants (55 % s'il est vérifié), retrait dès 500 diamants vers Wave / Orange Money |
| Commissions | Revendeurs 7 %, agences 5 %, parrainage 3 % pendant 6 mois ; plateforme environ 40 % |
| Paiement | **PayTech** (paytech.sn), pas PayDunya. Actuellement en mode **test** |
| Connexion | **Code par e-mail** (8 chiffres) via Supabase + Brevo SMTP (gratuit, 300 e-mails/jour). SMS Twilio configuré mais désactivé faute de crédit |

## Technique

- **App** : Expo SDK 57, Expo Router (écrans dans `src/app/`), TypeScript, React Native 0.86.
- **Backend** : Supabase, projet « SeneLive », ref `rmnsevkzdjapjmjnagye`, région eu-west-3.
  - URL : `https://rmnsevkzdjapjmjnagye.supabase.co`
  - Clé publique (publishable, sans danger) : `sb_publishable_Q7DCJ2i1afWhIQWDKv3lpw_qQkJsjuh`
- **Build Android** : EAS (compte Expo `senlive`, projet `8fa4511a-405f-49e4-ba82-02ed7fab0877`).
  - Chaque push sur la branche **`apk`** lance une compilation de l'APK de test (`.eas/workflows/build-android.yml`, profil `preview`).
  - Pour relancer depuis `main` : `git push origin main:apk`
  - Suivi : https://expo.dev/accounts/senlive/projects/senlive/workflows (environ 20 min sur le plan gratuit).

### Carte du code

| Fichier | Rôle |
|---|---|
| `src/app/(tabs)/` | Onglets : accueil, explorer, go live, premium, compte |
| `src/app/live/[id].tsx` | Écran de live : chat et cadeaux |
| `src/app/portefeuille.tsx` | Portefeuille : solde, achat de packs via PayTech |
| `src/components/LoginSheet.tsx` | Connexion / inscription par e-mail et code à 8 chiffres |
| `src/components/GiftSheet.tsx` | Choix d'un cadeau |
| `src/context/session.tsx` | Utilisateur connecté (restaure la session Supabase) |
| `src/context/wallet.tsx` | Solde de pièces : **encore en mémoire locale (démo)**, pas relié à Supabase |
| `src/lib/auth.ts` | Envoi et vérification du code e-mail, profil |
| `src/lib/paytech.ts` | Ouvre le paiement PayTech et vérifie le résultat |
| `src/hooks/useKeyboardHeight.ts` | Remonte le contenu au-dessus du clavier sur Android |
| `src/data/mock.ts` | Lives de démonstration (utilisés si Supabase n'est pas configuré) |
| `supabase/migrations/` | Schéma de la base (profils, lives, abonnements, portefeuille, paiements…) |
| `supabase/functions/paytech-checkout` | Crée un paiement PayTech (utilisateur connecté) |
| `supabase/functions/paytech-ipn` | Reçoit la confirmation de PayTech et crédite les pièces |

Sans fichier `.env.local`, l'app tourne en **mode démo** : code de connexion `12345678`, paiements simulés.

### Secrets déjà configurés dans Supabase (par Babacar)

`PAYTECH_API_KEY`, `PAYTECH_API_SECRET` (mode test). Ajouter `PAYTECH_ENV=prod` pour passer en réel.
SMTP Brevo : hôte `smtp-relay.brevo.com`, port 587, expéditeur diackmasamba@gmail.com (nom « Senlive »).

## État au 27 septembre 2026

Fait :
- Maquette complète de l'app (accueil, explorer, live, premium, compte, menu, portefeuille, cadeaux).
- Base Supabase avec sécurité RLS, portefeuille et paiements côté serveur.
- Connexion par e-mail fonctionnelle (le code arrive bien).
- PayTech branché côté serveur (clés vérifiées).
- Premier APK Android installé sur le téléphone de Babacar.
- Correctif : le clavier cachait les champs sur Android. Icône Senlive (s blanc et point rouge sur fond noir). Ces deux changements sont dans le 2e APK, en cours de compilation à la fin de la session.

## Prochaines étapes

1. Installer le 2e APK, puis tester la connexion par e-mail et une recharge PayTech en mode test.
2. Relier le portefeuille de l'app aux tables Supabase `wallets` et `wallet_transactions`. Aujourd'hui le solde est local.
3. Enregistrer les cadeaux envoyés côté serveur (`private.send_gift`).
4. Vidéo en direct : choisir un service WebRTC géré (lot 2 du cahier des charges).
5. Plus tard :
   - supprimer les anciennes fonctions `paydunya-*` dans Supabase ;
   - passer PayTech en production ;
   - ajouter la connexion Google ;
   - créer le compte Google Play ;
   - acheter du crédit Twilio pour les SMS.

## Démarrer sur un ordinateur

```bash
git clone https://github.com/DiackMasamba/Senlive.git
cd Senlive
npm install
cp .env.example .env.local   # déjà rempli avec l'URL et la clé publique
npx expo start               # appuie sur « w » pour le navigateur
```

Vérifications : `npx tsc --noEmit` (types). Pour ajouter une bibliothèque : `npx expo install <paquet>`.
