import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

import './global.css';

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Text className="text-xl font-bold text-white">
        Tigers Eye Life
      </Text>
      <StatusBar style="light" />
    </View>
  );
}
