import { supabase } from './supabase';

// Connexion par code reçu par e-mail via Supabase Auth (gratuit). Le SMS (Twilio Verify) reviendra au lancement.
// Sans Supabase configuré, l'app garde la connexion de démo (code 123456).
export const realAuth = supabase !== null;

export async function sendOtp(email: string): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (!error) return null;
  return error.status === 429 ? 'Trop de demandes. Réessaie dans quelques minutes.' : "Impossible d'envoyer l'e-mail. Vérifie l'adresse.";
}

// Renvoie null si le code est faux, sinon le nom déjà enregistré (vide pour un nouveau compte).
export async function verifyOtp(email: string, token: string): Promise<{ name: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error || !data.user) return null;
  return { name: await profileName(data.user.id) };
}

export async function profileName(userId: string): Promise<string> {
  if (!supabase) return '';
  const { data } = await supabase.from('profiles').select('display_name').eq('id', userId).maybeSingle();
  return data?.display_name ?? '';
}

export async function saveProfile(name: string, username: string): Promise<string | null> {
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return 'Session expirée, reconnecte-toi.';
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: name, username })
    .eq('id', auth.user.id);
  if (!error) return null;
  return error.code === '23505' ? 'Ce pseudo est déjà pris.' : "Impossible d'enregistrer le profil.";
}

export async function signOutRemote() {
  await supabase?.auth.signOut();
}
