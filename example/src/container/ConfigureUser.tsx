import React, { useReducer, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {
  LucraSDK,
  type LucraUserConfig,
} from '@lucra-sports/lucra-react-native-sdk';
import { Assets } from '../Assets';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../Routes';

type InputProps = {
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
};
const Input = ({ placeholder, value, onChangeText }: InputProps) => {
  return (
    <TextInput
      className="text-white border border-indigo-300 rounded p-4"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
    />
  );
};

type FormState = {
  username?: string | null;
  avatarURL?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  address: {
    address?: string | null;
    addressCont?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
  };
  dateOfBirth?: Date | null;
  metadata: Array<{ key: string; value: string }>;
};

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | {
      type: 'SET_ADDRESS_FIELD';
      field: keyof FormState['address'];
      value: string;
    }
  | { type: 'SET_INITIAL_DATA'; data: FormState }
  | { type: 'ADD_METADATA'; key: string; value: string }
  | { type: 'UPDATE_METADATA'; index: number; key: string; value: string }
  | { type: 'REMOVE_METADATA'; index: number };

const initialState: FormState = {
  username: null,
  avatarURL: null,
  phoneNumber: null,
  email: null,
  firstName: null,
  lastName: null,
  address: {
    address: null,
    addressCont: null,
    city: null,
    state: null,
    zip: null,
  },
  dateOfBirth: new Date(),
  metadata: [],
};

function getLucraUserConfig(state: FormState): LucraUserConfig {
  const lucraUserConfig: LucraUserConfig = {
    username: state.username ?? undefined,
    avatarURL: state.avatarURL ?? undefined,
    phoneNumber: state.phoneNumber ?? undefined,
    email: state.email ?? undefined,
    firstName: state.firstName ?? undefined,
    lastName: state.lastName ?? undefined,
    dateOfBirth: state.dateOfBirth ?? undefined,
  };
  if (Object.values(state.address).some(Boolean)) {
    lucraUserConfig.address = {
      address: state.address.address ?? undefined,
      addressCont: state.address.addressCont ?? undefined,
      city: state.address.city ?? undefined,
      state: state.address.state ?? undefined,
      zip: state.address.zip ?? undefined,
    };
  }
  if (state.metadata.length > 0) {
    lucraUserConfig.metadata = state.metadata.reduce(
      (acc, item) => {
        if (item.key && item.value) {
          acc[item.key] = item.value;
        }
        return acc;
      },
      {} as Record<string, string>
    );
  }
  return lucraUserConfig;
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ADDRESS_FIELD':
      return {
        ...state,
        ['address']: {
          ...state.address,
          [action.field]: action.value,
        },
      };
    case 'SET_INITIAL_DATA':
      return { ...state, ...action.data };
    case 'ADD_METADATA':
      return {
        ...state,
        metadata: [...state.metadata, { key: action.key, value: action.value }],
      };
    case 'UPDATE_METADATA':
      return {
        ...state,
        metadata: state.metadata.map((item, idx) =>
          idx === action.index ? { key: action.key, value: action.value } : item
        ),
      };
    case 'REMOVE_METADATA':
      return {
        ...state,
        metadata: state.metadata.filter((_, idx) => idx !== action.index),
      };
    default:
      return state;
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'ConfigureUser'>;

export const ConfigureUser: React.FC<Props> = ({ navigation }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [loggedIn, setLoggedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await LucraSDK.getUser();
        setLoggedIn(true);
        const metadataArray = user.metadata
          ? Object.entries(user.metadata).map(([key, value]) => ({
              key,
              value,
            }))
          : [];
        dispatch({
          type: 'SET_INITIAL_DATA',
          data: {
            ...user,
            address: {
              ...(user?.address ?? {
                address: null,
                addressCont: null,
                city: null,
                state: null,
                zip: null,
              }),
            },
            dateOfBirth: user.dateOfBirth
              ? new Date(user.dateOfBirth)
              : new Date(),
            metadata: metadataArray,
          },
        });
      } catch (error) {
        setLoggedIn(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (field: keyof FormState, value: string | Date) => {
    dispatch({ type: 'SET_FIELD', field, value });
  };

  const handleAddressChange = (
    field: keyof FormState['address'],
    value: string
  ) => {
    dispatch({ type: 'SET_ADDRESS_FIELD', field, value });
  };

  const handleSubmit = async () => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      setMessage('Saving user config');
      await LucraSDK.configureUser(getLucraUserConfig(state));
      setMessage('User Updated Successfully!');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-indigo-900">
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
        <Text className="text-white">Configure User</Text>
      </View>
      <ScrollView contentContainerClassName="p-4 gap-3">
        {!loggedIn ? (
          <View className="bg-yellow-600 p-2 items-center rounded">
            <Text className="text-white">
              Not logged in. The user info below will submit after user logs in.
              Submitting phone number prior to login will lock the phone number
              entry.
            </Text>
          </View>
        ) : null}
        {message ? (
          <View className="bg-sky-700 p-2 items-center">
            <Text className="text-white">{message}</Text>
          </View>
        ) : null}
        <View className="">
          <Text className="text-white">
            Values will be saved to the user object in the SDK
          </Text>
        </View>
        <Input
          placeholder="Username"
          value={state.username ?? ''}
          onChangeText={(value) => handleChange('username', value)}
        />
        <Input
          placeholder="Avatar URL"
          value={state.avatarURL ?? ''}
          onChangeText={(value) => handleChange('avatarURL', value)}
        />
        <Input
          placeholder="Phone"
          value={state.phoneNumber ?? ''}
          onChangeText={(value) => handleChange('phoneNumber', value)}
        />
        <Input
          placeholder="Email"
          value={state.email ?? ''}
          onChangeText={(value) => handleChange('email', value)}
        />
        <Input
          placeholder="First Name"
          value={state.firstName ?? ''}
          onChangeText={(value) => handleChange('firstName', value)}
        />
        <Input
          placeholder="Last Name"
          value={state.lastName ?? ''}
          onChangeText={(value) => handleChange('lastName', value)}
        />
        <Input
          placeholder="Address"
          value={state.address?.address ?? ''}
          onChangeText={(value) => handleAddressChange('address', value)}
        />
        <Input
          placeholder="Address Continued"
          value={state.address?.addressCont ?? ''}
          onChangeText={(value) => handleAddressChange('addressCont', value)}
        />
        <Input
          placeholder="City"
          value={state.address?.city ?? ''}
          onChangeText={(value) => handleAddressChange('city', value)}
        />
        <Input
          placeholder="State"
          value={state.address?.state ?? ''}
          onChangeText={(value) => handleAddressChange('state', value)}
        />
        <Input
          placeholder="Zip"
          value={state.address?.zip ?? ''}
          onChangeText={(value) => handleAddressChange('zip', value)}
        />
        <View className="flex-row">
          <Text className="text-white">Date of birth:</Text>
          <TouchableOpacity onPress={() => setOpen(true)}>
            <Text className="text-white">
              {state.dateOfBirth
                ? `${state.dateOfBirth.toLocaleDateString()}`
                : 'Set date of birth'}
            </Text>
          </TouchableOpacity>
        </View>
        <DatePicker
          modal
          date={state.dateOfBirth ?? new Date()}
          open={open}
          mode="date"
          onCancel={() => {
            setOpen(false);
          }}
          onConfirm={(date) => {
            setOpen(false);
            handleChange('dateOfBirth', date);
          }}
        />
        <View className="mt-4">
          <Text className="text-white text-lg font-semibold mb-2">
            Metadata
          </Text>
          <Text className="text-white text-sm mb-3">
            Link your user with Lucra user using custom metadata
          </Text>
          {state.metadata.map((item, index) => (
            <View key={index} className="flex-row gap-2 mb-2">
              <TextInput
                className="flex-1 text-white border border-indigo-300 rounded p-2"
                placeholder="Key"
                placeholderTextColor="#a5b4fc"
                value={item.key}
                onChangeText={(value) =>
                  dispatch({
                    type: 'UPDATE_METADATA',
                    index,
                    key: value,
                    value: item.value,
                  })
                }
              />
              <TextInput
                className="flex-1 text-white border border-indigo-300 rounded p-2"
                placeholder="Value"
                placeholderTextColor="#a5b4fc"
                value={item.value}
                onChangeText={(value) =>
                  dispatch({
                    type: 'UPDATE_METADATA',
                    index,
                    key: item.key,
                    value: value,
                  })
                }
              />
              <TouchableOpacity
                onPress={() => dispatch({ type: 'REMOVE_METADATA', index })}
                className="justify-center px-3 bg-red-600 rounded"
              >
                <Text className="text-white">✕</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() =>
              dispatch({ type: 'ADD_METADATA', key: '', value: '' })
            }
            className="bg-indigo-600 p-3 rounded items-center mt-2"
          >
            <Text className="text-white">+ Add Metadata</Text>
          </TouchableOpacity>
        </View>
        <Button title="Submit" onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
};
