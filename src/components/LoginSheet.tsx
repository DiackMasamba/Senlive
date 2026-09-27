import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, type TextInput as RNTextInput, View } from 'react-native';
import { Text, TextInput } from './AppText';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSession } from '../context/session';
import { colors, radius } from '../theme';

// Numéro sénégalais : 9 chiffres commençant par 7 (70, 75, 76, 77, 78).
const isValidPhone = (digits: string) => /^7[05678]\d{7}$/.test(digits);
const formatPhone = (digits: string) => digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');

// Tant que l'envoi de SMS n'est pas branché (lot 1), ce code de démo est accepté.
const DEMO_CODE = '123456';
const CODE_LENGTH = 6;

export function LoginSheet() {
  const { loginVisible, closeLogin, signIn } = useSession();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const codeInput = useRef<RNTextInput>(null);

  const digits = phone.replace(/\D/g, '');
  const canContinue = step === 'phone' ? isValidPhone(digits) : code.length === CODE_LENGTH;

  const reset = () => {
    setStep('phone');
    setPhone('');
    setCode('');
    setError('');
  };

  const close = () => {
    closeLogin();
    reset();
  };

  const submit = () => {
    if (!canContinue) return;
    if (step === 'phone') {
      setStep('otp');
      return;
    }
    if (code !== DEMO_CODE) {
      setError('Code incorrect. En démo, utilise 123456.');
      setCode('');
      return;
    }
    signIn(`+221 ${formatPhone(digits)}`);
    reset();
  };

  return (
    <Modal visible={loginVisible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Fermer" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.badge}>
            <Ionicons name={step === 'phone' ? 'phone-portrait-outline' : 'chatbubble-ellipses-outline'} size={28} color={colors.navy} />
          </View>
          {step === 'phone' ? (
            <>
              <Text style={styles.title}>Déjà membre Senlive ?</Text>
              <Text style={styles.subtitle}>Entre ton numéro pour te connecter</Text>
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
                  <Ionicons name="information-circle" size={18} color={colors.navy} />
                  <Text style={styles.demoText}>
                    Version démo : aucun SMS n'est envoyé, le code est <Text style={styles.strong}>123456</Text>
                  </Text>
                </View>
              )}
              <Pressable onPress={() => setStep('phone')} hitSlop={8}>
                <Text style={[styles.legal, styles.link]}>Modifier le numéro</Text>
              </Pressable>
            </>
          )}
          <Pressable
            onPress={submit}
            disabled={!canContinue}
            style={[styles.button, canContinue ? styles.buttonActive : styles.buttonDisabled]}
          >
            <Text style={[styles.buttonText, canContinue && { color: colors.yellow }]}>
              {step === 'phone' ? 'Continuer' : 'Valider'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={canContinue ? colors.yellow : '#9E9E9E'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Voile bleu nuit : un voile noir sur le jaune donnerait un kaki terne.
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.82)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 32,
  },
  grabber: {
    alignSelf: 'center',
    width: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D6D6D6',
    marginBottom: 18,
  },
  badge: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
    marginBottom: 14,
  },
  title: { textAlign: 'center', color: colors.navy, fontSize: 21, fontWeight: '700' },
  subtitle: { textAlign: 'center', color: colors.textMuted, fontSize: 15, marginTop: 4, marginBottom: 20 },
  strong: { color: colors.navy, fontWeight: '700' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: 8,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  flag: { fontSize: 20 },
  prefixText: { color: colors.navy, fontSize: 16, fontWeight: '600' },
  input: { flex: 1, fontSize: 18, color: colors.navy, paddingHorizontal: 12, paddingVertical: 8, letterSpacing: 1 },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  codeBox: {
    width: 46,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: { borderColor: colors.navy, backgroundColor: colors.white },
  codeBoxCurrent: { borderColor: colors.navy, borderWidth: 2.5, backgroundColor: colors.white },
  codeDigit: { color: colors.navy, fontSize: 24, fontWeight: '700' },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  demo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.yellowPale,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
  },
  demoText: { flex: 1, color: colors.navy, fontSize: 13 },
  error: { color: colors.live, textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '600' },
  legal: { textAlign: 'center', color: colors.textMuted, fontSize: 12.5, marginTop: 16, lineHeight: 18 },
  link: { color: colors.navySoft, textDecorationLine: 'underline' },
  button: {
    marginTop: 20,
    borderRadius: radius.pill,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonActive: { backgroundColor: colors.navy },
  buttonDisabled: { backgroundColor: '#EEEEEE' },
  buttonText: { fontSize: 17, fontWeight: '600', color: '#9E9E9E' },
});
