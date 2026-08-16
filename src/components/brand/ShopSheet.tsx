import React from 'react';
import { Animated, Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useT, type Script } from '@/i18n';
import { useReveal } from '@/theme/motion';
import { brand, brandRadius } from '@/theme/brand';

/**
 * A bottom sheet in the Vendly.lk language.
 *
 * The design never draws one — every screen in the handoff is a full page — but
 * several of its controls have nowhere to go without one ("+ Add", a courier
 * row, the language switch). A sheet keeps those on the screen that owns them
 * instead of inventing extra routes the design does not have.
 *
 * Driven by `useReveal` so the scrim fades in step with the panel, matching the
 * motion the rest of the app already uses.
 */
export function ShopSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { mounted, scrimStyle, contentStyle } = useReveal(visible, 'bottom');

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Both halves are `Animated.View`: `useReveal` hands back animated
          values, and a plain `View` would drop them silently. */}
      <Animated.View style={[{ flex: 1, backgroundColor: 'rgba(17,20,24,0.45)' }, scrimStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={t('common.close')} />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: brand.surface,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            paddingTop: 12,
            paddingBottom: insets.bottom + 16,
            maxHeight: '82%',
          },
          contentStyle,
        ]}
      >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: brandRadius.pill,
              backgroundColor: '#DDE1E6',
              alignSelf: 'center',
            }}
          />

          <View style={{ paddingTop: 18, paddingHorizontal: 24, gap: 6 }}>
            <Txt size={19} weight={600} tracking={-0.016} color={brand.text}>
              {title}
            </Txt>
            {subtitle ? (
              <Txt size={13} leading={1.5} color={brand.body}>
                {subtitle}
              </Txt>
            ) : null}
          </View>

        <ScrollView contentContainerStyle={{ paddingTop: 14, paddingHorizontal: 16 }}>
          {children}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

/** A tappable row inside a sheet: an optional icon, a label, an optional tick. */
export function SheetRow({
  label,
  sub,
  icon,
  script,
  selected,
  destructive,
  onPress,
}: {
  label: string;
  sub?: string;
  icon?: LineIconName;
  /** Forces the label's face — the language picker names each language in itself. */
  script?: Script;
  selected?: boolean;
  destructive?: boolean;
  onPress: () => void;
}) {
  const ink = destructive ? '#F20000' : brand.text;
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-checked={selected}
      feedback="highlight"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 56,
        paddingHorizontal: 12,
        borderRadius: brandRadius.card,
        backgroundColor: selected ? '#EEF4FF' : 'transparent',
      }}
    >
      {icon ? <LineIcon name={icon} size={20} color={destructive ? '#F20000' : brand.primary} /> : null}
      <View style={{ flex: 1, gap: 3 }}>
        <Txt size={15} weight={selected ? 600 : 500} script={script} color={ink}>
          {label}
        </Txt>
        {sub ? (
          // The sub takes the same script: in the language picker it is the
          // short form of the same name, so inheriting the *active* locale
          // rendered "தமிழ்" in the Sinhala face.
          <Txt size={12} script={script} color={brand.muted}>
            {sub}
          </Txt>
        ) : null}
      </View>
      {selected ? <LineIcon name="check" size={18} color={brand.primary} strokeWidth={2.4} /> : null}
    </Tap>
  );
}
