import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Card, Eyebrow, Money, Pill, Row, Segmented, Tap, Toggle } from '@/components/ui';
import { name, riskyCustomers, shop } from '@/data/mock';
import { currentPlan, subscription } from '@/data/more';
import { Icon, type IconName } from '@/icons';
import { localeLabels, localeScripts, useI18n, type Locale, type TranslationKey } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Account — everything that is not daily work.
 *
 * This was the "More" tab. A fifth tab spent on a list of settings is a tab not
 * spent on Insights, and none of these screens is opened more than about once a
 * month; they belong behind the shop identity, which is where people look for
 * account-level things. Reached from the shop avatar on Today.
 *
 * The language and theme switches are wired to the real providers — this screen
 * is how the Sinhala, Tamil and dark builds are actually reachable.
 */
export default function AccountScreen() {
  const { c, isDark, setPreference } = useTheme();
  const { t, locale, setLocale } = useI18n();
  const shadow = useScrollShadow();

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('account.title')} onLeading={() => router.back()} />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s2,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s5,
        }}
      >
        {/* The shop ────────────────────────────────────────────────────── */}
        <Rise index={0}>
          <Card padding={space.s4} style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
            <Avatar initials={shop.initials} size={52} variant="contrast" />
            <View style={{ flex: 1, gap: 3 }}>
              <Txt variant="subheading">{name(shop.name, locale)}</Txt>
              {/* The plan name goes through the catalogue. It used to be the raw
                  string "Growth plan", so the Sinhala screen read
                  "Growth plan · අලුත් වන්නේ 2 Sep". */}
              <Txt variant="caption" color={c.body}>
                {t('more.planRenews', {
                  plan: t(currentPlan.nameKey),
                  date: subscription.renews,
                })}
              </Txt>
            </View>
            <Tap onPress={() => router.push('/subscription')} feedback="opacity" hitSlop={8}>
              <Txt variant="label" weight={600} color={c.accent}>
                {t('common.manage')}
              </Txt>
            </Tap>
          </Card>
        </Rise>

        {/* Shop destinations ───────────────────────────────────────────── */}
        <Rise index={1}>
          <View style={{ gap: space.s3 }}>
            <Eyebrow>{t('account.shop')}</Eyebrow>
            <Card flush>
              <LinkRow
                icon="shield"
                iconTone="warning"
                labelKey="more.codReliability"
                trailingPill={{
                  label: t('more.riskyCount', { count: riskyCustomers.length }),
                  tone: c.warning,
                }}
                href="/cod-reliability"
              />
              <LinkRow icon="wallet" labelKey="more.payments" href="/payments" />
              <LinkRow icon="truck" labelKey="more.couriers" href="/couriers" />
              <LinkRow
                icon="globe"
                labelKey="more.website"
                trailingPill={{ label: t('more.live'), tone: c.positive }}
                href="/website"
                last
              />
            </Card>
          </View>
        </Rise>

        {/* Preferences ─────────────────────────────────────────────────── */}
        <Rise index={2}>
          <View style={{ gap: space.s3 }}>
            <Eyebrow>{t('account.preferences')}</Eyebrow>
            <Card flush>
              <Row>
                <Txt flex={1} variant="label" weight={500}>
                  {t('more.language')}
                </Txt>
                {/* Each label renders in its own script, not the active
                    locale's. `සිං` and `தமிழ்` were being drawn in Instrument
                    Sans — mangled on web and tofu on Android — so a Sinhala
                    speaker on an English install could not read the option that
                    gets them to Sinhala. */}
                <Segmented
                  compact
                  value={locale}
                  onChange={(key) => setLocale(key as Locale)}
                  options={(['en', 'si', 'ta'] as Locale[]).map((l) => ({
                    key: l,
                    label: localeLabels[l],
                    script: localeScripts[l],
                  }))}
                />
              </Row>
              <Row>
                <Txt flex={1} variant="label" weight={500}>
                  {t('more.darkTheme')}
                </Txt>
                <Toggle
                  value={isDark}
                  label={t('more.darkTheme')}
                  onChange={(next) => setPreference(next ? 'dark' : 'light')}
                />
              </Row>
              {/* Settings, not the feed — the feed lives behind the bell on Today. */}
              <LinkRow icon="bell" labelKey="more.notifications" href="/notification-settings" last />
            </Card>
          </View>
        </Rise>

        {/* Support ─────────────────────────────────────────────────────── */}
        <Rise index={3}>
          <View style={{ gap: space.s3 }}>
            <Eyebrow>{t('account.support')}</Eyebrow>
            <Card flush>
              <LinkRow icon="globe" labelKey="more.help" href="/help" last />
            </Card>
          </View>
        </Rise>

        {/* Plan ────────────────────────────────────────────────────────── */}
        <Rise index={4}>
          <Card padding={space.s5} style={{ gap: space.s3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
              <Txt variant="subheading" flex={1}>
                {t(currentPlan.nameKey)}
              </Txt>
              <Money amount={currentPlan.price} variant="bodySm" weight={600} />
            </View>
            <Txt variant="bodySm" leading={1.55} color={c.body}>
              {t('more.planBody')}
            </Txt>
            <Button
              label={t('more.comparePlans')}
              variant="secondary"
              height={46}
              onPress={() => router.push('/subscription')}
              style={{ marginTop: space.s1 }}
            />
          </Card>
        </Rise>
      </ScrollView>
    </View>
  );
}

function LinkRow({
  icon,
  iconTone,
  labelKey,
  trailingText,
  trailingPill,
  href,
  last,
}: {
  icon: IconName;
  iconTone?: 'warning';
  labelKey: TranslationKey;
  trailingText?: string;
  trailingPill?: { label: string; tone: React.ComponentProps<typeof Pill>['tone'] };
  href: string;
  last?: boolean;
}) {
  const { c } = useTheme();
  const { t } = useI18n();
  const tinted = iconTone === 'warning';

  return (
    <Row last={last} onPress={() => router.push(href)}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: radius.sm,
          backgroundColor: tinted ? c.warning.bg : c.fill,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} color={tinted ? c.warning.fg : c.body} />
      </View>

      <Txt flex={1} variant="label" weight={500}>
        {t(labelKey)}
      </Txt>

      {trailingText ? (
        <Txt variant="caption" mono color={c.muted}>
          {trailingText}
        </Txt>
      ) : null}
      {trailingPill ? <Pill label={trailingPill.label} tone={trailingPill.tone} /> : null}

      <Icon name="chevronRight" size={16} color={c.faint} />
    </Row>
  );
}
