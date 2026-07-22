// components/tool/ReferenceTablesBody.tsx
//
// Editorial-style reference table renderer for lookup-style tool content
// (food/macro guides). Toggles between named views (e.g. Quick Reference
// vs Complete Macros) at the top. Each view is a list of sections, each
// section a stack of grouped tables. The Food column gets the breathing
// room; numeric columns are narrow and right-aligned so the eye can scan
// down a column without snagging.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import type { ReferenceTable, ReferenceView } from '../../lib/tools';

type Props = {
  intro?: string;
  views: ReferenceView[];
  footnote?: string;
};

export function ReferenceTablesBody({ intro, views, footnote }: Props) {
  const colors = useThemeColors();
  const [activeId, setActiveId] = useState<string>(views[0]?.id ?? '');
  const active = views.find((v) => v.id === activeId) ?? views[0];

  return (
    <View style={styles.stack}>
      {intro ? <Text style={[styles.intro, { color: colors.text }]}>{intro}</Text> : null}

      {views.length > 1 ? (
        <View style={[styles.toggle, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          {views.map((v) => {
            const isActive = v.id === active?.id;
            return (
              <Pressable
                key={v.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Show ${v.label}`}
                onPress={() => setActiveId(v.id)}
                style={({ pressed }) => [
                  styles.toggleBtn,
                  isActive && { backgroundColor: colors.accent },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.toggleLabel,
                    { color: isActive ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {v.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {active?.description ? (
        <Text style={[styles.viewDescription, { color: colors.mutedText }]}>{active.description}</Text>
      ) : null}

      {active?.sections.map((section) => (
        <View key={section.label} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>{section.label}</Text>
          {section.subtitle ? (
            <Text style={[styles.sectionSubtitle, { color: colors.mutedText }]}>{section.subtitle}</Text>
          ) : null}
          <View style={styles.tableStack}>
            {section.tables.map((table) => (
              <TableCard key={table.label} table={table} />
            ))}
          </View>
        </View>
      ))}

      {footnote ? (
        <Text style={[styles.footnote, { color: colors.mutedText }]}>{footnote}</Text>
      ) : null}
    </View>
  );
}

function TableCard({ table }: { table: ReferenceTable }) {
  const colors = useThemeColors();
  const numericCount = Math.max(0, table.headers.length - 2);

  return (
    <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.tableLabel, { color: colors.text }]}>{table.label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tableScrollContent}
      >
        <View style={{ minWidth: 280 + numericCount * 56 }}>
          <View style={[styles.headerRow, { backgroundColor: colors.cardAlt }]}>
            {table.headers.map((h, i) => (
              <Text
                key={`${h}-${i}`}
                style={[
                  styles.headerCell,
                  i === 0 ? styles.foodCol : styles.numCol,
                  i === 1 ? styles.servingCol : null,
                  { color: colors.mutedText },
                ]}
              >
                {h}
              </Text>
            ))}
          </View>
          {table.rows.map((row, ri) => {
            const isZebra = ri % 2 === 1;
            return (
              <View
                key={`${table.label}-${ri}`}
                style={[
                  styles.dataRow,
                  { borderColor: colors.border },
                  isZebra && { backgroundColor: colors.cardAlt },
                ]}
              >
                {row.map((cell, i) => (
                  <Text
                    key={`${ri}-${i}`}
                    style={[
                      styles.dataCell,
                      i === 0 ? styles.foodCol : styles.numCol,
                      i === 1 ? styles.servingCol : null,
                      i === 0
                        ? { color: colors.text, fontFamily: FONTS.sansMedium }
                        : { color: colors.text },
                    ]}
                  >
                    {cell}
                  </Text>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  dataCell: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 18,
  },
  dataRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  footnote: {
    fontFamily: FONTS.sans,
    fontSize: 12.5,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 8,
  },
  foodCol: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 140,
    textAlign: 'left',
  },
  headerCell: {
    fontFamily: FONTS.sansBold,
    fontSize: 10.5,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  intro: {
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
    lineHeight: 23,
  },
  numCol: {
    minWidth: 48,
    textAlign: 'right',
  },
  section: { gap: 6 },
  sectionLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 4,
  },
  servingCol: {
    minWidth: 70,
    textAlign: 'left',
  },
  stack: { gap: 20 },
  tableCard: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    overflow: 'hidden',
    paddingTop: 12,
  },
  tableLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    letterSpacing: -0.05,
    paddingHorizontal: 12,
  },
  tableScrollContent: {
    paddingBottom: 0,
  },
  tableStack: { gap: 12, marginTop: 4 },
  toggle: {
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 3,
  },
  toggleBtn: {
    alignItems: 'center',
    borderRadius: 999,
    flexBasis: 0,
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: -0.05,
  },
  viewDescription: {
    fontFamily: FONTS.sans,
    fontSize: 13.5,
    lineHeight: 19,
    marginTop: -4,
  },
});
