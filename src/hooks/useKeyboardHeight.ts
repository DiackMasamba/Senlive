import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Hauteur du clavier sur Android. En edge-to-edge (toujours actif depuis le SDK 54),
// la fenêtre ne se redimensionne plus : on remonte le contenu nous-mêmes.
export function useAndroidKeyboardHeight() {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => setHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return height;
}
