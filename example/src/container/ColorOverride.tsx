import { useState, type FC } from 'react';
import ColorPicker, { Panel5, HueSlider } from 'reanimated-color-picker';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Button,
  SafeAreaView,
  useColorScheme,
} from 'react-native';

import { BRANDS, COLOR_KEYS, type ThemeAppearance } from '../theme';
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

const APPEARANCES: ThemeAppearance[] = ['light', 'dark'];

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

const AppearanceToggle: FC<{
  value: ThemeAppearance;
  onChange: (appearance: ThemeAppearance) => void;
}> = ({ value, onChange }) => {
  return (
    <View className="flex-row rounded-full bg-indigo-900 p-1">
      {APPEARANCES.map((appearance) => (
        <TouchableOpacity
          key={appearance}
          onPress={() => onChange(appearance)}
          className={`flex-1 items-center rounded-full py-1 ${
            value === appearance ? 'bg-indigo-600' : ''
          }`}
        >
          <Text className="text-white font-bold capitalize">{appearance}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
              // Lucra's theme tokens are opaque, and both native SDKs read
              // 8-digit hex as #AARRGGBB rather than CSS's #RRGGBBAA, so keep
              // this to six digits instead of forwarding an alpha channel.
              onUpdate(v.hex.slice(0, 7));
            }}
          >
            <Panel5 />
            <HueSlider />
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
  const deviceScheme = useColorScheme();
  const [editing, setEditing] = useState<ThemeAppearance>(
    deviceScheme === 'light' ? 'light' : 'dark'
  );

  if (!ready) {
    return null;
  }

  const palette = theme[editing];

  return (
    <>
      <View className="flex-row justify-between py-4 gap-2">
        {BRANDS.map(({ name, theme: brandTheme }) => (
          <ThemePill
            key={name}
            title={name}
            onPress={() => {
              dispatch({ type: 'SET_THEME', theme: brandTheme });
            }}
          />
        ))}
      </View>

      <AppearanceToggle value={editing} onChange={setEditing} />

      <Text className="text-neutral-400 py-2">
        Editing the {editing} palette — the device is currently{' '}
        {deviceScheme ?? 'unknown'}. Both palettes are sent, so Lucra screens
        follow the device appearance. The SDK reads the theme once at init, so
        restart the app to pick up edits.
      </Text>

      <View className="gap-0.5">
        {COLOR_KEYS.map(({ key, label }, index) => (
          <ColorOption
            key={key}
            name={label}
            value={palette[key]}
            onUpdate={(value: string) => {
              setThemeValue(editing, key, value);
            }}
            className={index === COLOR_KEYS.length - 1 ? 'rounded-b-xl' : ''}
          />
        ))}
      </View>
    </>
  );
}
