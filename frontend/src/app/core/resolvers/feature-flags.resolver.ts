import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { FeatureFlags } from '@core/model/feature-flag.model';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { IConfigCatClient } from 'configcat-common/lib/ConfigCatClient';
import { from, Observable } from 'rxjs';

@Injectable()
export class FeatureFlagsResolver {
  private client: IConfigCatClient;

  constructor(private featureFlagService: FeatureFlagsService) {
    this.client = this.featureFlagService.configCatClient;
  }

  resolve(_route: ActivatedRouteSnapshot): Observable<FeatureFlags> {
    const promise = this.client.getAllValuesAsync().then((allFeatureFlagsAndValues) => {
      const featureFlags = {};

      allFeatureFlagsAndValues.forEach((keyValuePair) => {
        const flagName = keyValuePair.settingKey;
        const value = keyValuePair.settingValue;
        featureFlags[flagName] = value;
      });

      return featureFlags;
    });

    return from(promise);
  }
}
