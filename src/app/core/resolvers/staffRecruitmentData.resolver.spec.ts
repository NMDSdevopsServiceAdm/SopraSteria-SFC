import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';

import { StaffRecruitmentDataResolver } from './staffRecruitmentData.resolver';

describe('StaffRecruitmentDataResolver', () => {
  let resolver: StaffRecruitmentDataResolver;
  let route: ActivatedRoute;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        StaffRecruitmentDataResolver,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ establishmentuid: 'establishmentId' }) },
          },
        },
      ],
    });
    resolver = TestBed.inject(StaffRecruitmentDataResolver);
    route = TestBed.inject(ActivatedRoute);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const esablishmentService = TestBed.inject(EstablishmentService);
    spyOn(esablishmentService, 'getStaffRecruitmentData').and.callThrough();

    resolver.resolve(route.snapshot);

    expect(esablishmentService.getStaffRecruitmentData).toHaveBeenCalled();
  });
});
