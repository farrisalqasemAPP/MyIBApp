import React, { useState } from 'react';
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DrawingCanvas, { DrawingElement } from './DrawingCanvas';

interface Props {
  visible: boolean;
  onClose: () => void;
  elements: DrawingElement[];
  setElements: React.Dispatch<React.SetStateAction<DrawingElement[]>>;
}

export default function DrawingBoardModal({
  visible,
  onClose,
  elements,
  setElements,
}: Props) {
  const [color, setColor] = useState('#000000');
  const [eraser, setEraser] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [textMode, setTextMode] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const COLORS = [
    '#000000',
    '#ff0000',
    '#0000ff',
    '#008000',
    '#ffff00',
    '#ff00ff',
    '#ffa500',
    '#00ffff',
  ];
  const SIZES = [4, 8, 12, 16];
  const canvasSize = 2000;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const img = result.assets[0];
      setElements(prev => [
        ...prev,
        {
          type: 'image',
          uri: img.uri,
          x: 100,
          y: 100,
          width: img.width ?? 200,
          height: img.height ?? 200,
        },
      ]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={{ flex: 1, backgroundColor: darkMode ? '#000' : '#fff' }}>
        <View style={styles.modeToggle}>
          <TouchableOpacity onPress={() => setDarkMode(m => !m)}>
            <Ionicons
              name={darkMode ? 'sunny' : 'moon'}
              size={24}
              color={darkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          bounces={false}
          contentContainerStyle={{ width: canvasSize }}
        >
          <ScrollView
            bounces={false}
            contentContainerStyle={{ height: canvasSize }}
          >
            <DrawingCanvas
              elements={elements}
              setElements={setElements}
              strokeColor={color}
              strokeWidth={strokeWidth}
              canvasSize={canvasSize}
              eraser={eraser}
              textMode={textMode}
            />
          </ScrollView>
        </ScrollView>
        <View
          style={[
            styles.toolbar,
            { backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' },
          ]}
        >
          <TouchableOpacity onPress={() => setShowColors(s => !s)}>
            <Ionicons name="color-palette" size={24} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSizes(s => !s)}>
            <Ionicons
              name={showSizes ? 'chevron-down' : 'chevron-up'}
              size={24}
              color={darkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTextMode(t => !t)}>
            <Ionicons
              name="text"
              size={24}
              color={textMode ? '#ffd700' : darkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEraser(e => !e)}>
            {eraser ? (
              <Ionicons name="pencil" size={24} color={darkMode ? '#fff' : '#000'} />
            ) : (
              <FontAwesome name="eraser" size={24} color={darkMode ? '#fff' : '#000'} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image" size={24} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="checkmark" size={24} color={darkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        {showColors && (
          <View style={styles.colorPalette}>
            {COLORS.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: c,
                    borderColor: c === color ? '#fff' : 'transparent',
                  },
                ]}
                onPress={() => {
                  setColor(c);
                  setShowColors(false);
                }}
              />
            ))}
          </View>
        )}
        {showSizes && (
          <View style={styles.sizePalette}>
            {SIZES.map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.sizeSwatch,
                  {
                    width: s,
                    height: s,
                    borderRadius: s / 2,
                    borderColor: s === strokeWidth ? '#fff' : 'transparent',
                  },
                ]}
                onPress={() => {
                  setStrokeWidth(s);
                  setShowSizes(false);
                }}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 10,
  },
  colorPalette: {
    position: 'absolute',
    bottom: 60,
    left: 10,
    flexDirection: 'row',
  },
  sizePalette: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
  sizeSwatch: {
    marginVertical: 4,
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 4,
    borderWidth: 2,
  },
  modeToggle: {
    position: 'absolute',
    top: 40,
    right: 10,
    zIndex: 10,
  },
});
