/* eslint-disable @typescript-eslint/no-require-imports */
import { ImageSourcePropType } from 'react-native';

export const APPROVED_LOGO_ASSET: ImageSourcePropType = require('../../../design/assets/logo.png');

export const APPROVED_AVATAR_ASSETS: Record<string, ImageSourcePropType> = {
  'av1.png': require('../../../design/assets/av1.png'),
  'av2.png': require('../../../design/assets/av2.png'),
  'av3.png': require('../../../design/assets/av3.png'),
  'av4.png': require('../../../design/assets/av4.png'),
  'av5.png': require('../../../design/assets/av5.png'),
  'av6.png': require('../../../design/assets/av6.png'),
  'av-girl.png': require('../../../design/assets/av-girl.png'),
};

export const APPROVED_AVATAR_KEYS = Object.keys(APPROVED_AVATAR_ASSETS);

export function resolveApprovedAvatar(filename: string): ImageSourcePropType | null {
  const normalized = filename.trim().toLowerCase();
  const key = normalized.endsWith('.png') ? normalized : `${normalized}.png`;
  return APPROVED_AVATAR_ASSETS[key] ?? null;
}
