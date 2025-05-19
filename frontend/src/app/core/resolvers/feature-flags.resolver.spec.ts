import { SettingKeyValue } from 'configcat-common/lib/ConfigCatClient';

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';

import { FeatureFlagsResolver } from './feature-flags.resolver';

describe('FeatureFlagsResolver', () => {
  async function setup(overrides: any = {}) {
    const cwpQuestionsFlag: boolean = overrides.cwpQuestionsFlag ?? false;
    const mockFeatureFlag: boolean = overrides.mockFeatureFlag ?? false;
    const mockResponseFromConfigCat: SettingKeyValue[] = [
      {
        settingKey: 'mockFeatureFlag',
        settingValue: mockFeatureFlag,
      },
      {
        settingKey: 'cwpQuestions',
        settingValue: cwpQuestionsFlag,
      },
    ];

    TestBed.configureTestingModule({
      providers: [
        FeatureFlagsResolver,
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
      ],
    });

    const resolver = TestBed.inject(FeatureFlagsResolver);
    const route = TestBed.inject(ActivatedRoute);

    const featureFlagsService = TestBed.inject(FeatureFlagsService);
    const featureFlagsSpy = spyOn(featureFlagsService.configCatClient, 'getAllValuesAsync').and.resolveTo(
      mockResponseFromConfigCat,
    );

    return {
      resolver,
      route,
      featureFlagsService,
      featureFlagsSpy,
    };
  }

  it('should create', async () => {
    const { resolver } = await setup();

    expect(resolver).toBeTruthy();
  });

  it('should retrieve the feature flags by FeatureFlagsService', async () => {
    const { resolver, route, featureFlagsSpy } = await setup({ cwpQuestionsFlag: true, mockFeatureFlag: false });

    const featureFlags = await resolver.resolve(route.snapshot).toPromise();

    expect(featureFlagsSpy).toHaveBeenCalledTimes(1);
    expect(featureFlags).toEqual({
      cwpQuestions: true,
      mockFeatureFlag: false,
    });
  });
});
