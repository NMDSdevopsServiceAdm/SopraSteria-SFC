import { RegistrationService } from '@core/services/registration.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

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

  it('should update the userResearchInviteResponse', async () => {
    service.userResearchInviteResponse$.next('yes')
    expect(service.userResearchInviteResponse$.value).toEqual('yes');
  })
});
