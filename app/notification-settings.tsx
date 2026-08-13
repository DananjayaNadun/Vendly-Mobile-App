import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Txt } from '@/components/Txt';
import { Card, Row, Toggle } from '@/components/ui';
import { notificationPrefs } from '@/data/more';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Notification settings.
 *
 * Separate from the notifications *feed* at `/notifications`. The framing
 * follows the feed's rule: alerts are for things the seller can act on, so each
 * row says what it will actually do.
 */
export default function NotificationSettingsScreen() {
  const { c } = useTheme();
  const { t } = useI18n();
  const shadow = useScrollShadow();

  const [prefs, setPrefs] = useState(notificationPrefs);
  const [quiet, setQuiet] = useState(true);

  const set = (id: string, on: boolean) =>
    setPrefs((prev) => prev.map((p) => (p.id === id ? { ...p, on } : p)));

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('nset.title')} onLeading={() => router.back()} />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s4,
        }}
      >
        <Txt variant="body" leading={1.6} color={c.body}>
          {t('nset.intro')}
        </Txt>

        <Rise index={0}>
          <Card flush>
            {prefs.map((pref, i) => (
              <Row key={pref.id} last={i === prefs.length - 1}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="label" weight={500}>
                    {t(pref.labelKey)}
                  </Txt>
                  <Txt variant="caption" color={c.muted}>
                    {t(pref.descKey)}
                  </Txt>
                </View>
                <Toggle value={pref.on} label={t(pref.labelKey)} onChange={(on) => set(pref.id, on)} />
              </Row>
            ))}
          </Card>
        </Rise>

        <Rise index={1}>
          <Card flush>
            <Row last>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="label" weight={500}>
                  {t('nset.quiet')}
                </Txt>
                <Txt variant="caption" color={c.muted}>
                  {quiet ? t('nset.quietRange') : t('nset.quietSub')}
                </Txt>
              </View>
              <Toggle value={quiet} label={t('nset.quiet')} onChange={setQuiet} />
            </Row>
          </Card>
        </Rise>
      </ScrollView>
    </View>
  );
}
