import { Redirect } from 'expo-router';

// Toute adresse inconnue ramène à l'accueil (utile pour la version web hébergée).
export default function NotFound() {
  return <Redirect href="/" />;
}
