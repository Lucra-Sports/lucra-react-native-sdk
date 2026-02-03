import { useState, type FC } from 'react';
import ColorPicker, {
  Panel5,
  OpacitySlider,
  HueSlider,
} from 'reanimated-color-picker';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Button,
  SafeAreaView,
} from 'react-native';

import { DEFAULT, CHAOS, T1, DUPR, PSF } from '../theme';
import { useAppContext } from '../AppContext';

type ColorOptionProps = {
  name: string;
  value: string;
  onUpdate: (value: string) => void;
  className?: string;
};

type ThemePillProps = {
  title: string;
  onPress: () => void;
};

const ThemePill: FC<ThemePillProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      className="bg-indigo-700 rounded-full px-4 py-1"
      onPress={onPress}
    >
      <Text className="text-white font-bold">{title}</Text>
    </TouchableOpacity>
  );
};

const ColorOption: FC<ColorOptionProps> = ({
  name,
  value,
  onUpdate,
  className,
}) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <View className={`flex-row justify-between p-4 bg-indigo-700 ${className}`}>
      <View>
        <Text className="text-white">{name}</Text>
        <Text className="text-neutral-400">{value}</Text>
      </View>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="w-8 h-8 rounded-md"
        style={{
          backgroundColor: value,
        }}
      />
      <Modal visible={showModal} animationType="slide">
        <SafeAreaView>
          <ColorPicker
            value={value}
            onComplete={(v) => {
              onUpdate(v.hex);
            }}
          >
            <Panel5 />
            <HueSlider />
            <OpacitySlider />
          </ColorPicker>
        </SafeAreaView>

        <Button title="Ok" onPress={() => setShowModal(false)} />
      </Modal>
    </View>
  );
};

export function ColorOverride() {
  const {
    state: { theme },
    ready,
    setThemeValue,
    dispatch,
  } = useAppContext();
  if (!ready) {
    return null;
  }
  return (
    <>
      <View className="flex-row justify-between py-4 gap-2">
        <ThemePill
          title="DEFAULT"
          onPress={() => {
            dispatch({ type: 'SET_THEME', theme: DEFAULT });
          }}
        />
        <ThemePill
          title="CHAOS"
          onPress={() => {
            dispatch({ type: 'SET_THEME', theme: CHAOS });
          }}
        />
        <ThemePill
          title="T1"
          onPress={() => {
            dispatch({ type: 'SET_THEME', theme: T1 });
          }}
        />
        <ThemePill
          title="DUPR"
          onPress={() => {
            dispatch({ type: 'SET_THEME', theme: DUPR });
          }}
        />
        <ThemePill
          title="PSF"
          onPress={() => {
            dispatch({ type: 'SET_THEME', theme: PSF });
          }}
        />
      </View>
      <View className="gap-0.5">
        <ColorOption
          name="Primary"
          value={theme.primary}
          onUpdate={(value: string) => {
            setThemeValue('primary', value);
          }}
        />
        <ColorOption
          name="Secondary"
          value={theme.secondary}
          onUpdate={(value: string) => {
            setThemeValue('secondary', value);
          }}
        />
        <ColorOption
          name="Tertiary"
          value={theme.tertiary}
          onUpdate={(value: string) => {
            setThemeValue('tertiary', value);
          }}
        />
        <ColorOption
          name="On Primary"
          value={theme.onPrimary}
          onUpdate={(value: string) => {
            setThemeValue('onPrimary', value);
          }}
        />
        <ColorOption
          name="On Secondary"
          value={theme.onSecondary}
          onUpdate={(value: string) => {
            setThemeValue('onSecondary', value);
          }}
        />
        <ColorOption
          name="On Tertiary"
          value={theme.onTertiary}
          onUpdate={(value: string) => {
            setThemeValue('onTertiary', value);
          }}
          className="rounded-b-xl"
        />
      </View>
    </>
  );
}
