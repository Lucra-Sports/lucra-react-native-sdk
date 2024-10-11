import React, { useState, type FC } from 'react';
import ColorPicker, {
  Panel5,
  Swatches,
  Preview,
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
import { NavigationContainer } from '@react-navigation/native';

type ColorOptionProps = {
  name: string;
  value: string;
  onUpdate: (value: string) => void;
};

type ThemePillProps = {
  title: string;
  onPress: () => void;
};

const ThemePill: FC<ThemePillProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      className="bg-slate-400 rounded-full px-4 py-1"
      onPress={onPress}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};

const ColorOption: FC<ColorOptionProps> = ({ name, value, onUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <SafeAreaView className="flex-1">
      <View className="flex-row justify-between bg-darkPurple p-4 border-t border-lightPurple">
        <View>
          <Text className="text-white">{name}</Text>
          <Text className="text-white">{value}</Text>
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
    </SafeAreaView>
  );
};

export function ColorOverride() {
  const { theme, setThemeValue, setTheme } = useAppContext();
  return (
    <View>
      <View className="flex-row justify-between mt-4 mb-4">
        <ThemePill
          title="DEFAULT"
          onPress={() => {
            setTheme(DEFAULT);
          }}
        />
        <ThemePill
          title="CHAOS"
          onPress={() => {
            setTheme(CHAOS);
          }}
        />
        <ThemePill
          title="T1"
          onPress={() => {
            setTheme(T1);
          }}
        />
        <ThemePill
          title="DUPR"
          onPress={() => {
            setTheme(DUPR);
          }}
        />
        <ThemePill
          title="PSF"
          onPress={() => {
            setTheme(PSF);
          }}
        />
      </View>
      <View>
        <ColorOption
          name="Background"
          value={theme.background}
          onUpdate={(value: string) => {
            setThemeValue('background', value);
          }}
        />
        <ColorOption
          name="Surface"
          value={theme.background}
          onUpdate={(value: string) => {
            setThemeValue('surface', value);
          }}
        />
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
          name="On Background"
          value={theme.onBackground}
          onUpdate={(value: string) => {
            setThemeValue('onBackground', value);
          }}
        />
        <ColorOption
          name="On Surface"
          value={theme.onSurface}
          onUpdate={(value: string) => {
            setThemeValue('onSurface', value);
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
        />
      </View>
    </View>
  );
}
