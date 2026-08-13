/**
 * Motion.
 *
 * Built on React Native's own `Animated` rather than Reanimated: everything
 * here is opacity and transform, which the native driver already handles, and
 * avoiding the dependency keeps the app buildable on web for review without a
 * Babel plugin or a native rebuild.
 *
 * Motion in this app is explanatory, never decorative. A row rises because it
 * arrived; a sheet springs from the bottom because that is where it lives; a
 * figure counts up because it is being recalculated in front of you. Nothing
 * animates for longer than it takes to read it.
 *
 * Every hook respects the OS "reduce motion" setting and collapses to a plain
 * cut when it is on.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, type ViewStyle } from 'react-native';

import { motion } from './tokens';

/**
 * Tracks the OS reduce-motion preference and keeps it live — users toggle it
 * mid-session, usually because something in the app made them queasy.
 */
export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);

// ─────────────────────────────────────────────────────────────────────────────
// Press
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The press feedback used by every tappable surface.
 *
 * The old app dropped opacity to 0.6, which on a white card just looks like the
 * screen dimmed. Scaling down instead reads as the surface being physically
 * pushed, and it releases on a spring so it feels like it has weight.
 */
export function usePressAnim(scaleTo: number = motion.pressScale) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReduceMotion();

  const onPressIn = useCallback(() => {
    if (reduced) return;
    Animated.timing(scale, {
      toValue: scaleTo,
      duration: motion.duration.instant,
      easing: easeOut,
      useNativeDriver: true,
    }).start();
  }, [reduced, scale, scaleTo]);

  const onPressOut = useCallback(() => {
    if (reduced) return;
    Animated.spring(scale, {
      toValue: 1,
      ...motion.spring,
      useNativeDriver: true,
    }).start();
  }, [reduced, scale]);

  return { scale, onPressIn, onPressOut };
}

// ─────────────────────────────────────────────────────────────────────────────
// Entrance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fades and lifts a block into place, optionally staggered by its position in a
 * list. The stagger is capped so a long list does not leave the last row
 * arriving noticeably after the user has started reading.
 */
export function useRise(index = 0, enabled = true) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReduceMotion();

  useEffect(() => {
    if (!enabled) return;
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.base,
      delay: Math.min(index, 8) * motion.stagger,
      easing: easeOut,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [enabled, index, progress, reduced]);

  const style = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({
      opacity: progress,
      transform: [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [motion.rise, 0],
          }),
        },
      ],
    }),
    [progress],
  );

  return style;
}

/** Declarative wrapper around {@link useRise}. */
export function Rise({
  index = 0,
  enabled = true,
  style,
  children,
}: {
  index?: number;
  enabled?: boolean;
  style?: Animated.WithAnimatedObject<ViewStyle>;
  children?: React.ReactNode;
}) {
  const rise = useRise(index, enabled);
  return <Animated.View style={[rise, style]}>{children}</Animated.View>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Visibility
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Drives an overlay in and out, and reports when it is safe to unmount.
 *
 * Overlays cannot simply stop rendering when `visible` flips false or the exit
 * animation never runs, so this keeps the subtree mounted until the animation
 * settles and exposes `mounted` for the caller to gate on.
 */
export function useReveal(visible: boolean, from: 'bottom' | 'centre' = 'bottom') {
  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(visible);
  const reduced = useReduceMotion();

  useEffect(() => {
    if (visible) setMounted(true);

    if (reduced) {
      progress.setValue(visible ? 1 : 0);
      if (!visible) setMounted(false);
      return;
    }

    if (visible) {
      const enter = Animated.spring(progress, {
        toValue: 1,
        ...(from === 'bottom' ? motion.springSoft : motion.spring),
        useNativeDriver: true,
      });
      enter.start();
      return () => enter.stop();
    }

    const exit = Animated.timing(progress, {
      toValue: 0,
      duration: motion.duration.fast,
      easing: easeInOut,
      useNativeDriver: true,
    });
    exit.start();

    // Unmounting runs off a timer, not the animation's completion callback:
    // that callback is skipped whenever the animation is interrupted or the
    // frame loop is throttled, which would strand a dismissed sheet mounted —
    // and a mounted sheet still holds its modal and its scrim.
    const timer = setTimeout(() => setMounted(false), motion.duration.fast + 60);
    return () => {
      exit.stop();
      clearTimeout(timer);
    };
  }, [visible, from, progress, reduced]);

  const scrimStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () => ({ opacity: progress }),
    [progress],
  );

  const contentStyle = useMemo<Animated.WithAnimatedObject<ViewStyle>>(
    () =>
      from === 'bottom'
        ? {
            opacity: progress,
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [420, 0],
                }),
              },
            ],
          }
        : {
            opacity: progress,
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.92, 1],
                }),
              },
            ],
          },
    [from, progress],
  );

  return { mounted, scrimStyle, contentStyle };
}

// ─────────────────────────────────────────────────────────────────────────────
// Values
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Counts a figure up to its target.
 *
 * This one cannot use the native driver — it drives text content, not a style —
 * so it is kept short and is only ever applied to the single hero figure on a
 * screen. Re-runs whenever the target changes, so a recalculated total visibly
 * moves rather than silently swapping.
 */
export function useCountUp(target: number, enabled = true): number {
  const driver = useRef(new Animated.Value(target)).current;
  const [shown, setShown] = useState(target);
  const reduced = useReduceMotion();

  useEffect(() => {
    if (!enabled || reduced) {
      driver.setValue(target);
      setShown(target);
      return;
    }

    const id = driver.addListener(({ value }) => setShown(Math.round(value)));
    const animation = Animated.timing(driver, {
      toValue: target,
      duration: motion.duration.slow,
      easing: easeOut,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) setShown(target);
    });

    return () => {
      animation.stop();
      driver.removeListener(id);
    };
  }, [target, enabled, reduced, driver]);

  return shown;
}

/**
 * Grows a bar from zero to `pct` on mount. Used by the analytics chart and the
 * COD reliability meters, where the growth is what makes the comparison legible.
 */
export function useGrow(pct: number, index = 0) {
  const progress = useRef(new Animated.Value(0)).current;
  const reduced = useReduceMotion();

  useEffect(() => {
    if (reduced) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: motion.duration.slow,
      delay: Math.min(index, 12) * 35,
      easing: easeOut,
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, index, reduced, pct]);

  return progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${Math.max(0, Math.min(100, pct))}%`],
  });
}
