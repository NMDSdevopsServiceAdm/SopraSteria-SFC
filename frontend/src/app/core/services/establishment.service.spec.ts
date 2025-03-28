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
});
