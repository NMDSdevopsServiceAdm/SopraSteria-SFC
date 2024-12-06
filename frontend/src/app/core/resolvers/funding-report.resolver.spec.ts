import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { ReportService } from '@core/services/report.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { of } from 'rxjs';

import { FundingReportResolver } from './funding-report.resolver';

describe('FundingReportResolver', () => {
  function setup(overrides: any = {}) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        FundingReportResolver,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
            paramMap: convertToParamMap({ establishmentuid: overrides.idInParams ?? null }),
          },
        },
      ],
    });

    const resolver = TestBed.inject(FundingReportResolver);
    const route = TestBed.inject(ActivatedRouteSnapshot);

    const reportService = TestBed.inject(ReportService);
    const getWDFReportSpy = spyOn(reportService, 'getWDFReport').and.returnValue(of(null));

    return {
      resolver,
      route,
      getWDFReportSpy,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getWDFReport with id from establishmentService when no uid in params', () => {
    const { resolver, route, getWDFReportSpy } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';

    resolver.resolve(route);

    expect(getWDFReportSpy).toHaveBeenCalledWith(idFromEstablishmentService);
  });

  it('should call getWDFReport with uid in params when there', () => {
    const idInParams = '12321nuihniuh4324';

    const { resolver, route, getWDFReportSpy } = setup({ idInParams });

    resolver.resolve(route);

    expect(getWDFReportSpy).toHaveBeenCalledWith(idInParams);
  });
});
