import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { money, name, type Customer } from '@/data/mock';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space, type RiskLevel } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Avatar, Card, Money, Pill, Tap } from './ui';
import { Txt } from './Txt';

/** The risk ramp's labels, resolved once per render tree that needs them. */
export function useRiskLabels(): Record<RiskLevel, string> {
  const { t } = useI18n();
  return {
    excellent: t('risk.excellent'),
    good: t('risk.good'),
    average: t('risk.average'),
    risky: t('risk.risky'),
    high: t('risk.high'),
  };
}

/**
 * A customer in a list.
 *
 * Reliability is the reason this screen exists, so it is carried twice: as the
 * coloured edge down the leading side of the card, which makes the list
 * scannable without reading, and as the labelled pill for everyone who needs the
 * actual word.
 */
export function CustomerRow({ customer, index = 0 }: { customer: Customer; index?: number }) {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const labels = useRiskLabels();
  const tone = c.risk[customer.risk];

  return (
    <Rise index={index}>
      <Tap
        onPress={() => router.push({ pathname: '/customer/[id]', params: { id: customer.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${name(customer.name, locale)}, ${labels[customer.risk]}`}
      >
        <Card
          radius={radius.lg}
          edge={tone}
          style={{
            padding: space.s3,
            paddingLeft: space.s4,
            paddingRight: space.s4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.s3,
          }}
        >
          <Avatar initials={customer.initials} size={44} tone={tone} />

          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="subheading" numberOfLines={1}>
              {name(customer.name, locale)}
            </Txt>
            <Txt variant="caption" mono color={c.muted}>
              {customer.phone}
            </Txt>
            <Txt variant="caption" color={c.muted}>
              {customer.lastOrder
                ? t('customers.lastOrder', { date: customer.lastOrder })
                : t('customers.noOrders')}
            </Txt>
          </View>

          <View style={{ alignItems: 'flex-end', gap: space.s2 }}>
            <Money amount={customer.totalSpent ?? 0} variant="bodySm" weight={600} />
            <Pill label={labels[customer.risk]} tone={tone} dot bordered />
          </View>
        </Card>
      </Tap>
    </Rise>
  );
}
