import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { of } from 'rxjs';

import { GetDelegatedHealthcareActivitiesResolver } from './get-delegated-healthcare-activities.resolver';

describe('GetDelegatedHealthcareActivitiesResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GetDelegatedHealthcareActivitiesResolver],
    });

    const resolver = TestBed.inject(GetDelegatedHealthcareActivitiesResolver);

    const delegatedHealthcareActivitiesService = TestBed.inject(DelegatedHealthcareActivitiesService);
    const getDelegatedHealthcareActivitiesSpy = spyOn(
      delegatedHealthcareActivitiesService,
      'getDelegatedHealthcareActivities',
    ).and.returnValue(of(null));

    return {
      resolver,
      getDelegatedHealthcareActivitiesSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getDelegatedHealthcareActivities in service', () => {
    const { resolver, getDelegatedHealthcareActivitiesSpy } = setup();

    resolver.resolve();

    expect(getDelegatedHealthcareActivitiesSpy).toHaveBeenCalled();
  });
});
