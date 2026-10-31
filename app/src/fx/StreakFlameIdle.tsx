import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { WebView } from 'react-native-webview';

import {
  APPROVED_FX10_MOTION,
  APPROVED_FX10_STATIC_SVG,
  APPROVED_FX10_SVG,
  APPROVED_FX_CUES,
} from '../assets/approvedAssets';
import { useTheme } from '../theme';

export interface StreakFlameIdleProps {
  readonly size?: number;
  readonly reducedMotion?: boolean;
  readonly reducedEffects?: boolean;
  readonly testID?: string;
}

export const FX10_CUES = APPROVED_FX_CUES['fx10-streak-flame-idle'];
export const FX10_MOTION_SPEC = APPROVED_FX10_MOTION;

export function StreakFlameIdle({
  size = 18,
  reducedMotion: reducedMotionProp,
  reducedEffects: reducedEffectsProp,
  testID = 'fx10-streak-flame-idle',
}: StreakFlameIdleProps): React.JSX.Element {
  const theme = useTheme();
  const reducedMotion = reducedMotionProp ?? theme.reducedMotion;
  const reducedEffects = reducedEffectsProp ?? theme.reducedEffects;
  const isStatic = reducedMotion || reducedEffects;

  const htmlDocument = useMemo(
    () =>
      `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;display:flex;align-items:center;justify-content:center;width:100%;height:100%;}svg{width:100%;height:100%;}</style></head><body>${APPROVED_FX10_SVG}</body></html>`,
    [],
  );

  return (
    <View
      testID={testID}
      accessibilityLabel="Active streak flame"
      style={[styles.wrap, { width: size, height: size }]}
      pointerEvents="none"
    >
      {isStatic ? (
        <View testID="fx10-flame-still" style={{ width: size, height: size }}>
          <SvgXml xml={APPROVED_FX10_STATIC_SVG} width={size} height={size} />
        </View>
      ) : (
        <View testID="fx10-flame-animated" style={{ width: size, height: size }}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlDocument }}
            style={[styles.webView, { width: size, height: size }]}
            scrollEnabled={false}
            pointerEvents="none"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  webView: {
    backgroundColor: 'transparent',
  },
});
