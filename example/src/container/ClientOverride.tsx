import React, { type FC } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';

import { useAppContext } from '../AppContext';

type ClientOptionProps = {
  name: string;
  value: string;
  readonly?: boolean;
  onChange: (value: string) => void;
};

const ClientOption: FC<ClientOptionProps> = ({
  name,
  value,
  readonly,
  onChange,
}) => {
  return (
    <View className="flex-row justify-between bg-darkPurple p-4 border-t border-lightPurple">
      <Text className="text-white">{name}</Text>
      <TextInput
        readOnly={readonly}
        onChangeText={onChange}
        className="text-white"
      >
        {value}
      </TextInput>
    </View>
  );
};

export function ClientOverride() {
  const { state, ready, dispatch } = useAppContext();
  if (!ready) {
    return null;
  }
  return (
    <View className="flex-1 mt-4 mb-4">
      <ClientOption
        name="Environment"
        value={state.environment}
        readonly
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'environment', value })
        }
      />
      <ClientOption
        name="API URL"
        value={state.apiURL}
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'apiURL', value })
        }
      />
      <ClientOption
        name="API Key"
        value={state.apiKey}
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'apiKey', value })
        }
      />
      <ClientOption
        name="URL Schema"
        value={state.urlScheme}
        readonly
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'urlScheme', value })
        }
      />
      <ClientOption
        name="Merchan ID"
        value={state.merchantId}
        readonly
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'merchantId', value })
        }
      />
      <View className="flex-row justify-between bg-darkPurple p-4 border-t border-lightPurple">
        <Text className="text-white">Deep links enabled</Text>
        <Switch
          disabled
          value={state.deeplinksEnabled}
          onValueChange={(value) =>
            dispatch({ type: 'SET_TOGGLE', field: 'deeplinksEnabled', value })
          }
        />
      </View>
    </View>
  );
}
