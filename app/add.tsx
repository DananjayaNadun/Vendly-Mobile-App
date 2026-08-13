import { router } from 'expo-router';
import React from 'react';

import { AddIntentSheet } from '@/components/AddIntentSheet';

/**
 * Navigation variant 1c's intent sheet, given its own route.
 *
 * The shipped navigation is 1b, where the FAB dives straight into the order
 * builder — but 1c is the only treatment where "add stock" and "add customer"
 * have a home, so it stays reachable by long-pressing the same button. Being a
 * route rather than local state also means it can be opened directly at `/add`
 * for review.
 */
export default function AddRoute() {
  return <AddIntentSheet visible onClose={() => router.back()} />;
}
