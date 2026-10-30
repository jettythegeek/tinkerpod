/**
 * Data-driven Content-Pack Player registry placeholder (implemented in M4).
 */
export const SUPPORTED_PACK_COMPONENT_TYPES = [
  'text',
  'image',
  'video',
  'quiz',
  'drag-and-drop',
  'code-block',
  'pip-line',
] as const;

export type PackComponentType = (typeof SUPPORTED_PACK_COMPONENT_TYPES)[number];
