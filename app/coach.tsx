import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CoachAvatar } from '../components/brand/CoachAvatar';
import { HairlineDivider } from '../components/brand/HairlineDivider';
import { COLORS, FONTS } from '../lib/brand';

export default function CoachScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={styles.header}>
        <CoachAvatar size={56} />
        <View>
          <Text style={styles.label}>COACH</Text>
          <Text style={styles.title}>Tigers Eye</Text>
        </View>
      </View>
      <HairlineDivider />
      <View style={styles.bubble}>
        <Text style={styles.bubbleText}>
          I'm here when you need me. What's on your mind today?
        </Text>
      </View>
      <Text style={styles.deferred}>[ ROUND 5 ] AI coach wiring lands later.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.bone,
    borderRadius: 20,
    margin: 20,
    maxWidth: '80%',
    padding: 12,
  },
  bubbleText: {
    color: COLORS.onyx,
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  deferred: {
    color: COLORS.steel,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.3,
    marginHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 20,
  },
  label: {
    color: COLORS.steel,
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
    letterSpacing: 1.65,
  },
  screen: {
    backgroundColor: COLORS.charcoal,
    flex: 1,
  },
  title: {
    color: COLORS.bone,
    fontFamily: FONTS.sansMedium,
    fontSize: 16,
  },
});
