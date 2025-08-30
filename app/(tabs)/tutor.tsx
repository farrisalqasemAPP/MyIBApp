import React from 'react';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TutorScreen() {
  const insets = useSafeAreaInsets();
  return (
    <WebView
      source={{ uri: 'https://chatgpt.com/' }}
      style={{ flex: 1, marginTop: insets.top }}
    />
  );
}
