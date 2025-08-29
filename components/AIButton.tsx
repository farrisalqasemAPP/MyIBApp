import React, { useEffect, useRef, useState } from 'react';
import { TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SiriIcon from './SiriIcon';

interface Props {
  bottomOffset?: number;
  size?: number;
}

export default function AIButton({ bottomOffset = 20, size }: Props) {
  const float = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
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
        Animated.timing(spin, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      animation.start();
    }
    return () => animation?.stop();
  }, [loading, spin]);

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => {
      router.push('/tutor');
    }, 1000);
  };

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          { transform: [{ translateY: float }], bottom: bottomOffset },
        ]}
      >
        <TouchableOpacity onPress={handlePress}>
          <SiriIcon size={size} />
        </TouchableOpacity>
      </Animated.View>
      {loading && (
        <LinearGradient colors={['#00008b', '#2e1065']} style={styles.overlay}>
          <Animated.View style={{ transform: [{ rotate }] }}>
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
    alignSelf: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

