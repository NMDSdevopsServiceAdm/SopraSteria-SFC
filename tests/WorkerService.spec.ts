import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WorkerService } from '@core/services/worker.service';

describe('WorkerService', () => {
  let service: WorkerService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkerService]
    });

    service = TestBed.get(WorkerService);
    httpMock = TestBed.get(HttpTestingController);
  });

  it('should get the update a worker successful', () => {
    const workplaceUid = '123';
    const workerId = '123';
    const props = {};

    service.updateWorker(workplaceUid, workerId, props).subscribe(
      data => expect(data.uid).toBe('123')
    );

    const req = httpMock.expectOne(`/api/establishment/${workplaceUid}/worker/${workerId}`);
    req.flush({
      uid: '123',
    });
  });
});
