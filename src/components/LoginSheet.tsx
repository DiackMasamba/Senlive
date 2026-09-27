import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, type TextInput as RNTextInput, View } from 'react-native';
import { Text, TextInput } from './AppText';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSession } from '../context/session';
import { realAuth, saveProfile, sendOtp, verifyOtp } from '../lib/auth';
import { colors, radius } from '../theme';

// Numéro sénégalais : 9 chiffres commençant par 7 (70, 75, 76, 77, 78).
const isValidPhone = (digits: string) => /^7[05678]\d{7}$/.test(digits);
const formatPhone = (digits: string) => digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');

// Tant que l'envoi de SMS n'est pas branché (lot 1), ce code de démo est accepté.
const DEMO_CODE = '123456';
const CODE_LENGTH = 6;

export function LoginSheet() {
  const { loginVisible, closeLogin, signIn } = useSession();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const codeInput = useRef<RNTextInput>(null);

  const digits = phone.replace(/\D/g, '');
  const cleanUsername = username.toLowerCase().replace(/[^a-z0-9._]/g, '');
  const canContinue =
    step === 'phone'
      ? isValidPhone(digits)
      : step === 'otp'
        ? code.length === CODE_LENGTH
        : name.trim().length >= 2 && cleanUsername.length >= 3;

  const reset = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setError('');
    setName('');
    setUsername('');
  };

  const close = () => {
    closeLogin();
    reset();
  };

  const submit = async () => {
    if (!canContinue || busy) return;
    setBusy(true);
    try {
      await next();
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    const displayPhone = `+221 ${formatPhone(digits)}`;
    if (step === 'phone') {
      const failure = await sendOtp(digits);
      if (failure) return setError(failure);
      setError('');
      setStep('otp');
      return;
    }
    if (step === 'otp') {
      let knownName = '';
      if (realAuth) {
        const result = await verifyOtp(digits, code);
        if (!result) {
          setError('Code incorrect ou expiré.');
          setCode('');
          return;
        }
        knownName = result.name;
      } else if (code !== DEMO_CODE) {
        setError('Code incorrect. En démo, utilise 123456.');
        setCode('');
        return;
      }
      // À l'inscription (ou pour un compte sans nom), on complète le profil avant d'entrer.
      if (mode === 'signup' || (realAuth && !knownName)) {
        setError('');
        setStep('profile');
        return;
      }
      signIn(displayPhone, knownName || undefined);
    } else {
      const failure = await saveProfile(name.trim(), cleanUsername);
      if (failure) return setError(failure);
      signIn(displayPhone, name.trim());
    }
    reset();
    setMode('login');
  };

  return (
    <Modal visible={loginVisible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Fermer" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          {step === 'phone' && (
            <View style={styles.tabs}>
              {(['login', 'signup'] as const).map((m) => (
                <Pressable key={m} style={[styles.tab, mode === m && styles.tabActive]} onPress={() => setMode(m)}>
                  <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                    {m === 'login' ? 'Connexion' : 'Inscription'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <View style={styles.badge}>
            <Ionicons
              name={step === 'phone' ? 'phone-portrait-outline' : step === 'otp' ? 'chatbubble-ellipses-outline' : 'person-outline'}
              size={22}
              color={colors.navy}
            />
          </View>
          {step === 'phone' ? (
            <>
              <Text style={styles.title}>{mode === 'login' ? 'Déjà membre Senlive ?' : 'Crée ton compte Senlive'}</Text>
              <Text style={styles.subtitle}>
                {mode === 'login' ? 'Entre ton numéro pour te connecter' : 'Gratuit, il suffit de ton numéro de téléphone'}
              </Text>
              <View style={styles.field}>
                <View style={styles.prefix}>
                  <Text style={styles.flag}>🇸🇳</Text>
                  <Text style={styles.prefixText}>+221</Text>
                </View>
                <TextInput
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^\d ]/g, ''))}
                  placeholder="77 123 45 67"
                  placeholderTextColor="#9E9E9E"
                  keyboardType="phone-pad"
                  maxLength={12}
                  style={styles.input}
                  autoFocus
                />
              </View>
              <Text style={styles.legal}>
                En appuyant sur « Continuer », tu acceptes les <Text style={styles.link}>Conditions générales</Text> et la{' '}
                <Text style={styles.link}>Politique de confidentialité</Text> de Senlive.
              </Text>
            </>
          ) : step === 'profile' ? (
            <>
              <Text style={styles.title}>Ton profil</Text>
              <Text style={styles.subtitle}>C'est ce que les autres verront dans les lives</Text>
              <View style={styles.field}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Prénom et nom"
                  placeholderTextColor="#9E9E9E"
                  maxLength={40}
                  style={styles.input}
                  autoFocus
                />
              </View>
              <View style={[styles.field, { marginTop: 10 }]}>
                <View style={styles.prefix}>
                  <Text style={styles.prefixText}>@</Text>
                </View>
                <TextInput
                  value={cleanUsername}
                  onChangeText={setUsername}
                  placeholder="pseudo"
                  placeholderTextColor="#9E9E9E"
                  autoCapitalize="none"
                  maxLength={24}
                  style={styles.input}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Code de vérification</Text>
              <Text style={styles.subtitle}>
                Envoyé par SMS au <Text style={styles.strong}>+221 {formatPhone(digits)}</Text>
              </Text>
              <Pressable style={styles.codeRow} onPress={() => codeInput.current?.focus()}>
                {Array.from({ length: CODE_LENGTH }, (_, i) => {
                  const filled = i < code.length;
                  const current = i === code.length;
                  return (
                    <View key={i} style={[styles.codeBox, filled && styles.codeBoxFilled, current && styles.codeBoxCurrent]}>
                      <Text style={styles.codeDigit}>{code[i] ?? ''}</Text>
                    </View>
                  );
                })}
                <TextInput
                  ref={codeInput}
                  value={code}
                  onChangeText={(t) => {
                    setError('');
                    setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH));
                  }}
                  keyboardType="number-pad"
                  maxLength={CODE_LENGTH}
                  style={styles.hiddenInput}
                  autoFocus
                  caretHidden
                />
              </Pressable>
              {error ? (
                <Text style={styles.error}>{error}</Text>
              ) : (
                <View style={styles.demo}>
                  <Ionicons name="information-circle" size={16} color={colors.navy} />
                  {realAuth ? (
                    <Text style={styles.demoText}>Code envoyé par SMS au +221 {formatPhone(digits)}</Text>
                  ) : (
                    <Text style={styles.demoText}>
                      Version démo : aucun SMS n'est envoyé, le code est <Text style={styles.strong}>123456</Text>
                    </Text>
                  )}
                </View>
              )}
              <Pressable onPress={() => setStep('phone')} hitSlop={8}>
                <Text style={[styles.legal, styles.link]}>Modifier le numéro</Text>
              </Pressable>
            </>
          )}
          {error && step !== 'otp' ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            onPress={submit}
            disabled={!canContinue || busy}
            style={[styles.button, canContinue ? styles.buttonActive : styles.buttonDisabled]}
          >
            <Text style={[styles.buttonText, canContinue && { color: colors.yellow }]}>
              {step === 'phone' ? 'Continuer' : step === 'otp' ? 'Valider' : 'Créer mon compte'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={canContinue ? colors.yellow : '#9E9E9E'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 24,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D6D6D6',
    marginBottom: 14,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tab: { flex: 1, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.white, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 1 },
  tabText: { color: colors.textMuted, fontSize: 13.5, fontWeight: '500' },
  tabTextActive: { color: colors.navy, fontWeight: '700' },
  badge: {
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: { textAlign: 'center', color: colors.navy, fontSize: 17, fontWeight: '700' },
  subtitle: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginTop: 2, marginBottom: 16 },
  strong: { color: colors.navy, fontWeight: '700' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: '100%',
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  flag: { fontSize: 16 },
  prefixText: { color: colors.navy, fontSize: 14, fontWeight: '600' },
  input: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 15,
    color: colors.navy,
    paddingHorizontal: 12,
    letterSpacing: 0.5,
    outlineStyle: 'none',
  } as object,
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  codeBox: {
    width: 42,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: { borderColor: colors.navy },
  codeBoxCurrent: { borderColor: colors.navy, borderWidth: 2 },
  codeDigit: { color: colors.navy, fontSize: 20, fontWeight: '700' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
  },
  demoText: { flex: 1, color: colors.navy, fontSize: 12.5 },
  error: { color: colors.live, textAlign: 'center', marginTop: 14, fontSize: 13, fontWeight: '600' },
  legal: { textAlign: 'center', color: colors.textMuted, fontSize: 11.5, marginTop: 12, lineHeight: 16 },
  link: { color: colors.navy, textDecorationLine: 'underline' },
  button: {
    marginTop: 16,
    height: 46,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  buttonActive: { backgroundColor: colors.navy },
  buttonDisabled: { backgroundColor: '#EEEEEE' },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#9E9E9E' },
});
