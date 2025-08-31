import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const handleLogin = async () => {
    const redirectUri = Linking.createURL('/auth-callback');
    const authUrl =
      'https://accounts.google.com/o/oauth2/v2/auth?response_type=code' +
      `&client_id=${encodeURIComponent(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '')}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      '&scope=openid%20email%20profile';
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
    if (result.type === 'success' && result.url) {
      const code = new URL(result.url).searchParams.get('code');
      if (code) {
        // TODO: Send code to backend and exchange for tokens
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Sign in with Google" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
