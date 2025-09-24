import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationsService } from '@core/services/registrations.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetRegistrationNotesResolver } from './get-registration-notes.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetRegistrationNotesResolver', () => {
  let resolver: GetRegistrationNotesResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterTestingModule.withRoutes([])],
      providers: [GetRegistrationNotesResolver, provideHttpClient(), provideHttpClientTesting()],
    });
    resolver = TestBed.inject(GetRegistrationNotesResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getRegistrationNotes with uid in route', () => {
    const registrationsService = TestBed.inject(RegistrationsService);
    spyOn(registrationsService, 'getRegistrationNotes').and.callThrough();

    const mockRoute = {
      url: [{ path: 'sfc' }, { path: 'registrations' }, { path: 'mockUid' }],
    } as ActivatedRouteSnapshot;

    resolver.resolve(mockRoute);

    expect(registrationsService.getRegistrationNotes).toHaveBeenCalledWith('mockUid');
  });
});
