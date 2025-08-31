import React, { useRef, useEffect } from 'react';
import { AppState, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TutorScreen() {
  const insets = useSafeAreaInsets();
  const webviewRef = useRef<WebView>(null);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        webviewRef.current?.reload();
      }
    });
    return () => sub.remove();
  }, []);

  const handleShouldStartLoadWithRequest = (request: any) => {
    // When the ChatGPT page tries to start Google OAuth inside the WebView,
    // open the flow in the system browser instead so Google allows the login.
    // We intercept both the initial auth.openai.com request that starts the
    // OAuth session and the subsequent accounts.google.com URL. Otherwise the
    // Google callback complains with "invalid session" because the cookie set
    // by auth.openai.com isn't available in the external browser.
    if (
      request.url.startsWith('https://accounts.google.com') ||
      request.url.startsWith('https://auth.openai.com')
    ) {
      Linking.openURL(request.url);
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
