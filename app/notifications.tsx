import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Txt } from '@/components/Txt';
import { Button, Card, Dot, Eyebrow, Row } from '@/components/ui';
import { money } from '@/data/mock';
import { Icon, type IconName } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Notifications — only things you can act on.
 *
 * Split into a section that needs a decision, carrying its own action and its
 * own risk edge, and a passive log. Nothing here is a nudge for its own sake:
 * every entry either costs money or asks a question.
 */
export default function NotificationsScreen() {
  const { c } = useTheme();
  const { t } = useI18n();
  const shadow = useScrollShadow();

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar
          title={t('notif.title')}
          onLeading={() => router.back()}
          trailingLabel={t('notif.markAllRead')}
        />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s3,
        }}
      >
        <Eyebrow style={{ paddingHorizontal: space.s1 }}>{t('notif.needsDecision')}</Eyebrow>

        <Rise index={0}>
          <Card edge={c.warning} padding={space.s4} style={{ paddingLeft: space.s4 + space.s1, gap: space.s3 }}>
            <View style={{ flexDirection: 'row', gap: space.s3 }}>
              <Badge icon="warningTriangle" tone="warning" />
              <View style={{ flex: 1, gap: 3 }}>
                <Txt variant="subheading">{t('notif.riskyWaiting')}</Txt>
                <Txt variant="bodySm" leading={1.5} color={c.body}>
                  {t('notif.riskyWaitingBody', { id: '#VD-2418', amount: money(11200) })}
                </Txt>
              </View>
            </View>
            <Button
              label={t('notif.reviewOrder')}
              variant="contrast"
              height={42}
              fontSize={14}
              onPress={() => router.push({ pathname: '/order/[id]', params: { id: 'VD-2418' } })}
            />
          </Card>
        </Rise>

        <Rise index={1}>
          <Card
            edge={c.critical}
            padding={space.s4}
            style={{ paddingLeft: space.s4 + space.s1, flexDirection: 'row', gap: space.s3 }}
          >
            <Badge icon="truck" tone="critical" />
            <View style={{ flex: 1, gap: 3 }}>
              <Txt variant="subheading">{t('notif.refused')}</Txt>
              <Txt variant="bodySm" leading={1.5} color={c.body}>
                {t('notif.refusedBody', { id: '#VD-2389', courier: 'Pronto', fee: money(450) })}
              </Txt>
              <Txt variant="caption" color={c.muted}>
                {t('notif.hourAgo', { count: 1 })}
              </Txt>
            </View>
          </Card>
        </Rise>

        <Eyebrow style={{ paddingTop: space.s3, paddingHorizontal: space.s1 }}>
          {t('notif.earlierToday')}
        </Eyebrow>

        <Rise index={2}>
          <Card flush>
            <LogRow
              dot={c.positive.dot}
              title={t('notif.delivered', { count: 6, amount: money(28400) })}
              when={t('notif.hoursAgo', { count: 3 })}
            />
            <LogRow
              dot={c.warning.dot}
              title={t('notif.outOfStock', { product: 'Handloom Scarf · Indigo' })}
              when={t('notif.hoursAgo', { count: 5 })}
            />
            <LogRow dot={c.handle} title={t('notif.weeklyReport')} when={t('common.yesterday')} last />
          </Card>
        </Rise>
      </ScrollView>
    </View>
  );
}

/** The tinted glyph tile that opens an actionable notification. */
function Badge({ icon, tone }: { icon: IconName; tone: 'warning' | 'critical' }) {
  const { c } = useTheme();
  const colors = c[tone];
  return (
    <View
      style={{
        width: 38,
        height: 38,
        borderRadius: radius.sm,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={19} color={colors.fg} />
    </View>
  );
}

function LogRow({
  dot,
  title,
  when,
  last,
}: {
  dot: string;
  title: string;
  when: string;
  last?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Row last={last} style={{ alignItems: 'flex-start' }}>
      <View style={{ paddingTop: 6 }}>
        <Dot color={dot} size={9} />
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <Txt variant="label" weight={600}>
          {title}
        </Txt>
        <Txt variant="caption" color={c.muted}>
          {when}
        </Txt>
      </View>
    </Row>
  );
}
