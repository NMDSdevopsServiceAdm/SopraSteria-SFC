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
    if (flagName === 'newTrainingAndQualificationsReport') {
      return new Promise((resolve) => {
        return resolve(true);
      });
    }
    if (flagName === 'parentTrainingAndQualificationsReport') {
      return new Promise((resolve) => {
        return resolve(false);
      });
    }
    if (flagName === 'newTrainingAndQualificationsRecords') {
      return new Promise((resolve) => {
        return resolve(false);
      });
    }
    if (flagName === 'benefitsBundle') {
      return new Promise((resolve) => {
        return resolve(false);
      });
    }

    if (flagName === 'changingExpiryDateLink') {
      return new Promise((resolve) => {
        return resolve(false);
      });
    }

    return new Promise((resolve) => {
      return resolve(defaultSetting);
    });
  },
} as IConfigCatClient;
