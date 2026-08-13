import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Txt } from '@/components/Txt';
import { Button, Card, Dot, Eyebrow, Meter, Pill, Row, Section, StatTile } from '@/components/ui';
import { money, name, shop } from '@/data/mock';
import { website } from '@/data/more';
import { Icon } from '@/icons';
import { openUrl, shareOnWhatsApp } from '@/lib/links';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Your free website.
 *
 * For a seller who works out of chat, the site is mostly a link they paste, so
 * the domain and the copy action come first and the settings sit below.
 */
export default function WebsiteScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const shadow = useScrollShadow();

  const share = () =>
    shareOnWhatsApp(
      t('web.shareMessage', {
        shop: name(shop.name, locale),
        url: `https://${website.domain}`,
      }),
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('web.title')} onLeading={() => router.back()} />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s5,
        }}
      >
        {/* ── The link ────────────────────────────────────────────────── */}
        <Rise index={0}>
          <Card padding={space.s5} style={{ gap: space.s4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
              <Dot color={website.live ? c.positive.dot : c.muted} />
              <Eyebrow>{t('web.liveAt')}</Eyebrow>
            </View>

            <Txt size={19} weight={500} mono tracking={-0.01} color={c.accent}>
              {website.domain}
            </Txt>

            {/* Both real links. "Copy link" used to sit here beside them with
                no handler; copying needs a clipboard module this project cannot
                currently install, and sharing is what a chat-based seller does
                with the link anyway. */}
            <View style={{ flexDirection: 'row', gap: space.s2 }}>
              <Button
                label={t('web.visit')}
                variant="quiet"
                flex={1}
                height={44}
                fontSize={14}
                onPress={() => openUrl(`https://${website.domain}`)}
              />
              <Button
                label={t('web.share')}
                variant="quiet"
                flex={1}
                height={44}
                fontSize={14}
                onPress={share}
              />
            </View>
          </Card>
        </Rise>

        {/* ── Traffic ─────────────────────────────────────────────────── */}
        <Rise index={1}>
          <View style={{ flexDirection: 'row', gap: space.s3 }}>
            <StatTile label={t('web.visits')} value={money(website.visits)} hint={t('web.last30')} />
            <StatTile
              label={t('web.ordersFromSite')}
              value={String(website.ordersFromSite)}
              hint={t('web.last30')}
            />
          </View>
        </Rise>

        {/* ── Store details ───────────────────────────────────────────── */}
        <Rise index={2}>
          <Section title={t('web.storeDetails')}>
            {/* Read-only. These carried chevrons and empty press handlers,
                promising three editors that do not exist. */}
            <Card flush>
              <Row>
                <Txt flex={1} variant="bodySm" color={c.body}>
                  {t('web.storeName')}
                </Txt>
                <Txt variant="label" weight={600}>
                  {website.storeName}
                </Txt>
              </Row>
              <Row>
                <Txt flex={1} variant="bodySm" color={c.body}>
                  {t('web.tagline')}
                </Txt>
                <Txt variant="label" weight={600} style={{ flexShrink: 1, textAlign: 'right' }}>
                  {website.tagline}
                </Txt>
              </Row>
              <Row last>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt variant="bodySm" color={c.body}>
                    {t('web.domain')}
                  </Txt>
                  <Txt variant="caption" color={c.muted}>
                    {t('web.customDomain', { plan: website.customDomainPlan })}
                  </Txt>
                </View>
                <Txt variant="label" weight={600} mono>
                  {website.domain}
                </Txt>
              </Row>
            </Card>
          </Section>
        </Rise>

        {/* ── Catalogue ───────────────────────────────────────────────── */}
        <Rise index={3}>
          <Section title={t('web.productsShown')}>
            <Card padding={space.s5} style={{ gap: space.s3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
                <Txt flex={1} variant="label" weight={500}>
                  {t('web.productsLive', {
                    live: website.productsLive,
                    total: website.productsTotal,
                  })}
                </Txt>
                <Pill label={t('more.live')} tone={c.positive} />
              </View>

              <Meter
                pct={(website.productsLive / website.productsTotal) * 100}
                tone={c.positive}
                height={10}
              />

              <Txt variant="caption" leading={1.55} color={c.muted}>
                {t('web.productsNote')}
              </Txt>
            </Card>
          </Section>
        </Rise>

        <Button label={t('web.share')} icon="chat" onPress={share} />
      </ScrollView>
    </View>
  );
}
