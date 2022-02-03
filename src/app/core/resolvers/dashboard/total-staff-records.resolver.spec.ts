import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

import { TotalStaffRecordsResolver } from './total-staff-records.resolver';

describe('TotalStaffRecordsResolver', () => {
  function setup(idInParams = null) {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        TotalStaffRecordsResolver,
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ establishmentuid: idInParams }) } },
        },
      ],
    });

    const resolver = TestBed.inject(TotalStaffRecordsResolver);
    const route = TestBed.inject(ActivatedRoute);

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'getTotalStaffRecords').and.callThrough();

    return {
      resolver,
      route,
      workerService,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getTotalStaffRecords with uid in establishment service when no uid in params', () => {
    const { resolver, route, workerService } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
    resolver.resolve(route.snapshot);

    expect(workerService.getTotalStaffRecords).toHaveBeenCalledWith(idFromEstablishmentService);
  });

  it('should call getTotalStaffRecords with uid in establishment service when no uid in params', () => {
    const { resolver, route, workerService } = setup('testParamUid');

    resolver.resolve(route.snapshot);

    expect(workerService.getTotalStaffRecords).toHaveBeenCalledWith('testParamUid');
  });
});
