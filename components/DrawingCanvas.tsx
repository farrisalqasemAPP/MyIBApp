import React, { useEffect, useRef, useState } from 'react';
import { View, PanResponder, Image, Text, TextInput } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { line as d3Line, curveBasis } from 'd3-shape';

export type DrawingElement =
  | {
      type: 'path';
      d: string;
      color: string;
      width?: number;
      points?: { x: number; y: number }[];
    }
  | { type: 'image'; uri: string; x: number; y: number; width: number; height: number }
  | {
      type: 'text';
      text: string;
      x: number;
      y: number;
      color: string;
      fontSize?: number;
      width?: number;
      height?: number;
    };

interface DrawingCanvasProps {
  elements: DrawingElement[];
  setElements?: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
  strokeColor?: string;
  strokeWidth?: number;
  editable?: boolean;
  canvasSize?: number;
  eraser?: boolean;
  textMode?: boolean;
}

export default function DrawingCanvas({
  elements,
  setElements,
  strokeColor = '#000',
  strokeWidth = 4,
  editable = true,
  canvasSize = 2000,
  eraser = false,
  textMode = false,
}: DrawingCanvasProps) {
  const [currentPath, setCurrentPath] = useState('');
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  const eraserRef = useRef(eraser);
  const selectedImageRef = useRef<number | null>(null);
  const selectedTextRef = useRef<number | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const textModeRef = useRef(textMode);
  const [editingTextIndex, setEditingTextIndex] = useState<number | null>(null);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
  }, [strokeWidth]);

  useEffect(() => {
    eraserRef.current = eraser;
  }, [eraser]);

  useEffect(() => {
    textModeRef.current = textMode;
  }, [textMode]);

  const lineGenerator = useRef(
    d3Line<{ x: number; y: number }>()
      .x(p => p.x)
      .y(p => p.y)
      .curve(curveBasis),
  ).current;

  const eraseAtPoint = (x: number, y: number) => {
    if (!setElements) return;
    setElements(prev => {
      const index = prev.findIndex(
        el =>
          el.type === 'path' &&
          el.points?.some(p =>
            Math.hypot(p.x - x, p.y - y) <= (el.width ?? strokeWidthRef.current) + 5,
          ),
      );
      if (index !== -1) {
        const updated = [...prev];
        updated.splice(index, 1);
        return updated;
      }
      return prev;
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => editable,
      onPanResponderGrant: evt => {
        if (!editable) return;
        const { locationX, locationY } = evt.nativeEvent;
        if (textModeRef.current) {
          if (setElements) {
            const newIndex = elements.length;
            setElements(prev => [
              ...prev,
              {
                type: 'text',
                text: '',
                x: locationX,
                y: locationY,
                color: strokeColorRef.current,
              },
            ]);
            setEditingTextIndex(newIndex);
          }
          return;
        }
        if (eraserRef.current) {
          eraseAtPoint(locationX, locationY);
          return;
        }
        const textIndex = elements.findIndex(
          e =>
            e.type === 'text' &&
            locationX >= e.x &&
            locationX <= e.x + (e.width ?? 100) &&
            locationY >= e.y &&
            locationY <= e.y + (e.height ?? 30),
        );
        if (textIndex !== -1) {
          selectedTextRef.current = textIndex;
          const txt = elements[textIndex] as Extract<DrawingElement, { type: 'text' }>;
          dragOffset.current = { x: locationX - txt.x, y: locationY - txt.y };
          return;
        }
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
        if (textModeRef.current) return;
        if (eraserRef.current) {
          eraseAtPoint(locationX, locationY);
          return;
        }
        if (selectedTextRef.current !== null && setElements) {
          const index = selectedTextRef.current;
          setElements(prev =>
            prev.map((el, i) =>
              i === index && el.type === 'text'
                ? {
                    ...el,
                    x: locationX - dragOffset.current.x,
                    y: locationY - dragOffset.current.y,
                  }
                : el,
            ),
          );
        } else if (selectedImageRef.current !== null && setElements) {
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
        if (textModeRef.current || eraserRef.current) return;
        if (selectedTextRef.current !== null) {
          selectedTextRef.current = null;
          return;
        }
        if (selectedImageRef.current !== null) {
          selectedImageRef.current = null;
          return;
        }
        if (pointsRef.current.length && setElements) {
          const path = lineGenerator(pointsRef.current) ?? '';
          const width = strokeWidthRef.current;
          setElements(prev => [
            ...prev,
            {
              type: 'path',
              d: path,
              color: strokeColorRef.current,
              width,
              points: [...pointsRef.current],
            },
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
      {elements
        .filter(e => e.type === 'text')
        .map((t, i) => (
          editingTextIndex === i ? (
            <TextInput
              key={`text-${i}`}
              value={t.text}
              onChangeText={text => {
                if (setElements) {
                  setElements(prev =>
                    prev.map((el, idx) =>
                      idx === i && el.type === 'text' ? { ...el, text } : el,
                    ),
                  );
                }
              }}
              style={{
                position: 'absolute',
                left: t.x,
                top: t.y,
                color: t.color,
                fontSize: t.fontSize ?? 16,
                minWidth: 100,
              }}
              multiline
              autoFocus
              onBlur={() => setEditingTextIndex(null)}
              onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                if (setElements) {
                  setElements(prev =>
                    prev.map((el, idx) =>
                      idx === i && el.type === 'text'
                        ? { ...el, width, height }
                        : el,
                    ),
                  );
                }
              }}
            />
          ) : (
            <Text
              key={`text-${i}`}
              style={{
                position: 'absolute',
                left: t.x,
                top: t.y,
                color: t.color,
                fontSize: t.fontSize ?? 16,
              }}
              onPress={() => setEditingTextIndex(i)}
              onLayout={e => {
                const { width, height } = e.nativeEvent.layout;
                if (setElements) {
                  setElements(prev =>
                    prev.map((el, idx) =>
                      idx === i && el.type === 'text'
                        ? { ...el, width, height }
                        : el,
                    ),
                  );
                }
              }}
            >
              {t.text}
            </Text>
          )
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
