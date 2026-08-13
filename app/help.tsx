import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, UIManager, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Txt } from '@/components/Txt';
import { Button, Card, EmptyState, Eyebrow, SearchField, Tap } from '@/components/ui';
import { helpTopics, support, type HelpTopic } from '@/data/more';
import { Icon } from '@/icons';
import { openWhatsApp } from '@/lib/links';
import { useI18n, type TranslationKey } from '@/i18n';
import { Rise, useReduceMotion } from '@/theme/motion';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

// Android needs this opted into before LayoutAnimation will run.
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Help centre.
 *
 * Search matches the translated question and answer, so a Sinhala or Tamil
 * seller searches in their own language rather than guessing at English terms.
 */
export default function HelpScreen() {
  const { c } = useTheme();
  const { t } = useI18n();
  const shadow = useScrollShadow();
  const reduceMotion = useReduceMotion();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(helpTopics[0].id);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return helpTopics;
    return helpTopics.filter(
      (topic) =>
        t(topic.questionKey).toLowerCase().includes(q) ||
        t(topic.answerKey).toLowerCase().includes(q),
    );
  }, [query, t]);

  // Group into the categories the list is authored in, preserving their order.
  const groups = useMemo(() => {
    const out: { categoryKey: TranslationKey; topics: HelpTopic[] }[] = [];
    for (const topic of matches) {
      const last = out[out.length - 1];
      if (last && last.categoryKey === topic.categoryKey) last.topics.push(topic);
      else out.push({ categoryKey: topic.categoryKey, topics: [topic] });
    }
    return out;
  }, [matches]);

  const toggle = (id: string) => {
    if (!reduceMotion) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((prev) => (prev === id ? null : id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('help.title')} onLeading={() => router.back()} />
        <View style={{ paddingHorizontal: space.gutter, paddingBottom: space.s3 }}>
          <SearchField value={query} onChange={setQuery} placeholder={t('search.help')} />
        </View>
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s5,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {query.trim() === '' ? (
          <Txt variant="body" leading={1.6} color={c.body}>
            {t('help.intro')}
          </Txt>
        ) : null}

        {groups.length === 0 ? (
          <EmptyState
            icon="search"
            title={t('search.none', { query: query.trim() })}
            action={t('search.cancel')}
            onAction={() => setQuery('')}
          />
        ) : (
          groups.map((group, gi) => (
            <Rise key={group.categoryKey} index={gi}>
              <View style={{ gap: space.s2 }}>
                <Eyebrow>{t(group.categoryKey)}</Eyebrow>
                <Card flush>
                  {group.topics.map((topic, i) => {
                    const expanded = open === topic.id;
                    return (
                      <View
                        key={topic.id}
                        style={
                          i === group.topics.length - 1
                            ? undefined
                            : { borderBottomWidth: 1, borderBottomColor: c.divider }
                        }
                      >
                        <Tap
                          onPress={() => toggle(topic.id)}
                          feedback="highlight"
                          accessibilityRole="button"
                          accessibilityState={{ expanded }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: space.s3,
                            paddingVertical: space.s4,
                            paddingHorizontal: space.s4,
                          }}
                        >
                          <Txt flex={1} variant="label" weight={600} leading={1.45}>
                            {t(topic.questionKey)}
                          </Txt>
                          <View
                            style={{
                              paddingTop: 2,
                              transform: [{ rotate: expanded ? '180deg' : '0deg' }],
                            }}
                          >
                            <Icon name="chevronDown" size={16} color={c.muted} />
                          </View>
                        </Tap>

                        {expanded ? (
                          <View
                            style={{
                              paddingHorizontal: space.s4,
                              paddingBottom: space.s4,
                              marginTop: -space.s2,
                            }}
                          >
                            <Txt variant="bodySm" leading={1.6} color={c.body}>
                              {t(topic.answerKey)}
                            </Txt>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </Card>
              </View>
            </Rise>
          ))
        )}

        {/* Escape hatch. */}
        <Card padding={space.s5} style={{ gap: space.s3 }}>
          <Txt variant="subheading">{t('help.stuck')}</Txt>
          <Txt variant="bodySm" leading={1.6} color={c.body}>
            {t('help.stuckBody')}
          </Txt>
          <Button
            label={t('help.contact')}
            height={46}
            icon="chat"
            onPress={() => openWhatsApp(support.phone)}
          />
        </Card>
      </ScrollView>
    </View>
  );
}
