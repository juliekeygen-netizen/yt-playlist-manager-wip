import type { CSSProperties } from 'react';
import type { ChildOverlayVisualSettings, OverlayVisualSettings, PopupVisualSettings } from '@shared/settings';

export function buildOverlayBackdropStyle(visuals: OverlayVisualSettings): CSSProperties {
  return {
    backgroundColor: `rgba(7, 21, 35, ${visuals.backgroundOpacity})`,
    backdropFilter: `blur(${visuals.backgroundBlurPx}px)`,
  };
}

export function buildOverlayGlowStyle(visuals: OverlayVisualSettings): CSSProperties {
  const spread = visuals.glowSpread;
  return {
    backgroundImage: [
      `radial-gradient(circle at 50% 42%, rgba(96,165,250,${0.014 * visuals.glowStrength}), transparent ${60 * spread}rem)`,
      `radial-gradient(circle at 42% 58%, rgba(20,184,166,${0.01 * visuals.glowStrength}), transparent ${56 * spread}rem)`,
      `radial-gradient(circle at 58% 62%, rgba(244,114,182,${0.006 * visuals.glowStrength}), transparent ${52 * spread}rem)`,
    ].join(','),
  };
}

export function buildOverlayModalStyle(visuals: OverlayVisualSettings): CSSProperties {
  const shadowStrength = visuals.modalShadowStrength;
  return {
    backgroundColor: `rgba(7, 20, 33, ${visuals.modalOpacity})`,
    borderColor: `rgba(255,255,255,${visuals.modalBorderBrightness})`,
    boxShadow: `0 ${10 + 4 * shadowStrength}px ${24 + 10 * shadowStrength}px rgba(0,0,0,${0.5 * shadowStrength})`,
    backdropFilter: 'blur(12px)',
  };
}

export function buildChildParentStyle(visuals: ChildOverlayVisualSettings): CSSProperties {
  return {
    filter: `blur(${visuals.parentBlurPx}px)`,
    opacity: 1 - visuals.parentDimOpacity * 0.42,
    transform: 'scale(0.995)',
  };
}

export function buildChildModalStyle(visuals: ChildOverlayVisualSettings): CSSProperties {
  const shadowStrength = visuals.childModalShadowStrength;
  return {
    backgroundColor: `rgba(7, 20, 33, ${visuals.childModalOpacity})`,
    borderColor: `rgba(255,255,255,${visuals.childModalBorderBrightness})`,
    boxShadow: [
      `0 ${24 + 4 * shadowStrength}px ${70 + 12 * shadowStrength}px rgba(0,0,0,${0.68 * shadowStrength})`,
      `0 0 0 1px rgba(147,197,253,${0.08 * shadowStrength})`,
      `0 0 ${42 + 8 * shadowStrength}px rgba(59,130,246,${0.13 * shadowStrength})`,
    ].join(','),
    transform: `scale(${visuals.childModalScale})`,
    backdropFilter: 'blur(16px)',
  };
}

export function buildPopupBackdropStyle(visuals: PopupVisualSettings): CSSProperties {
  return {
    backgroundColor: `rgba(7, 16, 28, ${visuals.popupBackdropOpacity})`,
    backdropFilter: `blur(${visuals.popupBackdropBlurPx}px)`,
  };
}

export function buildPopupModalStyle(visuals: PopupVisualSettings): CSSProperties {
  const shadowStrength = visuals.popupShadowStrength;
  return {
    backgroundColor: `rgba(7, 20, 33, ${visuals.popupOpacity})`,
    borderColor: `rgba(255,255,255,${visuals.popupBorderBrightness})`,
    boxShadow: [
      `0 ${18 + 5 * shadowStrength}px ${58 + 14 * shadowStrength}px rgba(0,0,0,${0.62 * shadowStrength})`,
      `0 0 ${32 + 8 * shadowStrength}px rgba(59,130,246,${0.12 * shadowStrength})`,
    ].join(','),
    transform: `scale(${visuals.popupScale})`,
    backdropFilter: 'blur(16px)',
  };
}
