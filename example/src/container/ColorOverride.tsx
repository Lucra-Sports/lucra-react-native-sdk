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

import {
  BRANDS,
  COLOR_KEYS,
  PALETTE_MODES,
  THEME_MODES,
  type AppPaletteMode,
  type AppThemeMode,
  type ThemeAppearance,
} from '../theme';
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

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row rounded-full bg-indigo-900 p-1">
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          className={`flex-1 items-center rounded-full py-1 ${
            value === option ? 'bg-indigo-600' : ''
          }`}
        >
          <Text className="text-white font-bold capitalize">{option}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const AppearanceToggle: FC<{
  value: ThemeAppearance;
  onChange: (appearance: ThemeAppearance) => void;
}> = ({ value, onChange }) => (
  <Segmented options={APPEARANCES} value={value} onChange={onChange} />
);

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
    state: { theme, themeMode, paletteMode },
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

      <Text className="text-white font-bold pt-4 pb-1">Forced theme mode</Text>
      <Segmented<AppThemeMode>
        options={THEME_MODES}
        value={themeMode ?? 'default'}
        onChange={(mode) =>
          dispatch({ type: 'SET_THEME_MODE', themeMode: mode })
        }
      />
      <Text className="text-neutral-400 py-2">
        What the SDK renders. <Text className="font-bold">default</Text> sends
        no themeMode, so the appearance is derived from which palettes you send
        below. The others pin every Lucra screen, ignoring the palette rule.
      </Text>

      <Text className="text-white font-bold pt-2 pb-1">Palettes sent</Text>
      <Segmented<AppPaletteMode>
        options={PALETTE_MODES}
        value={paletteMode ?? 'both'}
        onChange={(mode) =>
          dispatch({ type: 'SET_PALETTE_MODE', paletteMode: mode })
        }
      />
      <Text className="text-neutral-400 py-2">
        Which palettes reach `LucraSDK.init`. Sending only one makes the SDK
        reuse it for the other appearance — pair that with a forced mode to see
        the cross-fill warning in Metro.
      </Text>

      <Text className="text-white font-bold pt-2 pb-1">Editing palette</Text>
      <AppearanceToggle value={editing} onChange={setEditing} />

      <Text className="text-neutral-400 py-2">
        Which palette the color pickers below edit — the device is currently{' '}
        {deviceScheme ?? 'unknown'}. The SDK reads the theme once at init, so
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
