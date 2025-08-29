import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface Props {
  size?: number;
}

export default function SiriIcon({ size = 60 }: Props) {
  const notebookSize = size * 0.6;
  const border = size * 0.03;
  const lineHeight = size * 0.02;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#003366',
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
          },
        ]}
      >
        <View
          style={[
            styles.line,
            { top: notebookSize * 0.3, height: lineHeight, borderRadius: lineHeight / 2 },
          ]}
        />
        <View
          style={[
            styles.line,
            { top: notebookSize * 0.55, height: lineHeight, borderRadius: lineHeight / 2 },
          ]}
        />
        <Text
          style={[
            styles.watermark,
            { fontSize: size * 0.15, top: -size * 0.08, right: -size * 0.08 },
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
    backgroundColor: '#ffffff',
    borderColor: '#000080',
  },
  line: {
    position: 'absolute',
    left: '5%',
    right: '5%',
    backgroundColor: '#000080',
  },
  watermark: {
    position: 'absolute',
    color: '#000080',
    fontWeight: 'bold',
  },
});

