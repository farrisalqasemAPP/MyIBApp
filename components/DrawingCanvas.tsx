import React, { useRef, useState } from 'react';
import { View, PanResponder, Image } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import Svg, { Path } from 'react-native-svg';

export type DrawingElement =
  | { type: 'path'; d: string; color: string }
  | { type: 'image'; uri: string; x: number; y: number; width: number; height: number };

interface DrawingCanvasProps {
  elements: DrawingElement[];
  setElements?: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
  strokeColor?: string;
  strokeWidth?: number;
  editable?: boolean;
  canvasSize?: number;
}

export default function DrawingCanvas({
  elements,
  setElements,
  strokeColor = '#000',
  strokeWidth = 4,
  editable = true,
  canvasSize = 2000,
}: DrawingCanvasProps) {
  const [currentPath, setCurrentPath] = useState('');
  const currentPathRef = useRef('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onPanResponderGrant: evt => {
        if (!editable) return;
        const { locationX, locationY } = evt.nativeEvent;
        const path = `M${locationX} ${locationY}`;
        currentPathRef.current = path;
        setCurrentPath(path);
      },
      onPanResponderMove: evt => {
        if (!editable) return;
        const { locationX, locationY } = evt.nativeEvent;
        const path = `${currentPathRef.current} L${locationX} ${locationY}`;
        currentPathRef.current = path;
        setCurrentPath(path);
      },
      onPanResponderRelease: () => {
        if (!editable) return;
        if (currentPathRef.current && setElements) {
          setElements(prev => [
            ...prev,
            { type: 'path', d: currentPathRef.current, color: strokeColor },
          ]);
          currentPathRef.current = '';
          setCurrentPath('');
        }
      },
    }),
  ).current;

  return (
    <View
      style={{ width: canvasSize, height: canvasSize }}
      {...panResponder.panHandlers}
    >
      {elements
        .filter(e => e.type === 'image')
        .map((img, i) => (
          <Image
            key={`img-${i}`}
            source={{ uri: img.uri }}
            style={{
              position: 'absolute',
              left: img.x,
              top: img.y,
              width: img.width,
              height: img.height,
            }}
          />
        ))}
      <Svg style={{ position: 'absolute', width: canvasSize, height: canvasSize }}>
        {elements
          .filter(e => e.type === 'path')
          .map((p, i) => (
            <Path
              key={`path-${i}`}
              d={p.d}
              stroke={p.color}
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
