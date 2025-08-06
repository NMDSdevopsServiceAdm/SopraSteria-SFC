import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DelegatedHealthcareActivitiesResolver } from './delegated-healthcare-activities.resolver';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';

describe('getCareWorkforcePathwayWorkplaceAwarenessAnswersResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DelegatedHealthcareActivitiesResolver, DelegatedHealthcareActivitiesService],
    });

    const resolver = TestBed.inject(DelegatedHealthcareActivitiesResolver);
    const delegatedHealthcareActivitiesService = TestBed.inject(DelegatedHealthcareActivitiesService);

    const getAllDelegatedHealthcareActivitiesSpy = spyOn(
      delegatedHealthcareActivitiesService,
      'getAllDelegatedHealthcareActivities',
    ).and.returnValue(of(null));

    return {
      resolver,
      delegatedHealthcareActivitiesService,
      getAllDelegatedHealthcareActivitiesSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();
    expect(resolver).toBeTruthy();
  });

  it('should call getAllDelegatedHealthcareActivities', () => {
    const { resolver, getAllDelegatedHealthcareActivitiesSpy } = setup();

    resolver.resolve();

    expect(getAllDelegatedHealthcareActivitiesSpy).toHaveBeenCalled();
  });
});
