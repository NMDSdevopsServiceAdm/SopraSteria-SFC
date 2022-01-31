import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

import { TotalStaffRecordsResolver } from './total-staff-records.resolver';

describe('TotalStaffRecordsResolver', () => {
  let resolver: TotalStaffRecordsResolver;

  beforeEach(() => {
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
      ],
    });
    resolver = TestBed.inject(TotalStaffRecordsResolver);
  });

  it('should create', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getTotalStaffRecords in workerService', () => {
    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'getTotalStaffRecords').and.callThrough();

    resolver.resolve();

    expect(workerService.getTotalStaffRecords).toHaveBeenCalled();
  });
});
