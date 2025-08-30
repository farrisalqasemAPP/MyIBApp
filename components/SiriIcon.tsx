import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  size?: number;
}

export default function SiriIcon({ size = 60 }: Props) {
  const notebookSize = size * 0.6;
  const border = size * 0.03;
  const lineHeight = size * 0.02;

  const gradientColors = ['#2e1065', '#00008b'];
  const notebookBackground = '#f5f5f5';
  const borderColor = '#e0e0e0';
  const lineColor = borderColor;
  const watermarkColor = '#000000';
  const watermarkOutline = '#ffffff';

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
        <View
          style={[
            styles.line,
            {
              top: notebookSize * 0.3,
              height: lineHeight,
              borderRadius: lineHeight / 2,
              backgroundColor: lineColor,
            },
          ]}
        />
        <View
          style={[
            styles.line,
            {
              top: notebookSize * 0.55,
              height: lineHeight,
              borderRadius: lineHeight / 2,
              backgroundColor: lineColor,
            },
          ]}
        />
        <Text
          style={[
            styles.watermark,
            {
              fontSize: size * 0.15,
              top: -size * 0.08,
              left: -size * 0.08,
              color: watermarkColor,
              textShadowColor: watermarkOutline,
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: size * 0.2,
            },
          ]}
        >
          AI
        </Text>
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
  watermark: {
    position: 'absolute',
    fontWeight: 'bold',
  },
});

