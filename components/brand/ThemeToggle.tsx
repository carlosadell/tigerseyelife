import { Pressable, StyleSheet } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';

import { useTheme } from '../../hooks/useTheme';

export function ThemeToggle() {
  const { colors, mode, toggleMode } = useTheme();
  const Icon = mode === 'dark' ? Sun : Moon;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: mode === 'light' }}
      onPress={toggleMode}
      style={[
        styles.toggle,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Icon color={colors.accent} size={16} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
});
