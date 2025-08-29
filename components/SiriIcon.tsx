import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  size?: number;
}

export default function SiriIcon({ size = 60 }: Props) {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <LinearGradient
        colors={['#5ac8fa', '#5856d6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['#ff2d55', '#ff9500']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { opacity: 0.7, transform: [{ rotate: '60deg' }] },
        ]}
      />
      <LinearGradient
        colors={['#4cd964', '#007aff']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[
          StyleSheet.absoluteFill,
          { opacity: 0.7, transform: [{ rotate: '-60deg' }] },
        ]}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { opacity: 0.6 },
        ]}
      />
      <View
        style={[
          styles.innerRing,
          { borderRadius: (size - 4) / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  innerRing: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
});

