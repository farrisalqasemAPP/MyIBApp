import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

export default function TutorScreen() {
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  const handleShouldStartLoadWithRequest = (request: any) => {
    // When the ChatGPT page tries to start Google OAuth inside the WebView,
    // open it in the system browser instead so Google allows the login.
    if (request.url.startsWith('https://accounts.google.com')) {
      WebBrowser.openBrowserAsync(request.url).then(() => {
        // Reload the ChatGPT page so it picks up any cookies from the browser
        // session and reflects the authenticated state.
        webviewRef.current?.reload();
      });
      return false;
    }
    return true;
  };
  return (
    <WebView
      ref={webviewRef}
      source={{ uri: 'https://chatgpt.com/' }}
      style={{ flex: 1, marginTop: insets.top }}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
    />
  );
}
