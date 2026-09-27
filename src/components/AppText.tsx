import { createContext, useContext, type Ref } from 'react';
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from 'react-native';
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { Poppins_500Medium } from '@expo-google-fonts/poppins/500Medium';
import { Poppins_600SemiBold } from '@expo-google-fonts/poppins/600SemiBold';
import { Poppins_700Bold } from '@expo-google-fonts/poppins/700Bold';
import { Poppins_800ExtraBold } from '@expo-google-fonts/poppins/800ExtraBold';
import { Poppins_800ExtraBold_Italic } from '@expo-google-fonts/poppins/800ExtraBold_Italic';

// Polices chargées au démarrage (voir src/app/_layout.tsx).
export const appFonts = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_800ExtraBold_Italic,
};

// Une police personnalisée ne gère pas fontWeight : chaque graisse a sa propre famille.
function poppins(style: TextStyle, nested = false): TextStyle {
  const { fontWeight, fontStyle, ...rest } = style;
  // Un texte imbriqué sans graisse propre hérite de la police de son parent.
  if (nested && fontWeight === undefined && fontStyle === undefined) return rest;
  const w = Number(fontWeight === 'bold' ? 700 : fontWeight ?? 400);
  let fontFamily = 'Poppins_400Regular';
  if (fontStyle === 'italic') fontFamily = 'Poppins_800ExtraBold_Italic';
  else if (w >= 800) fontFamily = 'Poppins_800ExtraBold';
  else if (w >= 700) fontFamily = 'Poppins_700Bold';
  else if (w >= 600) fontFamily = 'Poppins_600SemiBold';
  else if (w >= 500) fontFamily = 'Poppins_500Medium';
  return { ...rest, fontFamily };
}

const InsideText = createContext(false);

export function Text({ style, children, ...props }: TextProps) {
  const nested = useContext(InsideText);
  return (
    <RNText {...props} style={poppins(StyleSheet.flatten(style) ?? {}, nested)}>
      <InsideText.Provider value>{children}</InsideText.Provider>
    </RNText>
  );
}

export function TextInput({ style, ref, ...props }: TextInputProps & { ref?: Ref<RNTextInput> }) {
  return <RNTextInput {...props} ref={ref} style={poppins(StyleSheet.flatten(style) ?? {})} />;
}
