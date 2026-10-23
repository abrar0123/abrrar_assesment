import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { colors, fonts, radius } from '@/src/theme';

interface Props {
  total: number;
  busy: boolean;
  onPay: () => void;
}

export function CheckoutBar({ total, busy, onPay }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.totalBox}>
        <Text style={styles.label}>Total Price</Text>
        <Text style={styles.value}>$ {total}</Text>
      </View>
      <Button title="Proceed to pay" onPress={onPay} disabled={busy} style={styles.pay} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  totalBox: {
    width: 108,
    height: 50,
    borderRadius: radius.card,
    backgroundColor: colors.chip,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  label: { fontFamily: fonts.regular, fontSize: 10, color: colors.text },
  value: { fontFamily: fonts.semibold, fontSize: 16, color: colors.text },
  pay: { flex: 1 },
});
