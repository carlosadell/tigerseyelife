import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Dumbbell, Soup, Sprout, Sun, User } from 'lucide-react-native';
import { ComponentType, useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../hooks/useTheme';
import { COLORS, FONTS } from '../../lib/brand';

type TabIcon = ComponentType<{ color: string; size: number; strokeWidth?: number }>;

const icons: Record<string, TabIcon> = {
  today: Sun,
  train: Dumbbell,
  fuel: Soup,
  grow: Sprout,
  you: User,
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, mode } = useTheme();
  const { width } = useWindowDimensions();
  const useCenteredWebBar = Platform.OS === 'web' && width > 430;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          left: useCenteredWebBar ? '50%' : 0,
          right: useCenteredWebBar ? undefined : 0,
          transform: useCenteredWebBar ? [{ translateX: -215 }] : undefined,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <BlurView
        intensity={mode === 'dark' ? 35 : 55}
        tint={mode === 'dark' ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.bar,
          { backgroundColor: colors.glassPanel, borderTopColor: colors.border },
        ]}
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
              focused={focused}
              icon={Icon}
              label={options?.title ?? route.name}
              key={route.key}
              activeColor={colors.accent}
              inactiveColor={colors.mutedText}
              onPress={onPress}
            />
          );
        })}
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
      duration: 180,
      easing: Easing.out(Easing.cubic),
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  const activeOpacity = progress;
  const inactiveOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const activeScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });
  const inactiveScale = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.92],
  });

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
          <Icon color={activeColor} size={24} strokeWidth={2.1} />
        </Animated.View>
        <Animated.View
          style={[styles.iconLayer, { opacity: inactiveOpacity, transform: [{ scale: inactiveScale }] }]}
        >
          <Icon color={inactiveColor} size={24} strokeWidth={2} />
        </Animated.View>
      </View>
      <Text style={[styles.label, { color: focused ? activeColor : inactiveColor }]}>{label}</Text>
      <View
        style={[
          styles.indicator,
          { backgroundColor: focused ? activeColor : 'transparent' },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingTop: 9,
    width: '100%',
  },
  iconLayer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 2,
  },
  iconWrap: {
    height: 30,
    width: 32,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    justifyContent: 'flex-start',
  },
  indicator: {
    borderRadius: 999,
    height: 2,
    marginTop: 4,
    width: 18,
  },
  label: {
    fontFamily: FONTS.sansMedium,
    fontSize: 11,
  },
  wrap: {
    alignSelf: 'center',
    bottom: 0,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    overflow: 'hidden',
    position: 'absolute',
    shadowColor: COLORS.onyx,
    shadowOffset: { height: -8, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    width: '100%',
  },
});
