import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RegistrationsService } from '@core/services/registrations.service';
import { AdminModule } from '@features/admin/admin.module';

import { GetRejectedRegistrationsResolver } from './get-rejected-registrations.resolver';

describe('GetRejectedRegistrationsResolver', () => {
  let resolver: GetRejectedRegistrationsResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AdminModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [GetRejectedRegistrationsResolver],
    });
    resolver = TestBed.inject(GetRejectedRegistrationsResolver);
  });

  it('should be created', () => {
    expect(resolver).toBeTruthy();
  });

  it('should resolve', () => {
    const registrationsService = TestBed.inject(RegistrationsService);
    spyOn(registrationsService, 'getRegistrations').and.callThrough();

    resolver.resolve();

    expect(registrationsService.getRegistrations).toHaveBeenCalledWith('rejected');
  });
});
