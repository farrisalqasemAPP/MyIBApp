import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  size?: number;
}

export default function SiriIcon({ size = 60 }: Props) {
  const notebookSize = size * 0.6;
  const border = size * 0.03;
  const lineHeight = size * 0.02;

  const gradientColors = ['#2e1065', '#00008b'];
  const notebookBackground = '#e0f2ff';
  const borderColor = '#bcd4f6';
  const lineColor = borderColor;

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View
        style={[
          styles.notebook,
          {
            width: notebookSize,
            height: notebookSize,
            borderRadius: size * 0.05,
            borderWidth: border,
            backgroundColor: notebookBackground,
            borderColor: borderColor,
          },
        ]}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.line,
              {
                top: notebookSize * (0.2 + 0.15 * i),
                height: lineHeight,
                borderRadius: lineHeight / 2,
                backgroundColor: lineColor,
              },
            ]}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notebook: {
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: '5%',
    right: '5%',
  },
});

