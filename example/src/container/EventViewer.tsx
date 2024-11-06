import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useEventsContext, type LucraEvent } from '../EventsContext';
import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Routes';
import { Assets } from '../Assets';

type Props = NativeStackScreenProps<RootStackParamList, 'EventViewer'>;

export const EventViewer: React.FC<Props> = ({ navigation }) => {
  const [events] = useEventsContext();
  const renderItem = useCallback(({ item }: { item: LucraEvent }) => {
    return (
      <TouchableOpacity onPress={() => Clipboard.setString(item.id)}>
        <Text>Event: {item.type}</Text>
        <Text>{item.id}</Text>
      </TouchableOpacity>
    );
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <FlatList<LucraEvent>
        data={events}
        className="flex-1"
        contentContainerClassName="p-4"
        ListHeaderComponent={
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Image
                source={Assets.ChevronLeft}
                className="h-8 w-8"
                tintColor={'white'}
              />
            </TouchableOpacity>
            <Text className="text-white">Event Viewer</Text>
          </View>
        }
        renderItem={renderItem}
        keyExtractor={(event) => event.id}
        ListEmptyComponent={
          <View className="flex-1 p-4">
            <Text className="text-neutral-400">No events registered</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
