import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DelegatedHealthcareActivitiesResolver } from './delegated-healthcare-activities.resolver';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { provideHttpClient } from '@angular/common/http';

describe('getCareWorkforcePathwayWorkplaceAwarenessAnswersResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        DelegatedHealthcareActivitiesResolver,
        DelegatedHealthcareActivitiesService,

        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const resolver = TestBed.inject(DelegatedHealthcareActivitiesResolver);
    const delegatedHealthcareActivitiesService = TestBed.inject(DelegatedHealthcareActivitiesService);

    const getDelegatedHealthcareActivitiesSpy = spyOn(
      delegatedHealthcareActivitiesService,
      'getDelegatedHealthcareActivities',
    ).and.returnValue(of(null));

    return {
      resolver,
      delegatedHealthcareActivitiesService,
      getDelegatedHealthcareActivitiesSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getDelegatedHealthcareActivities', () => {
    const { resolver, getDelegatedHealthcareActivitiesSpy } = setup();

    resolver.resolve();

    expect(getDelegatedHealthcareActivitiesSpy).toHaveBeenCalled();
  });
});
