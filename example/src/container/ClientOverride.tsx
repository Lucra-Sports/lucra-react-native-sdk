import { type FC } from 'react';
import { Switch, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../AppContext';
import { defaultAppConfig } from '../AppConfig';

type ClientOptionProps = {
  name: string;
  value: string;
  placeholder?: string;
  readonly?: boolean;
  onChange: (value: string) => void;
  style?: any;
  className?: string;
};

const ClientOption: FC<ClientOptionProps> = ({
  name,
  value,
  placeholder,
  readonly,
  onChange,
  style,
  className,
}) => {
  return (
    <View
      className={`flex-row items-center justify-between bg-indigo-700 p-4 ${className}`}
      style={style}
    >
      <Text className="text-white">{name}</Text>
      <TextInput
        readOnly={readonly}
        placeholder={placeholder}
        placeholderTextColor={'#A0AEC0'}
        onChangeText={onChange}
        className="text-white py-0"
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
    <View className="flex-1 mt-4 mb-4 gap-0.5">
      <ClientOption
        name="Environment"
        placeholder={defaultAppConfig.environment}
        value={state.environment}
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'environment', value })
        }
        className="rounded-t-xl"
      />
      <ClientOption
        name="API URL"
        placeholder={defaultAppConfig.apiURL}
        value={state.apiURL}
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'apiURL', value })
        }
      />
      <ClientOption
        name="API Key"
        placeholder={defaultAppConfig.apiKey}
        value={state.apiKey}
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'apiKey', value })
        }
      />
      <ClientOption
        name="URL Schema"
        placeholder={defaultAppConfig.urlScheme}
        value={state.urlScheme}
        readonly
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'urlScheme', value })
        }
      />
      <ClientOption
        name="Merchant ID"
        placeholder={defaultAppConfig.merchantId}
        value={state.merchantId}
        readonly
        onChange={(value: string) =>
          dispatch({ type: 'SET_FIELD', field: 'merchantId', value })
        }
      />
      <View className="flex-row justify-between items-center bg-indigo-700 p-4 rounded-b-xl">
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
