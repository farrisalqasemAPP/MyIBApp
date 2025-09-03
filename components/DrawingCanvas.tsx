import React, { useEffect, useRef, useState } from 'react';
import { View, PanResponder, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { line as d3Line, curveBasis } from 'd3-shape';

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
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const strokeColorRef = useRef(strokeColor);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  const lineGenerator = useRef(
    d3Line<{ x: number; y: number }>()
      .x(p => p.x)
      .y(p => p.y)
      .curve(curveBasis),
  ).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onPanResponderGrant: evt => {
        if (!editable) return;
        const { locationX, locationY } = evt.nativeEvent;
        pointsRef.current = [{ x: locationX, y: locationY }];
        setCurrentPath(lineGenerator(pointsRef.current) ?? '');
      },
      onPanResponderMove: evt => {
        if (!editable) return;
        const { locationX, locationY } = evt.nativeEvent;
        pointsRef.current.push({ x: locationX, y: locationY });
        setCurrentPath(lineGenerator(pointsRef.current) ?? '');
      },
      onPanResponderRelease: () => {
        if (!editable) return;
        if (pointsRef.current.length && setElements) {
          const path = lineGenerator(pointsRef.current) ?? '';
          setElements(prev => [
            ...prev,
            { type: 'path', d: path, color: strokeColorRef.current },
          ]);
        }
        pointsRef.current = [];
        setCurrentPath('');
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
