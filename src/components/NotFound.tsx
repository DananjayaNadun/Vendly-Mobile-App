import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { useT } from '@/i18n';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { AppBar, TopChrome } from './AppBar';
import { Button, EmptyState } from './ui';

/**
 * Shown when a route names a record that does not exist.
 *
 * Detail screens used to fall back to the first item in the list instead, which
 * meant a stale link quietly showed a *different customer's* order — the worst
 * possible failure on a screen whose whole job is deciding whether to trust one
 * specific person with cash. Being unable to find it is the honest answer.
 */
export function NotFound({ title, message }: { title: string; message: string }) {
  const { c } = useTheme();
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome>
        <AppBar title={title} onLeading={() => router.back()} />
      </TopChrome>

      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: space.s5 }}>
        <EmptyState icon="search" title={title} body={message} />
        <Button
          label={t('common.back')}
          variant="secondary"
          onPress={() => router.back()}
          style={{ marginHorizontal: space.s5 }}
        />
      </View>
    </View>
  );
}
