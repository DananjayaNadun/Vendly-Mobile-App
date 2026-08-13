import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { customers, products, type Customer } from '@/data/mock';

/**
 * Shared state for the three-step order builder.
 *
 * The design's claim is that a returning customer's order takes about fifteen
 * seconds, which only holds if the phone number recalls everything else — so the
 * draft is keyed on the number, and matching a customer pre-fills their address,
 * their reliability rating and what they bought last time.
 */

export type DraftLine = { productId: string; qty: number };

type OrderDraftValue = {
  phone: string;
  setPhone: (next: string) => void;
  appendDigit: (digit: string) => void;
  backspace: () => void;

  /** The customer the typed number resolves to, if any. */
  match: Customer | null;
  /** Set when the seller taps "Someone new" instead of the match. */
  isNewCustomer: boolean;
  chooseNew: () => void;
  customer: Customer | null;

  lines: DraftLine[];
  setQty: (productId: string, qty: number) => void;
  qtyOf: (productId: string) => number;

  itemCount: number;
  subtotal: number;
  delivery: number;
  discount: number;
  setDiscount: (amount: number) => void;
  total: number;

  payment: 'cod' | 'bank' | 'advance';
  setPayment: (next: 'cod' | 'bank' | 'advance') => void;
  notifyWhatsapp: boolean;
  setNotifyWhatsapp: (next: boolean) => void;

  reset: () => void;
};

const DELIVERY_FEE = 350;

/**
 * Matching is a prefix check against saved customers, which is what makes the
 * design's step 1 work: the match card appears part-way through typing.
 */
function matchCustomer(phone: string): Customer | null {
  const digits = phone.replace(/\s/g, '');
  if (digits.length < 6) return null;
  return (
    Object.values(customers).find((cust) => cust.phone.replace(/\s/g, '').startsWith(digits)) ?? null
  );
}

const OrderDraftContext = createContext<OrderDraftValue | null>(null);

export function OrderDraftProvider({ children }: { children: React.ReactNode }) {
  // Empty. This was pre-seeded with eight digits of Nimali's number and two of
  // her line items so the flow opened on the design's screenshot — which meant
  // Add never once opened a blank order, and every new order started as
  // somebody else's.
  const [phone, setPhone] = useState('');
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [payment, setPayment] = useState<'cod' | 'bank' | 'advance'>('cod');
  const [discount, setDiscount] = useState(0);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);

  /** Sri Lankan numbers group 3-3-4; the pad formats as the seller types. */
  const format = (digits: string) => {
    const d = digits.slice(0, 10);
    const parts = [d.slice(0, 3), d.slice(3, 6), d.slice(6, 10)].filter(Boolean);
    return parts.join(' ');
  };

  const appendDigit = useCallback((digit: string) => {
    setPhone((prev) => format(prev.replace(/\s/g, '') + digit));
    setIsNewCustomer(false);
  }, []);

  const backspace = useCallback(() => {
    setPhone((prev) => format(prev.replace(/\s/g, '').slice(0, -1)));
    setIsNewCustomer(false);
  }, []);

  /**
   * Edits a line in place. The previous version filtered the line out and
   * re-appended it, so changing a quantity silently moved that line to the
   * bottom of the order — invisible while step 3 showed only a total, and
   * jarring the moment it listed the lines.
   */
  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.productId !== productId);
      if (prev.some((l) => l.productId === productId)) {
        return prev.map((l) => (l.productId === productId ? { ...l, qty } : l));
      }
      return [...prev, { productId, qty }];
    });
  }, []);

  const qtyOf = useCallback(
    (productId: string) => lines.find((l) => l.productId === productId)?.qty ?? 0,
    [lines],
  );

  const match = useMemo(() => matchCustomer(phone), [phone]);

  const { itemCount, subtotal } = useMemo(() => {
    let count = 0;
    let sum = 0;
    for (const line of lines) {
      const product = products.find((p) => p.id === line.productId);
      if (!product) continue;
      count += line.qty;
      sum += product.price * line.qty;
    }
    return { itemCount: count, subtotal: sum };
  }, [lines]);

  const reset = useCallback(() => {
    setPhone('');
    setIsNewCustomer(false);
    setLines([]);
    setPayment('cod');
    setDiscount(0);
    setNotifyWhatsapp(true);
  }, []);

  // Delivery is only charged on something, and a discount can never exceed it.
  const delivery = lines.length === 0 ? 0 : DELIVERY_FEE;
  const cappedDiscount = Math.min(discount, subtotal);

  const value = useMemo<OrderDraftValue>(
    () => ({
      phone,
      setPhone,
      appendDigit,
      backspace,
      match,
      isNewCustomer,
      chooseNew: () => setIsNewCustomer(true),
      customer: isNewCustomer ? null : match,
      lines,
      setQty,
      qtyOf,
      itemCount,
      subtotal,
      delivery,
      discount: cappedDiscount,
      setDiscount,
      total: subtotal + delivery - cappedDiscount,
      payment,
      setPayment,
      notifyWhatsapp,
      setNotifyWhatsapp,
      reset,
    }),
    [
      phone,
      appendDigit,
      backspace,
      match,
      isNewCustomer,
      lines,
      setQty,
      qtyOf,
      itemCount,
      subtotal,
      delivery,
      cappedDiscount,
      payment,
      notifyWhatsapp,
      reset,
    ],
  );

  return <OrderDraftContext.Provider value={value}>{children}</OrderDraftContext.Provider>;
}

export function useOrderDraft(): OrderDraftValue {
  const value = useContext(OrderDraftContext);
  if (!value) throw new Error('useOrderDraft must be used inside <OrderDraftProvider>');
  return value;
}
