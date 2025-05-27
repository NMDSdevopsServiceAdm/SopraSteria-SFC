import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { EstablishmentService } from './establishment.service';

describe('EstablishmentService', () => {
  let service: EstablishmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EstablishmentService],
    });
    service = TestBed.inject(EstablishmentService);

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('updateSingleEstablishmentField', () => {
    it('should call updateSingleEstablishmentField for a given establishment with the correct data', () => {
      const requestBody = {
        property: 'exampleColumnName',
        value: 'Yes, always',
      };

      service.updateSingleEstablishmentField('establishmentId', requestBody).subscribe();

      const req = http.expectOne(
        `${environment.appRunnerEndpoint}/api/establishment/establishmentId/updateSingleEstablishmentField`,
      );

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(requestBody);
    });
  });

  describe('workplaceOrSubHasTrainingCertificates', () => {
    const mockWorkplaceUid = 'mockWorkplaceUid';

    const hasTrainingCertificatesEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/hasTrainingCertificates`;

    it('should make call to expected backend endpoint', async () => {
      service.workplaceOrSubHasTrainingCertificates(mockWorkplaceUid).subscribe();

      const hasTrainingCertificatesRequest = http.expectOne(hasTrainingCertificatesEndpoint);
      expect(hasTrainingCertificatesRequest.request.method).toBe('GET');
    });
  });

  describe('updateJobs', () => {
    const mockWorkplaceUid = 'mockWorkplaceUid';
    const payload = {
      vacancies: [
        { jobId: 10, total: 2 },
        { jobId: 25, total: 3 },
      ],
    };
    const mockResponse = {
      uid: mockWorkplaceUid,
      vacancies: [
        {
          jobId: 10,
          title: 'Care worker',
          total: 2,
        },
        {
          jobId: 25,
          title: 'Senior care worker',
          total: 3,
        },
      ],
      totalVacancies: 5,
    };

    const updateJobsEndpoint = `${environment.appRunnerEndpoint}/api/establishment/${mockWorkplaceUid}/jobs`;

    it('should make call to expected backend endpoint', async () => {
      const onSuccessSpy = jasmine.createSpy();

      service.updateJobs(mockWorkplaceUid, payload).subscribe((data) => onSuccessSpy(data));

      const expectedRequest = http.expectOne(updateJobsEndpoint);
      expectedRequest.flush(mockResponse);

      expect(expectedRequest.request.method).toBe('POST');
      expect(expectedRequest.request.body).toEqual(payload);
      expect(onSuccessSpy).toHaveBeenCalledWith(mockResponse);
    });

    it('should update the local establishment object on success', async () => {
      const setStateSpy = spyOn(service, 'setState');

      service.updateJobs(mockWorkplaceUid, payload).subscribe();

      const expectedRequest = http.expectOne(updateJobsEndpoint);
      expectedRequest.flush(mockResponse);

      expect(setStateSpy).toHaveBeenCalledWith(jasmine.objectContaining(mockResponse));
    });

    it('should not update the local establishment object when request failed', async () => {
      const setStateSpy = spyOn(service, 'setState');
      const onSuccessSpy = jasmine.createSpy();
      const onErrorSpy = jasmine.createSpy();

      service.updateJobs(mockWorkplaceUid, payload).subscribe(onSuccessSpy, onErrorSpy);

      const expectedRequest = http.expectOne(updateJobsEndpoint);
      expectedRequest.flush(null, { status: 500, statusText: 'Internal server error' });

      expect(setStateSpy).not.toHaveBeenCalled();
      expect(onSuccessSpy).not.toHaveBeenCalled();
      expect(onErrorSpy).toHaveBeenCalled();
    });
  });
});
