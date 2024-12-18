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

  describe('findUsername', () => {
    it('should make a POST request to /registration/findUsername endpoint with uid and security question answer', async () => {
      const mockParams = { uid: 'mock-uid', securityQuestionAnswer: '42' };

      service.findUsername(mockParams).subscribe();
      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/registration/findUsername`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockParams);
    });

    it('should handle a 401 Unauthorised response and convert it to AnswerIncorrect', async () => {
      const mockParams = { uid: 'mock-uid', securityQuestionAnswer: '42' };

      const mockSubscriber = jasmine.createSpy();
      service.findUsername(mockParams).subscribe(mockSubscriber);
      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/registration/findUsername`);
      req.flush({ answerCorrect: false, remainingAttempts: 4 }, { status: 401, statusText: 'Unauthorised' });

      const expectedResult = { answerCorrect: false, remainingAttempts: 4 };

      expect(mockSubscriber).toHaveBeenCalledOnceWith(expectedResult);
    });
  });
});
