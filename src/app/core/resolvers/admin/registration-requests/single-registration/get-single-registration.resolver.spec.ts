import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationsService } from '@core/services/registrations.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetSingleRegistrationResolver } from './get-single-registration.resolver';

describe('GetSingleRegistrationResolver', () => {
  let resolver: GetSingleRegistrationResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [GetSingleRegistrationResolver],
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
