import React, { useRef, useState } from 'react';
import { View, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface DrawingCanvasProps {
  paths: string[];
  setPaths: (paths: string[]) => void;
  strokeColor?: string;
  strokeWidth?: number;
}

export default function DrawingCanvas({
  paths,
  setPaths,
  strokeColor = '#000',
  strokeWidth = 4,
}: DrawingCanvasProps) {
  const [currentPath, setCurrentPath] = useState('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(`M${locationX} ${locationY}`);
      },
      onPanResponderMove: evt => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath(prev => `${prev} L${locationX} ${locationY}`);
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          setPaths([...paths, currentPath]);
          setCurrentPath('');
        }
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      <Svg style={{ flex: 1 }}>
        {paths.map((p, i) => (
          <Path
            key={i}
            d={p}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {currentPath ? (
          <Path
            d={currentPath}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
    </View>
  );
}
