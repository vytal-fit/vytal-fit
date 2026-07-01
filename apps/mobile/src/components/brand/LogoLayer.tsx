import React, { useEffect } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { VytalMark } from "./VytalMark";

type Intensity = "subtle" | "bold";

const OPACITIES: Record<Intensity, { glow: number; mark: number }> = {
  subtle: { glow: 0.35, mark: 0.04 },
  bold: { glow: 0.6, mark: 0.07 },
};

/**
 * Ambient brand backdrop for React Native screens: a soft green radial glow
 * (svg RadialGradient fading to transparent — RN has no CSS blur) plus a large,
 * very faint VytalMark watermark that slowly drifts. Purely decorative:
 * absolute-fill, pointerEvents="none", transform/opacity-only animation.
 *
 * Brand rules preserved: the mark keeps its fixed colors (#22c55e / #08120c);
 * only its container opacity is lowered here.
 */
export function LogoLayer({ intensity = "subtle" }: { intensity?: Intensity }) {
  const { width, height } = useWindowDimensions();
  const { glow, mark } = OPACITIES[intensity];

  const drift = useSharedValue(0);

  useEffect(() => {
    drift.value = withRepeat(
      withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [drift]);

  const markSize = Math.min(width, height) * 0.9;

  const driftStyle = useAnimatedStyle(() => ({
    opacity: mark,
    transform: [
      { translateX: (drift.value - 0.5) * 24 },
      { translateY: (0.5 - drift.value) * 32 },
      { rotate: `${(drift.value - 0.5) * 6}deg` },
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Soft green radial glow, anchored top-center */}
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient
            id="vytalGlow"
            cx="50%"
            cy="28%"
            rx="70%"
            ry="55%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor="#22c55e" stopOpacity={glow} />
            <Stop offset="0.5" stopColor="#22c55e" stopOpacity={glow * 0.35} />
            <Stop offset="1" stopColor="#22c55e" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#vytalGlow)" />
      </Svg>

      {/* Large, faint, slowly-drifting watermark mark */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: "center", justifyContent: "center" },
          driftStyle,
        ]}
        pointerEvents="none"
      >
        <VytalMark size={markSize} animated />
      </Animated.View>
    </View>
  );
}
