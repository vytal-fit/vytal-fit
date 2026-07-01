import React from "react";
import {
  Pressable,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { mass: 0.6, damping: 14, stiffness: 240 } as const;

/**
 * A Pressable that scales down to ~0.96 on press-in and springs back on
 * press-out, giving buttons a tactile feel. Reanimated transform-only, so it
 * stays on the UI thread. Forwards onPress and merges the caller's style.
 */
export function PressableScale({
  onPress,
  children,
  style,
  disabled,
  ...rest
}: {
  onPress?: (e: GestureResponderEvent) => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
} & Omit<React.ComponentProps<typeof Pressable>, "onPress" | "style" | "children">) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.96, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING);
      }}
      style={[style, animatedStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
