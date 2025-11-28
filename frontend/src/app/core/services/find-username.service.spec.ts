import { environment } from 'src/environments/environment';

import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { FindUsernameService } from './find-username.service';
import { provideHttpClient } from '@angular/common/http';

describe('FindUsernameService', () => {
  let service: FindUsernameService;
  let http: HttpTestingController;
  const mockSubscriber = jasmine.createSpy();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FindUsernameService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    mockSubscriber.calls.reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findUserAccount', () => {
    const mockParams = { name: 'Test user', workplaceIdOrPostcode: 'A1234567', email: 'test@example.com' };

    it('should make a POST request to /registration/findUserAccount endpoint with the given search params', async () => {
      service.findUserAccount(mockParams).subscribe();
      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/registration/findUserAccount`);

      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockParams);
    });

    it('should handle a 429 "Too many request" response and convert it to AccountNotFound with remainingAttempts: 0', async () => {
      service.findUserAccount(mockParams).subscribe(mockSubscriber);
      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/registration/findUserAccount`);
      req.flush({ message: 'Reached maximum retry' }, { status: 429, statusText: 'Too many request' });

      const expectedResult = { status: 'AccountNotFound', remainingAttempts: 0 };

      expect(mockSubscriber).toHaveBeenCalledOnceWith(expectedResult);
    });

    it('should handle a 423 "Locked" response and convert it to AccountLocked', async () => {
      service.findUserAccount(mockParams).subscribe(mockSubscriber);
      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/registration/findUserAccount`);
      req.flush({ message: 'User account is locked' }, { status: 423, statusText: 'Locked' });

      const expectedResult = { status: 'AccountLocked' };

      expect(mockSubscriber).toHaveBeenCalledOnceWith(expectedResult);
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

      service.findUsername(mockParams).subscribe(mockSubscriber);
      const req = http.expectOne(`${environment.appRunnerEndpoint}/api/registration/findUsername`);
      req.flush({ answerCorrect: false, remainingAttempts: 4 }, { status: 401, statusText: 'Unauthorised' });

      const expectedResult = { answerCorrect: false, remainingAttempts: 4 };

      expect(mockSubscriber).toHaveBeenCalledOnceWith(expectedResult);
    });
  });
});
