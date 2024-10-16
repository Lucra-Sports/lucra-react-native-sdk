import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import { useEventsContext, type LucraEvent } from '../EventsContext';
import { useCallback } from 'react';

export const EventViewer: React.FC = () => {
  const [events] = useEventsContext();
  const renderItem = useCallback(({ item }: { item: LucraEvent }) => {
    return (
      <TouchableOpacity onPress={() => Clipboard.setString(item.id)}>
        <Text>Event: {item.type}</Text>
        <Text>{item.id}</Text>
      </TouchableOpacity>
    );
  }, []);

  if (!events.length) {
    return (
      <View className="flex-1">
        <Text>No events registered</Text>
      </View>
    );
  }
  return (
    <View className="flex-1">
      <FlatList<LucraEvent>
        data={events}
        renderItem={renderItem}
        keyExtractor={(event) => event.id}
      />
    </View>
  );
};
