import { createContext, useContext, type Ref } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_600SemiBold } from '@expo-google-fonts/roboto/600SemiBold';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { Roboto_800ExtraBold } from '@expo-google-fonts/roboto/800ExtraBold';
import { Roboto_800ExtraBold_Italic } from '@expo-google-fonts/roboto/800ExtraBold_Italic';

// Polices chargées au démarrage (voir src/app/_layout.tsx).
export const appFonts = {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  Roboto_800ExtraBold,
  Roboto_800ExtraBold_Italic,
};

// Une police personnalisée ne gère pas fontWeight : chaque graisse a sa propre famille.
function roboto(style: TextStyle, nested = false): TextStyle {
  const { fontWeight, fontStyle, ...rest } = style;
  // Un texte imbriqué sans graisse propre hérite de la police de son parent.
  if (nested && fontWeight === undefined && fontStyle === undefined) return rest;
  const w = Number(fontWeight === 'bold' ? 700 : fontWeight ?? 400);
  let fontFamily = 'Roboto_400Regular';
  if (fontStyle === 'italic') fontFamily = 'Roboto_800ExtraBold_Italic';
  else if (w >= 800) fontFamily = 'Roboto_800ExtraBold';
  else if (w >= 700) fontFamily = 'Roboto_700Bold';
  else if (w >= 600) fontFamily = 'Roboto_600SemiBold';
  else if (w >= 500) fontFamily = 'Roboto_500Medium';
  return { ...rest, fontFamily };
}

const InsideText = createContext(false);

export function Text({ style, children, ...props }: TextProps) {
  const nested = useContext(InsideText);
  return (
    <RNText {...props} style={roboto(StyleSheet.flatten(style) ?? {}, nested)}>
      <InsideText.Provider value>{children}</InsideText.Provider>
    </RNText>
  );
}

export function TextInput({ style, ref, ...props }: TextInputProps & { ref?: Ref<RNTextInput> }) {
  return <RNTextInput {...props} ref={ref} style={roboto(StyleSheet.flatten(style) ?? {})} />;
}
