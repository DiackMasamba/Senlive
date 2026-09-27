import * as ImagePicker from 'expo-image-picker';

// Ouvre la galerie du téléphone et renvoie l'image recadrée, ou null si l'utilisateur annule.
export async function pickImage(aspect: [number, number]) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.8,
  });
  return result.canceled ? null : result.assets[0].uri;
}
