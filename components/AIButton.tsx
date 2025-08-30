import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SiriIcon from './SiriIcon';

interface Props {
  bottomOffset?: number;
  size?: number;
  align?: 'center' | 'right';
  rightOffset?: number;
}

export default function AIButton({
  bottomOffset = 20,
  size,
  align = 'center',
  rightOffset = 20,
}: Props) {
  const float = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: -8,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [float]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | undefined;
    if (loading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
    } else {
      pulse.setValue(1);
    }
    return () => animation?.stop();
  }, [loading, pulse]);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/tutor');
    }, 1000);
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: float }], bottom: bottomOffset },
          align === 'right'
            ? { right: rightOffset, alignSelf: 'flex-end' }
            : { alignSelf: 'center' },
        ]}
      >
        <TouchableOpacity onPress={handlePress}>
          <SiriIcon size={size} />
        </TouchableOpacity>
      </Animated.View>
      {loading && (
        <LinearGradient colors={['#00008b', '#2e1065']} style={styles.overlay}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <SiriIcon size={(size ?? 60) * 1.5} />
          </Animated.View>
        </LinearGradient>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

