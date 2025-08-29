import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import SiriIcon from './SiriIcon';

export default function AIButton() {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -8,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float]);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: float }] }]}>
      <TouchableOpacity onPress={() => router.push('/tutor')}>
        <SiriIcon />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
});

