import React, { useEffect, useRef, useState } from 'react';
import { View, PanResponder, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { line as d3Line, curveBasis } from 'd3-shape';

export type DrawingElement =
  | { type: 'path'; d: string; color: string; width?: number }
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
  const strokeWidthRef = useRef(strokeWidth);
  const selectedImageRef = useRef<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
  }, [strokeWidth]);

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
        const imgIndex = elements.findIndex(
          e =>
            e.type === 'image' &&
            locationX >= e.x &&
            locationX <= e.x + e.width &&
            locationY >= e.y &&
            locationY <= e.y + e.height,
        );
        if (imgIndex !== -1) {
          selectedImageRef.current = imgIndex;
          const img = elements[imgIndex] as Extract<DrawingElement, { type: 'image' }>;
          dragOffset.current = { x: locationX - img.x, y: locationY - img.y };
          return;
        }
        pointsRef.current = [{ x: locationX, y: locationY }];
        setCurrentPath(lineGenerator(pointsRef.current) ?? '');
      },
      onPanResponderMove: evt => {
        if (!editable) return;
        const { locationX, locationY } = evt.nativeEvent;
        if (selectedImageRef.current !== null && setElements) {
          const index = selectedImageRef.current;
          setElements(prev =>
            prev.map((el, i) =>
              i === index && el.type === 'image'
                ? {
                    ...el,
                    x: locationX - dragOffset.current.x,
                    y: locationY - dragOffset.current.y,
                  }
                : el,
            ),
          );
        } else {
          pointsRef.current.push({ x: locationX, y: locationY });
          setCurrentPath(lineGenerator(pointsRef.current) ?? '');
        }
      },
      onPanResponderRelease: () => {
        if (!editable) return;
        if (selectedImageRef.current !== null) {
          selectedImageRef.current = null;
          return;
        }
        if (pointsRef.current.length && setElements) {
          const path = lineGenerator(pointsRef.current) ?? '';
          const width = strokeWidthRef.current;
          setElements(prev => [
            ...prev,
            { type: 'path', d: path, color: strokeColorRef.current, width },
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
              strokeWidth={p.width ?? strokeWidth}
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
