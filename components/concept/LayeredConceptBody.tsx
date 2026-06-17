// components/concept/LayeredConceptBody.tsx
import { ChevronDown, Headphones, ScrollText } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useConceptTelemetry } from '../../hooks/useConceptTelemetry';
import { useThemeColors } from '../../hooks/useTheme';
import { FONTS } from '../../lib/brand';
import type { ConceptScope } from '../../lib/conceptMetadata';
import type { LayeredContent } from '../../lib/layeredContent';
import { ChecklistBody } from '../tool/ChecklistBody';
import { FillInTemplateBody } from '../tool/FillInTemplateBody';
import { MenuListBody } from '../tool/MenuListBody';
import { StaticPageBody } from '../tool/StaticPageBody';
import { LayerAudioPlayer } from './LayerAudioPlayer';

type Props = {
  conceptSlug: string;
  block: ConceptScope;
  content: LayeredContent;
};

type L2Mode = 'read' | 'listen';

export function LayeredConceptBody({ conceptSlug, block, content }: Props) {
  const colors = useThemeColors();
  const t = useConceptTelemetry();

  const hasAudio = content.layer2?.kind === 'text-or-audio';
  const [l2Mode, setL2Mode] = useState<L2Mode>(hasAudio ? 'listen' : 'read');
  const [l3Open, setL3Open] = useState(false);
  const layer1Fired = useRef(false);
  const layer2ReadStartFired = useRef(false);
  const layer2ListenStartFired = useRef(false);
  const layer3StartFired = useRef(false);

  // Layer 1 view event fires once when the concept renders.
  useEffect(() => {
    if (layer1Fired.current) return;
    layer1Fired.current = true;
    t.recordLayer1Viewed(conceptSlug, block);
  }, [conceptSlug, block, t]);

  // Layer 2 start event depends on the chosen mode.
  useEffect(() => {
    if (!content.layer2) return;
    if (l2Mode === 'read' && !layer2ReadStartFired.current) {
      layer2ReadStartFired.current = true;
      t.recordLayer2ReadStart(conceptSlug, block);
    }
    if (l2Mode === 'listen' && !layer2ListenStartFired.current) {
      layer2ListenStartFired.current = true;
      t.recordLayer2ListenStart(conceptSlug, block);
    }
  }, [l2Mode, content.layer2, conceptSlug, block, t]);

  const openL3 = useCallback(() => {
    setL3Open(true);
    if (!layer3StartFired.current) {
      layer3StartFired.current = true;
      t.recordLayer3Start(conceptSlug, block);
    }
  }, [conceptSlug, block, t]);

  return (
    <View style={styles.wrap}>
      {/* Layer 1 — required 30-sec overview */}
      <View style={[styles.layer1, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
        <Text style={[styles.kicker, { color: colors.accent }]}>30 SECOND OVERVIEW</Text>
        <Text style={[styles.layer1Body, { color: colors.text }]}>{content.layer1.body}</Text>
      </View>

      {/* Layer 2 — core teaching, read OR listen */}
      {content.layer2 ? (
        <View style={styles.layer2Wrap}>
          {hasAudio ? (
            <View style={styles.modeRow}>
              <ModeButton
                active={l2Mode === 'read'}
                icon={<ScrollText size={16} color={l2Mode === 'read' ? '#FFFFFF' : colors.text} />}
                label="Read"
                onPress={() => setL2Mode('read')}
                colors={colors}
              />
              <ModeButton
                active={l2Mode === 'listen'}
                icon={
                  <Headphones size={16} color={l2Mode === 'listen' ? '#FFFFFF' : colors.text} />
                }
                label="Listen"
                onPress={() => setL2Mode('listen')}
                colors={colors}
              />
            </View>
          ) : null}

          {l2Mode === 'listen' && content.layer2.kind === 'text-or-audio' ? (
            <LayerAudioPlayer
              uri={content.layer2.audioUri}
              durationSec={content.layer2.audioDurationSec}
              onComplete={() => t.recordLayer2ListenComplete(conceptSlug, block)}
            />
          ) : (
            <Layer2ReadBody body={content.layer2.body} conceptSlug={conceptSlug} />
          )}
        </View>
      ) : null}

      {/* Layer 3 — optional deep dive */}
      {content.layer3 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={l3Open ? 'Collapse deep dive' : 'Open deep dive'}
          onPress={l3Open ? () => setL3Open(false) : openL3}
          style={[styles.l3Toggle, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.l3ToggleRow}>
            <Text style={[styles.l3Kicker, { color: colors.accent }]}>GO DEEPER · OPTIONAL</Text>
            <ChevronDown
              color={colors.mutedText}
              size={18}
              style={l3Open ? styles.chevOpen : undefined}
            />
          </View>
          <Text style={[styles.l3Title, { color: colors.text }]}>{content.layer3.title}</Text>
          {l3Open ? (
            <View style={styles.l3Inner}>
              <Text style={[styles.l3Body, { color: colors.mutedText }]}>{content.layer3.body}</Text>
              <LayerAudioPlayer
                uri={content.layer3.audioUri}
                durationSec={content.layer3.audioDurationSec}
                onComplete={() => t.recordLayer3Complete(conceptSlug, block)}
              />
            </View>
          ) : null}
        </Pressable>
      ) : null}
    </View>
  );
}

function ModeButton({
  active,
  icon,
  label,
  onPress,
  colors,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.modeBtn,
        {
          backgroundColor: active ? colors.accent : colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.modeLabel,
          { color: active ? '#FFFFFF' : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Layer2ReadBody({
  body,
  conceptSlug,
}: {
  body: import('../../lib/tools').ToolBody;
  conceptSlug: string;
}) {
  if (body.kind === 'static-page')
    return <StaticPageBody intro={body.intro} sections={body.sections} />;
  if (body.kind === 'checklist')
    return <ChecklistBody toolSlug={conceptSlug} intro={body.intro} items={body.items} />;
  if (body.kind === 'menu-list')
    return <MenuListBody intro={body.intro} items={body.items} />;
  return <FillInTemplateBody toolSlug={conceptSlug} intro={body.intro} fields={body.fields} />;
}

const styles = StyleSheet.create({
  chevOpen: { transform: [{ rotate: '180deg' }] },
  kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.6 },
  l3Body: { fontFamily: FONTS.sans, fontSize: 14, lineHeight: 20 },
  l3Inner: { gap: 12, marginTop: 12 },
  l3Kicker: { fontFamily: FONTS.sansBold, fontSize: 10.5, letterSpacing: 1.6 },
  l3Title: { fontFamily: FONTS.sansBold, fontSize: 15, marginTop: 4 },
  l3Toggle: { borderRadius: 14, borderWidth: 1, padding: 14 },
  l3ToggleRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  layer1: { borderRadius: 14, borderWidth: 1, gap: 8, padding: 14 },
  layer1Body: { fontFamily: FONTS.sansMedium, fontSize: 15, lineHeight: 22 },
  layer2Wrap: { gap: 12 },
  modeBtn: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  modeLabel: { fontFamily: FONTS.sansBold, fontSize: 13 },
  modeRow: { flexDirection: 'row', gap: 8 },
  wrap: { gap: 16 },
});
