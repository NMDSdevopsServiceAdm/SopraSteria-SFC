/* eslint-disable @typescript-eslint/no-empty-function */
import { IConfigCatClient, SettingKeyValue } from 'configcat-common/lib/ConfigCatClient';

export const DefaultFeatureFlagsForLocalTest = {
  homePageNewDesignParent: true,
  newBenchmarksDataArea: true,
};

export const mockConfigCatClient = {
  dispose: () => {},
  getValue: () => {},
  forceRefresh: () => {},
  forceRefreshAsync: () => {
    return new Promise((resolve) => {
      resolve('');
    });
  },
  getAllKeys: () => {},
  getAllKeysAsync: () => {
    return new Promise((resolve) => {
      return [];
    });
  },
  getVariationId: () => {},
  getVariationIdAsync: () => {
    return new Promise((resolve) => {
      return '';
    });
  },
  getAllVariationIds: () => {},
  getAllVariationIdsAsync: () => {
    return new Promise((resolve) => {
      return '';
    });
  },
  getKeyAndValue: () => {},
  getKeyAndValueAsync: () => {
    return new Promise((resolve) => {
      return new SettingKeyValue();
    });
  },
  getAllValues: () => {},
  getAllValuesAsync: async () => {
    const mockConfigCatResponse: SettingKeyValue[] = Object.entries(DefaultFeatureFlagsForLocalTest).map(
      ([key, value]) => {
        return {
          settingKey: key,
          settingValue: value,
        };
      },
    );
    return mockConfigCatResponse;
  },

  getValueAsync: (flagName: string, defaultSetting: boolean) => {
    const flagValue = DefaultFeatureFlagsForLocalTest[flagName] ?? defaultSetting;
    return Promise.resolve(flagValue);
  },
} as IConfigCatClient;
