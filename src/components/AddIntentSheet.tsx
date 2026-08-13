import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Icon, type IconName } from '@/icons';
import { useT, type TranslationKey } from '@/i18n';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Sheet } from './Overlays';
import { Txt } from './Txt';
import { Tap } from './ui';

/**
 * The "What are you adding?" sheet, opened by long-pressing Add.
 *
 * Tapping Add still dives straight into the order builder, because that is the
 * overwhelmingly common case and a menu in front of it would cost a tap every
 * time. This sheet is the shortcut for the other three intents — each of which
 * is now *also* reachable from the screen that owns it, so nothing here is the
 * only route to anything.
 */

type Intent = {
  key: string;
  icon: IconName;
  titleKey: TranslationKey;
  subKey: TranslationKey;
  href: string;
};

/**
 * `href` is required. The product and customer intents used to sit here with no
 * destination, alongside two that had one — a sheet whose whole job is routing,
 * half of which routed nowhere. Creating a product or a customer from scratch is
 * a screen this app does not have yet; until it does, the sheet does not offer it.
 */
const INTENTS: Intent[] = [
  {
    key: 'order',
    icon: 'list',
    titleKey: 'add.order',
    subKey: 'add.orderSub',
    href: '/new-order/step1',
  },
  { key: 'stock', icon: 'box', titleKey: 'add.stock', subKey: 'add.stockSub', href: '/products?stock=1' },
];

export function AddIntentSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const t = useT();

  return (
    <Sheet visible={visible} onClose={onClose} title={t('add.title')}>
      <View style={{ paddingHorizontal: space.s3, paddingTop: space.s3, paddingBottom: space.s1 }}>
        {INTENTS.map((intent, i) => {
          const primary = i === 0;
          return (
            <Tap
              key={intent.key}
              accessibilityRole="button"
              accessibilityLabel={t(intent.titleKey)}
              onPress={() => {
                onClose();
                router.push(intent.href);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.s4,
                minHeight: size.touch + 12,
                paddingVertical: space.s3,
                paddingHorizontal: space.s3,
                borderRadius: radius.lg,
                backgroundColor: primary ? c.accentSoft : 'transparent',
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: radius.sm,
                  backgroundColor: primary ? c.accent : c.fill,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  name={intent.icon}
                  size={20}
                  color={primary ? c.onAccent : c.body}
                  strokeWidth={primary ? 1.9 : 1.7}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="body" weight={600}>
                  {t(intent.titleKey)}
                </Txt>
                <Txt variant="caption" color={c.body}>
                  {t(intent.subKey)}
                </Txt>
              </View>
              <Icon name="chevronRight" size={17} color={c.muted} />
            </Tap>
          );
        })}
      </View>
    </Sheet>
  );
}
