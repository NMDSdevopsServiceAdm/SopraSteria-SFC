import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationsService } from '@core/services/registrations.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetRegistrationsResolver } from './get-registrations.resolver';
import { provideHttpClient } from '@angular/common/http';

describe('GetRegistrationsResolver', () => {
  let resolver: GetRegistrationsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, RouterTestingModule.withRoutes([])],
      providers: [GetRegistrationsResolver, provideHttpClient(), provideHttpClientTesting()],
    });
    resolver = TestBed.inject(GetRegistrationsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const registrationsService = TestBed.inject(RegistrationsService);
    spyOn(registrationsService, 'getRegistrations').and.callThrough();

    const mockRoute = {
      url: [{ path: 'sfc' }, { path: 'registrations' }, { path: 'mockStatus' }],
    } as ActivatedRouteSnapshot;

    resolver.resolve(mockRoute);

    expect(registrationsService.getRegistrations).toHaveBeenCalledWith('mockStatus');
  });
});
