import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Dumbbell, Soup, Sprout, Sun, User } from 'lucide-react-native';
import { ComponentType, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoachFloatingButton } from './CoachFloatingButton';
import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type TabIcon = ComponentType<{ color: string; size: number; strokeWidth?: number }>;

type FloatingTabBarProps = BottomTabBarProps & {
  onCoachPress?: () => void;
};

const icons: Record<string, TabIcon> = {
  today: Sun,
  train: Dumbbell,
  fuel: Soup,
  grow: Sprout,
  you: User,
};

export function FloatingTabBar({ state, descriptors, navigation, onCoachPress }: FloatingTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, mode } = useTheme();

  const scrimHeight = insets.bottom + 76;
  const fadeColor = colors.background;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <LinearGradient
        pointerEvents="none"
        colors={[`${fadeColor}00`, fadeColor]}
        locations={[0, 0.65]}
        style={[styles.scrim, { height: scrimHeight }]}
      />
      <View pointerEvents="box-none" style={{ paddingBottom: insets.bottom + 6 }}>
        <View style={styles.row}>
          <View style={[styles.barShadow, { shadowColor: COLORS.onyx }]}>
            <BlurView
              intensity={mode === 'dark' ? 38 : 60}
              tint={mode === 'dark' ? 'dark' : 'light'}
              style={[styles.bar, { backgroundColor: colors.glassPanel, borderColor: colors.glassBorder }]}
            >
            {state.routes.map((route, index) => {
              const focused = state.index === index;
              const Icon = icons[route.name];
              const options = descriptors[route.key]?.options;
              if (!Icon) return null;

              const onPress = () => {
                const event = navigation.emit({
                  canPreventDefault: true,
                  target: route.key,
                  type: 'tabPress',
                });
                if (!focused && !event.defaultPrevented) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate(route.name, route.params);
                }
              };

              return (
                <TabBarItem
                  accessibilityLabel={options?.tabBarAccessibilityLabel}
                  activeColor={colors.accent}
                  focused={focused}
                  icon={Icon}
                  inactiveColor={colors.mutedText}
                  key={route.key}
                  label={options?.title ?? route.name}
                  onPress={onPress}
                />
              );
            })}
            </BlurView>
          </View>
          {onCoachPress ? (
            <View style={styles.coachSlot}>
              <CoachFloatingButton onPress={onCoachPress} />
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

type TabBarItemProps = {
  accessibilityLabel?: string;
  focused: boolean;
  icon: TabIcon;
  label: string;
  activeColor: string;
  inactiveColor: string;
  onPress: () => void;
};

function TabBarItem({
  accessibilityLabel,
  activeColor,
  focused,
  icon: Icon,
  label,
  inactiveColor,
  onPress,
}: TabBarItemProps) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  const activeOpacity = progress;
  const inactiveOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const activeScale = progress.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] });
  const inactiveScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.92] });

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
      style={styles.item}
    >
      <View style={styles.iconWrap}>
        <Animated.View
          style={[styles.iconLayer, { opacity: activeOpacity, transform: [{ scale: activeScale }] }]}
        >
          <Icon color={activeColor} size={22} strokeWidth={2.2} />
        </Animated.View>
        <Animated.View
          style={[styles.iconLayer, { opacity: inactiveOpacity, transform: [{ scale: inactiveScale }] }]}
        >
          <Icon color={inactiveColor} size={22} strokeWidth={2} />
        </Animated.View>
      </View>
      <Text style={[styles.label, { color: focused ? activeColor : inactiveColor }]}>{label}</Text>
      <View style={[styles.indicator, { backgroundColor: focused ? activeColor : 'transparent' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 2,
    minHeight: 62,
    overflow: 'hidden',
    paddingHorizontal: 6,
  },
  barShadow: {
    borderRadius: 30,
    elevation: 10,
    flex: 1,
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
  },
  coachSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  iconWrap: {
    height: 28,
    width: 28,
  },
  indicator: {
    borderRadius: 999,
    height: 2,
    marginTop: 3,
    width: 14,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    paddingHorizontal: 2,
    paddingVertical: 6,
  },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  row: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 10,
    maxWidth: 380,
    paddingHorizontal: 14,
    width: '100%',
  },
  scrim: {
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
  },
  wrap: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
