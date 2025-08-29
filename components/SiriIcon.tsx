import React from 'react';
import { View, StyleSheet, Text, useColorScheme } from 'react-native';

interface Props {
  size?: number;
}

export default function SiriIcon({ size = 60 }: Props) {
  const notebookSize = size * 0.6;
  const border = size * 0.03;
  const lineHeight = size * 0.02;
  const isDarkMode = useColorScheme() === 'dark';

  const containerColor = isDarkMode ? '#4a90e2' : '#b5d1ff';
  const notebookBackground = isDarkMode ? '#f2f2f2' : '#333333';
  const borderColor = isDarkMode ? '#000000' : '#ffffff';
  const lineColor = borderColor;
  const watermarkColor = isDarkMode ? '#ffffff' : '#000000';
  const watermarkOutline = isDarkMode ? '#000000' : '#ffffff';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: containerColor,
        },
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
              right: -size * 0.08,
              color: watermarkColor,
              textShadowColor: watermarkOutline,
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 1,
            },
          ]}
        >
          AI
        </Text>
      </View>
    </View>
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

