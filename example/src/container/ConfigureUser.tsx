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
// import DatePicker from 'react-native-date-picker';
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
};

type FormAction =
  | { type: 'SET_FIELD'; field: keyof FormState; value: any }
  | {
      type: 'SET_ADDRESS_FIELD';
      field: keyof FormState['address'];
      value: string;
    }
  | { type: 'SET_INITIAL_DATA'; data: FormState };

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
    default:
      return state;
  }
}

type Props = NativeStackScreenProps<RootStackParamList, 'ConfigureUser'>;

export const ConfigureUser: React.FC<Props> = ({ navigation }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [loggedIn, setLoggedIn] = useState(false);
  // const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await LucraSDK.getUser();
        setLoggedIn(true);
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

  if (!loggedIn) {
    return (
      <View>
        <Text>Not logged in</Text>
      </View>
    );
  }

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
          {/* <TouchableOpacity onPress={() => setOpen(true)}> */}
          <TouchableOpacity>
            <Text className="text-white">
              {state.dateOfBirth
                ? `${state.dateOfBirth.toLocaleDateString()}`
                : 'Set date of birth'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* <DatePicker
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
        /> */}
        <Button title="Submit" onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
};
