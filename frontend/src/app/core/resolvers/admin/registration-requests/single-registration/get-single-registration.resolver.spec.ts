import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterModule } from '@angular/router';
import { RegistrationsService } from '@core/services/registrations.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetSingleRegistrationResolver } from './get-single-registration.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetSingleRegistrationResolver', () => {
  let resolver: GetSingleRegistrationResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterModule],
      providers: [GetSingleRegistrationResolver, provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    resolver = TestBed.inject(GetSingleRegistrationResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getSingleRegistration with uid in route', () => {
    const registrationsService = TestBed.inject(RegistrationsService);
    spyOn(registrationsService, 'getSingleRegistration').and.callThrough();

    const mockRoute = {
      url: [{ path: 'sfcadmin' }, { path: 'registrations' }, { path: 'mockUid' }],
    } as ActivatedRouteSnapshot;

    resolver.resolve(mockRoute);

    expect(registrationsService.getSingleRegistration).toHaveBeenCalledWith('mockUid');
  });
});
