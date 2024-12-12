import { environment } from 'src/environments/environment';

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FindUsernameService } from './find-username.service';

describe('FindUsernameService', () => {
  let service: FindUsernameService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(FindUsernameService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findUserAccount', () => {
    it('should make a POST request to /registration/findUserAccount endpoint with the given search params', async () => {
      const mockParams = { name: 'Test user', workplaceIdOrPostcode: 'A1234567', email: 'test@example.com' };

      service.findUserAccount(mockParams).subscribe();
      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/registration/findUserAccount`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockParams);
    });
  });
});
