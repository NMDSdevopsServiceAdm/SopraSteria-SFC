/* eslint-disable @typescript-eslint/no-empty-function */
import { IConfigCatClient, SettingKeyValue } from 'configcat-common/lib/ConfigCatClient';

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
  getAllValuesAsync: () => {
    return new Promise((resolve) => {
      return new SettingKeyValue();
    });
  },

  getValueAsync: (flagName, defaultSetting) => {
    if (flagName === 'wdfUser') {
      return new Promise((resolve) => {
        return resolve(false);
      });
    }
    if (flagName === 'wdfNewDesign') {
      return new Promise((resolve) => {
        return resolve(false);
      });
    }
    if (flagName === 'homePageNewDesign') {
      return new Promise((resolve) => {
        return resolve(true);
      });
    }

    return new Promise((resolve) => {
      return resolve(defaultSetting);
    });
  },
} as IConfigCatClient;
