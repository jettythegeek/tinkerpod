import {
  ageBandThemes,
  colors,
  fonts,
  resolveThemeModeForAge,
  tokens,
} from '../theme/tokens';
import { PIP_IDLE_DURATION_MS, PIP_IDLE_SOURCE_ASSET, PIP_MOODS } from '../pip/constants';
import { APPROVED_FX_CUES } from '../fx';
import { SUPPORTED_PACK_COMPONENT_TYPES } from '../pack-player';

describe('TinkerPod design tokens and approved asset bindings', () => {
  it('exposes the locked colour palette and Nunito font definitions', () => {
    expect(fonts.family).toBe('Nunito');
    expect(colors.teal).toBe('#00BFAE');
    expect(colors.buttonTeal).toBe('#007A70');
    expect(colors.ink).toBe('#0F172A');
    expect(colors.kidPurple).toBe('#7C3AED');
    expect(colors.accents.amber).toBe('#FFB700');
    expect(colors.accents.coral).toBe('#FF6B6B');
    expect(colors.accents.blue).toBe('#2563EB');
    expect(colors.success).toBe('#63C132');
    expect(colors.bg).toBe('#F8FAFC');
    expect(colors.adminNavy).toBe('#101B4D');
  });

  it('supports junior (5-11) and senior (12-18) age-band theme modes', () => {
    expect(ageBandThemes.junior.minAge).toBe(5);
    expect(ageBandThemes.junior.maxAge).toBe(11);
    expect(ageBandThemes.senior.minAge).toBe(12);
    expect(ageBandThemes.senior.maxAge).toBe(18);

    expect(resolveThemeModeForAge(5)).toBe('junior');
    expect(resolveThemeModeForAge(11)).toBe('junior');
    expect(resolveThemeModeForAge(12)).toBe('senior');
    expect(resolveThemeModeForAge(18)).toBe('senior');
    expect(tokens.ageBandThemes.junior.mode).toBe('junior');
    expect(tokens.ageBandThemes.senior.mode).toBe('senior');
  });

  it('binds Pip idle animation and FX cues strictly to design/ paths and moods.json timings', () => {
    expect(PIP_IDLE_SOURCE_ASSET).toBe('design/motion/svg/pip-idle.svg');
    expect(PIP_IDLE_DURATION_MS).toBe(3200);
    expect(Math.round(PIP_MOODS.idle.dur * 1000)).toBe(PIP_IDLE_DURATION_MS);
    expect(Object.keys(PIP_MOODS)).toEqual([
      'idle',
      'wave',
      'happy',
      'sad',
      'laugh',
      'clap',
      'cheer',
    ]);

    for (const fxPath of Object.values(APPROVED_FX_CUES)) {
      expect(fxPath.startsWith('design/fx/svg/fx0')).toBe(true);
    }

    expect(SUPPORTED_PACK_COMPONENT_TYPES).toContain('pip-line');
  });
});
