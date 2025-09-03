import React, { useState } from 'react';
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <View style={{ flex: 1 }}>
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
              canvasSize={canvasSize}
            />
          </ScrollView>
        </ScrollView>
        <View style={styles.toolbar}>
          {['#000000', '#ff0000', '#00ff00', '#0000ff'].map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.selected]}
              onPress={() => setColor(c)}
            />
          ))}
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="checkmark" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#fff',
  },
});
