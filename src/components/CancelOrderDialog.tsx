import React, { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/icons';
import { useT, type TranslationKey } from '@/i18n';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Dialog, RadioRow } from './Overlays';
import { Txt } from './Txt';
import { Button } from './ui';

/**
 * The destructive confirm.
 *
 * The reason picker is not bookkeeping: it decides whether the cancellation
 * touches the customer's COD Reliability. The note spells that out, so a seller
 * never quietly damages a good customer's score by picking the wrong reason.
 */

const REASONS: { key: string; labelKey: TranslationKey }[] = [
  { key: 'mind', labelKey: 'cancel.reasonMind' },
  { key: 'fulfil', labelKey: 'cancel.reasonFulfil' },
  { key: 'fake', labelKey: 'cancel.reasonFake' },
];

export function CancelOrderDialog({
  visible,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (reason: string) => void;
}) {
  const { c } = useTheme();
  const t = useT();
  const [reason, setReason] = useState('mind');

  return (
    <Dialog visible={visible} onClose={onClose}>
      <Txt variant="heading" size={20}>
        {t('cancel.title')}
      </Txt>
      <Txt variant="body" leading={1.55} color={c.body}>
        {t('cancel.body')}
      </Txt>

      <View style={{ gap: space.s2 }} accessibilityRole="radiogroup">
        {REASONS.map((r) => (
          <RadioRow
            key={r.key}
            label={t(r.labelKey)}
            selected={reason === r.key}
            onPress={() => setReason(r.key)}
          />
        ))}
      </View>

      <View
        style={{
          backgroundColor: c.surfaceSunken,
          borderRadius: radius.md,
          padding: space.s3,
          flexDirection: 'row',
          gap: space.s3,
        }}
      >
        <Icon name="shield" size={17} color={c.muted} />
        <Txt flex={1} variant="caption" leading={1.5} color={c.body}>
          {t('cancel.note')}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', gap: space.s3, paddingTop: space.s1 }}>
        <Button label={t('cancel.keep')} variant="secondary" flex={1} height={48} onPress={onClose} />
        <Button
          label={t('cancel.confirm')}
          variant="danger"
          flex={1}
          height={48}
          onPress={() => {
            onConfirm?.(reason);
            onClose();
          }}
        />
      </View>
    </Dialog>
  );
}
