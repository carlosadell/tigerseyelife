import { Text, View } from 'react-native';

import { COLORS, FONTS } from '../../lib/brand';

type CoachSpeechCardProps = {
  message: string;
};

export function CoachSpeechCard({ message }: CoachSpeechCardProps) {
  return (
    <View
      style={{
        backgroundColor: COLORS.bone,
        borderRadius: 20,
        flex: 1,
        padding: 16,
      }}
    >
      <Text
        style={{
          color: COLORS.onyx,
          fontFamily: FONTS.sansBold,
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        Coach
      </Text>
      <Text
        style={{
          color: COLORS.onyx,
          fontFamily: FONTS.sans,
          fontSize: 14,
          lineHeight: 20,
        }}
      >
        {message}
      </Text>
    </View>
  );
}
