import { Injectable } from '@angular/core';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { IConfigCatClient, SettingKeyValue } from 'configcat-common/lib/ConfigCatClient';

@Injectable()
export class MockFeatureFlagsService extends FeatureFlagsService {
  public configCatClient = {
    dispose: () => {},
    getValue: () => {},
    forceRefresh: () => {},
    forceRefreshAsync: () => {
      return new Promise((resolve) => {
        return '';
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
    getValueAsync: () => {
      return new Promise((resolve) => {
        return false;
      });
    },
  } as IConfigCatClient;
}
