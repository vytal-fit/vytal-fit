import React, { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Svg, { Rect, Path } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * The Vytal mark for React Native — a vital-sign pulse on a rounded green tile.
 * Brand rules: green tile (#22c55e), dark pulse (#08120c), never recolored or
 * gradient-filled. When `animated`, the pulse draws itself (stroke-dashoffset)
 * and the tile gently breathes — the signature motion, matched to the web kit.
 * Respects reduced-motion by accepting `animated={false}`.
 */
export function VytalMark({
  size = 40,
  animated = true,
  style,
}: {
  size?: number;
  animated?: boolean;
  style?: ViewStyle;
}) {
  const draw = useSharedValue(animated ? 120 : 0);
  const breathe = useSharedValue(1);

  useEffect(() => {
    if (!animated) {
      draw.value = 0;
      breathe.value = 1;
      return;
    }
    draw.value = withRepeat(
      withTiming(0, { duration: 1900, easing: Easing.bezier(0.65, 0, 0.35, 1) }),
      -1,
      true,
    );
    breathe.value = withRepeat(
      withTiming(1.04, { duration: 2250, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [animated, draw, breathe]);

  const pathProps = useAnimatedProps(() => ({ strokeDashoffset: draw.value }));
  const tileStyle = useAnimatedStyle(() => ({ transform: [{ scale: breathe.value }] }));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View style={[{ width: size, height: size }, tileStyle]}>
        <Svg width={size} height={size} viewBox="0 0 64 64">
          <Rect x={2} y={2} width={60} height={60} rx={16} fill="#22c55e" />
          <AnimatedPath
            d="M11 35 L23 35 L27 25 L32 45 L37 16 L41 35 L53 35"
            fill="none"
            stroke="#08120c"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={120}
            animatedProps={pathProps}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}
