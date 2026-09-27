import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSession } from '../context/session';
import { colors, radius } from '../theme';

// Numéro sénégalais : 9 chiffres commençant par 7 (70, 75, 76, 77, 78).
const isValidPhone = (digits: string) => /^7[05678]\d{7}$/.test(digits);

export function LoginSheet() {
  const { loginVisible, closeLogin, signIn } = useSession();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');

  const digits = phone.replace(/\D/g, '');
  const canContinue = step === 'phone' ? isValidPhone(digits) : code.length === 6;

  const reset = () => {
    setStep('phone');
    setPhone('');
    setCode('');
  };

  const close = () => {
    closeLogin();
    reset();
  };

  const submit = () => {
    if (!canContinue) return;
    if (step === 'phone') {
      // L'envoi du SMS OTP sera branché sur l'API d'authentification au lot 1.
      setStep('otp');
      return;
    }
    signIn(`+221 ${digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`);
    reset();
  };

  return (
    <Modal visible={loginVisible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrap}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
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
                  onChangeText={setPhone}
                  placeholder="Ton numéro de mobile"
                  placeholderTextColor={colors.navySoft}
                  keyboardType="phone-pad"
                  maxLength={12}
                  style={styles.input}
                  autoFocus
                />
              </View>
              <Text style={styles.legal}>
                En appuyant sur « Connexion », tu acceptes les <Text style={styles.link}>Conditions générales</Text> et la{' '}
                <Text style={styles.link}>Politique de confidentialité</Text> Senlive
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.title}>Code de vérification</Text>
              <Text style={styles.subtitle}>Saisis le code à 6 chiffres reçu par SMS au +221 {digits}</Text>
              <View style={styles.field}>
                <Ionicons name="lock-closed-outline" size={22} color={colors.navySoft} style={{ marginLeft: 14 }} />
                <TextInput
                  value={code}
                  onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
                  placeholder="••••••"
                  placeholderTextColor={colors.navySoft}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, styles.codeInput]}
                  autoFocus
                />
              </View>
              <Pressable onPress={() => setStep('phone')}>
                <Text style={[styles.legal, styles.link]}>Modifier le numéro</Text>
              </Pressable>
            </>
          )}
          <Pressable
            onPress={submit}
            disabled={!canContinue}
            style={[styles.button, canContinue ? styles.buttonActive : styles.buttonDisabled]}
          >
            <Text style={[styles.buttonText, canContinue && { color: colors.white }]}>
              {step === 'phone' ? 'Connexion' : 'Valider'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={canContinue ? colors.white : colors.navySoft} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(11,45,111,0.45)' },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 36,
  },
  grabber: {
    alignSelf: 'center',
    width: 110,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C8D6EC',
    marginBottom: 26,
  },
  title: { textAlign: 'center', color: colors.navy, fontSize: 18, fontWeight: '700' },
  subtitle: { textAlign: 'center', color: colors.navy, fontSize: 16, marginTop: 4, marginBottom: 20 },
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
    backgroundColor: '#E6EAF0',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  flag: { fontSize: 20 },
  prefixText: { color: colors.navy, fontSize: 17, fontWeight: '500' },
  input: { flex: 1, fontSize: 17, color: colors.navy, paddingHorizontal: 12, paddingVertical: 8 },
  codeInput: { letterSpacing: 8, fontSize: 22 },
  legal: { textAlign: 'center', color: colors.navy, fontSize: 13, marginTop: 18, lineHeight: 18 },
  link: { color: colors.navySoft, textDecorationLine: 'underline' },
  button: {
    marginTop: 22,
    borderRadius: radius.pill,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonActive: { backgroundColor: colors.navy },
  buttonDisabled: { backgroundColor: '#EDF1F7' },
  buttonText: { fontSize: 18, fontWeight: '600', color: colors.navySoft },
});
