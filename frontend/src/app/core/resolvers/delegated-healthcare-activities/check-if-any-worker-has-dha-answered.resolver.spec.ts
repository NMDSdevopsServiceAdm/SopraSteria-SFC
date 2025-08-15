import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ResolveFn } from '@angular/router';

import { CheckIfAnyWorkerHasDHAAnsweredResolver } from './check-if-any-worker-has-dha-answered.resolver';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DelegatedHealthcareActivitiesService } from '@core/services/delegated-healthcare-activities.service';
import { of } from 'rxjs';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';

describe('checkIfAnyWorkerHasDHAAnsweredResolver', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CheckIfAnyWorkerHasDHAAnsweredResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ establishmentuid: 'mock-uid' }) } },
        },
      ],
    });

    const resolver = TestBed.inject(CheckIfAnyWorkerHasDHAAnsweredResolver);
    const route = TestBed.inject(ActivatedRoute);

    const delegatedHealthcareActivitiesService = TestBed.inject(DelegatedHealthcareActivitiesService);
    const checkIfAnyWorkerHasDHAAnsweredSpy = spyOn(
      delegatedHealthcareActivitiesService,
      'checkIfAnyWorkerHasDHAAnswered',
    ).and.returnValue(of(true));

    return {
      resolver,
      route,
      checkIfAnyWorkerHasDHAAnsweredSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getDelegatedHealthcareActivities in service', () => {
    const { resolver, route, checkIfAnyWorkerHasDHAAnsweredSpy } = setup();

    resolver.resolve(route.snapshot);

    expect(checkIfAnyWorkerHasDHAAnsweredSpy).toHaveBeenCalledWith('mock-uid');
  });
});
