import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  ClipPath,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { PIP_IDLE_DURATION_MS } from './constants';

export { PIP_IDLE_DURATION_MS, PIP_IDLE_SOURCE_ASSET } from './constants';

export interface PipIdleSvgProps {
  readonly size?: number;
  readonly reducedMotion?: boolean;
  readonly testID?: string;
}

/**
 * Renders Pip's approved idle rig directly from `design/motion/svg/pip-idle.svg`
 * using `react-native-svg` primitives and `react-native-reanimated`, honouring
 * reduced-motion preferences (`@media (prefers-reduced-motion: reduce)`).
 */
export function PipIdleSvg({
  size = 240,
  reducedMotion = false,
  testID = 'pip-idle-svg',
}: PipIdleSvgProps): React.JSX.Element {
  const bobOffset = useSharedValue<number>(0);

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(bobOffset);
      bobOffset.value = 0;
      return;
    }

    const halfCycle = PIP_IDLE_DURATION_MS / 2;
    bobOffset.value = withRepeat(
      withSequence(
        withTiming(-7, {
          duration: halfCycle,
          easing: Easing.inOut(Easing.sin),
        }),
        withTiming(0, {
          duration: halfCycle,
          easing: Easing.inOut(Easing.sin),
        }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(bobOffset);
    };
  }, [bobOffset, reducedMotion]);

  const animatedContainerStyle = useAnimatedStyle<ViewStyle>(() => ({
    transform: [{ translateY: bobOffset.value }],
  }));

  return (
    <Animated.View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="Pip the TinkerPod robot, Idle"
      style={[styles.container, { width: size, height: size }, animatedContainerStyle]}
    >
      <Svg
        viewBox="-70 -110 540 540"
        width={size}
        height={size}
      >
        <Defs>
          <LinearGradient id="limb" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor="#00A597" />
            <Stop offset="0.4" stopColor="#22D9C7" />
            <Stop offset="1" stopColor="#00A597" />
          </LinearGradient>
          <LinearGradient id="torsoG" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor="#00A194" />
            <Stop offset="0.32" stopColor="#2DDFCD" />
            <Stop offset="0.7" stopColor="#05C2B1" />
            <Stop offset="1" stopColor="#009587" />
          </LinearGradient>
          <RadialGradient id="shellG" cx="34%" cy="25%" r="90%">
            <Stop offset="0" stopColor="#5BF2E3" />
            <Stop offset="0.45" stopColor="#0CC9B7" />
            <Stop offset="1" stopColor="#009184" />
          </RadialGradient>
          <RadialGradient id="screenG" cx="40%" cy="30%" r="90%">
            <Stop offset="0" stopColor="#22336B" />
            <Stop offset="1" stopColor="#0D1838" />
          </RadialGradient>
          <RadialGradient id="earG" cx="35%" cy="30%" r="80%">
            <Stop offset="0" stopColor="#FFE07A" />
            <Stop offset="1" stopColor="#F2A900" />
          </RadialGradient>
          <RadialGradient id="ballG" cx="35%" cy="30%" r="75%">
            <Stop offset="0" stopColor="#FFC48A" />
            <Stop offset="0.6" stopColor="#FF8A1F" />
            <Stop offset="1" stopColor="#E86A00" />
          </RadialGradient>
          <ClipPath id="podTop">
            <Rect x="60" y="-20" width="280" height="112" />
          </ClipPath>
        </Defs>

        {/* Ground shadow */}
        <Ellipse id="shadow" cx="200" cy="392" rx="78" ry="11" fill="#0F172A" opacity={0.13} />

        <G id="pip">
          <G id="pip-squash">
            {/* Legs */}
            <G id="legs">
              <Rect x="165" y="318" width="28" height="56" rx="14" fill="url(#limb)" />
              <Rect x="155" y="360" width="42" height="24" rx="12" fill="#00978A" />
              <Rect x="161" y="363" width="18" height="6" rx="3" fill="#FFFFFF" opacity={0.25} />
              <Rect x="207" y="318" width="28" height="56" rx="14" fill="url(#limb)" />
              <Rect x="203" y="360" width="42" height="24" rx="12" fill="#00978A" />
              <Rect x="221" y="363" width="18" height="6" rx="3" fill="#FFFFFF" opacity={0.25} />
            </G>

            {/* Torso */}
            <G id="torso">
              <Rect x="138" y="226" width="124" height="114" rx="46" fill="url(#torsoG)" />
              <Rect x="148" y="300" width="104" height="34" rx="17" fill="#7FF5E9" opacity={0.32} />
              <Ellipse cx="166" cy="252" rx="14" ry="7" fill="#FFFFFF" opacity={0.28} />
              <G id="chest-lights">
                <Circle id="led-1" cx="180" cy="266" r="6.5" fill="#FF6B6B" />
                <Circle id="led-2" cx="200" cy="266" r="6.5" fill="#FFC21A" />
                <Circle id="led-3" cx="220" cy="266" r="6.5" fill="#A78BFA" />
              </G>
            </G>

            {/* Head */}
            <G id="head">
              {/* Antenna */}
              <G id="antenna">
                <Circle id="antenna-glow" cx="200" cy="28" r="24" fill="#FFB066" opacity={0.3} />
                <Rect x="196.5" y="30" width="7" height="56" rx="3.5" fill="#FF9A3C" />
                <Circle id="antenna-ball" cx="200" cy="28" r="13" fill="url(#ballG)" />
                <Circle cx="196" cy="23.5" r="4" fill="#FFFFFF" opacity={0.7} />
              </G>

              {/* Ears */}
              <G id="ear-l">
                <Ellipse cx="93" cy="160" rx="18" ry="33" fill="url(#earG)" />
                <Ellipse cx="89" cy="160" rx="7" ry="20" fill="#E39A00" opacity={0.45} />
              </G>
              <G id="ear-r">
                <Ellipse cx="307" cy="160" rx="18" ry="33" fill="url(#earG)" />
                <Ellipse cx="311" cy="160" rx="7" ry="20" fill="#E39A00" opacity={0.45} />
              </G>

              {/* Shell */}
              <Rect id="shell" x="92" y="76" width="216" height="168" rx="78" fill="url(#shellG)" />
              <Ellipse cx="102" cy="150" rx="4.5" ry="22" fill="#FFFFFF" opacity={0.35} />
              <Ellipse id="pod-opening" cx="200" cy="92" rx="72" ry="11" fill="#06655D" />

              {/* Toolkit inside pod opening */}
              <G id="toolkit" clipPath="url(#podTop)">
                <G id="gear">
                  <Path
                    d="M175.5,82.0 L181.6,86.5 L180.4,90.9 L172.9,91.8 L170.9,94.5 L172.7,101.9 L169.0,104.5 L162.7,100.3 L159.4,101.2 L156.0,108.0 L151.5,107.6 L149.3,100.3 L146.2,98.9 L139.3,101.9 L136.1,98.7 L139.1,91.8 L137.7,88.7 L130.4,86.5 L130.0,82.0 L136.8,78.6 L137.7,75.3 L133.5,69.0 L136.1,65.3 L143.5,67.1 L146.2,65.1 L147.1,57.6 L151.5,56.4 L156.0,62.5 L159.4,62.8 L164.9,57.6 L169.0,59.5 L168.5,67.1 L170.9,69.5 L178.5,69.0 L180.4,73.1 L175.2,78.6Z"
                    fill="#FFC21A"
                  />
                  <Circle cx="156" cy="82" r="8" fill="#E39A00" />
                  <Circle cx="153" cy="78" r="2.5" fill="#FFFFFF" opacity={0.5} />
                </G>
                <G id="code-chip">
                  <Rect x="181" y="66" width="38" height="28" rx="8" fill="#ECFFFB" />
                  <Path
                    d="M193 73 l-6 6 6 6 M205 72 l-6 15 M209 73 l6 6 -6 6"
                    fill="none"
                    stroke="#22B455"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </G>
                <G id="wrench" transform="translate(248, 60) rotate(18) scale(1.18)">
                  <Path
                    d="M-15 -2 L-15 -15 L-6 -15 L-6 -5 L6 -5 L6 -15 L15 -15 L15 -2 Q15 13 0 13 Q-15 13 -15 -2Z"
                    fill="#8B5CF6"
                  />
                  <Rect x="-6.5" y="8" width="13" height="46" rx="6.5" fill="#7C3AED" />
                  <Rect x="-3" y="12" width="3" height="30" rx="1.5" fill="#FFFFFF" opacity={0.3} />
                </G>
              </G>

              <Path
                d="M128 93 A72 11 0 0 0 272 93"
                fill="none"
                stroke="#F3FFFD"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
              <Rect id="face-rim" x="106" y="104" width="188" height="126" rx="56" fill="#F2FFFD" />
              <Rect id="screen" x="118" y="114" width="164" height="106" rx="46" fill="url(#screenG)" />
              <Path
                d="M140 132 Q150 120 172 119"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
                strokeLinecap="round"
                opacity={0.12}
              />

              {/* Face — Idle open eyes & smile */}
              <G id="face">
                <G id="eyes">
                  <G id="eye-l-open">
                    <Ellipse cx="166" cy="160" rx="21" ry="25" fill="#5EEAD4" opacity={0.16} />
                    <Rect x="153" y="143" width="26" height="34" rx="13" fill="#5EEAD4" />
                    <Circle cx="162" cy="152" r="4.6" fill="#FFFFFF" />
                    <Circle cx="171" cy="166" r="2" fill="#FFFFFF" opacity={0.7} />
                  </G>
                  <G id="eye-r-open">
                    <Ellipse cx="234" cy="160" rx="21" ry="25" fill="#5EEAD4" opacity={0.16} />
                    <Rect x="221" y="143" width="26" height="34" rx="13" fill="#5EEAD4" />
                    <Circle cx="230" cy="152" r="4.6" fill="#FFFFFF" />
                    <Circle cx="239" cy="166" r="2" fill="#FFFFFF" opacity={0.7} />
                  </G>
                </G>
                <G id="mouth-smile">
                  <Path
                    d="M185 191 Q200 205 215 191"
                    fill="none"
                    stroke="#5EEAD4"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </G>
              </G>
            </G>

            {/* Left arm */}
            <G id="arm-l" transform="rotate(22, 148, 252)">
              <Rect
                x="134"
                y="242"
                width="28"
                height="64"
                rx="14"
                fill="url(#limb)"
                stroke="#00968A"
                strokeWidth="2"
              />
              <G id="hand-l">
                <Circle
                  cx="148"
                  cy="316"
                  r="18.5"
                  fill="url(#limb)"
                  stroke="#00968A"
                  strokeWidth="2"
                />
                <Ellipse
                  cx="159"
                  cy="306"
                  rx="8"
                  ry="7"
                  fill="url(#limb)"
                  stroke="#00968A"
                  strokeWidth="2"
                />
                <Ellipse cx="143" cy="309" rx="5" ry="3.5" fill="#FFFFFF" opacity={0.35} />
              </G>
            </G>

            {/* Right arm */}
            <G id="arm-r" transform="rotate(-22, 252, 252)">
              <Rect
                x="238"
                y="242"
                width="28"
                height="64"
                rx="14"
                fill="url(#limb)"
                stroke="#00968A"
                strokeWidth="2"
              />
              <G id="hand-r">
                <Circle
                  cx="252"
                  cy="316"
                  r="18.5"
                  fill="url(#limb)"
                  stroke="#00968A"
                  strokeWidth="2"
                />
                <Ellipse
                  cx="241"
                  cy="306"
                  rx="8"
                  ry="7"
                  fill="url(#limb)"
                  stroke="#00968A"
                  strokeWidth="2"
                />
                <Ellipse cx="257" cy="309" rx="5" ry="3.5" fill="#FFFFFF" opacity={0.35} />
              </G>
            </G>
          </G>
        </G>
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
