import { RegistrationService } from '@core/services/registration.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { InviteResponse } from '@core/model/userDetails.model';

describe('RegistrationService', () => {
  let service: RegistrationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    service = TestBed.inject(RegistrationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('resetService', () => {
    it('should update registrationInProgress', async () => {
      service.registrationInProgress$.next(true)
      service.resetService();
      expect(service.registrationInProgress$.value).toEqual(false);
    })

    it('should update loginCredentials', async () => {
      const credentials = {username: 'Username', password: 'Password'}
      service.loginCredentials$.next(credentials);
      service.resetService();
      expect(service.loginCredentials$.value).toEqual(null);
    })

    it('should update securityDetails', async () => {
      const details = {securityQuestion: 'Favourite colour', securityQuestionAnswer: 'Red'}
      service.securityDetails$.next(details)
      service.resetService();
      expect(service.securityDetails$.value).toEqual(null);
    })

    it('should update termsAndConditionsCheckbox$', async () => {
      service.termsAndConditionsCheckbox$.next(true)
      service.resetService();
      expect(service.termsAndConditionsCheckbox$.value).toEqual(false);
    })

    it('should update the userResearchInviteResponse', async () => {
      service.userResearchInviteResponse$.next(InviteResponse.Yes);
      service.resetService();
      expect(service.userResearchInviteResponse$.value).toEqual(null);
    })
  })
});
