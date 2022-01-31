import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUserService } from '@core/test-utils/MockUserService';

import { AllUsersForEstablishmentResolver } from './all-users-for-establishment.resolver';

describe('AllUsersForEstablishmentResolver', () => {
  let resolver: AllUsersForEstablishmentResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      providers: [
        AllUsersForEstablishmentResolver,
        {
          provide: UserService,
          useClass: MockUserService,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
    });
    resolver = TestBed.inject(AllUsersForEstablishmentResolver);
  });

  it('should create', () => {
    expect(resolver).toBeTruthy();
  });

  it('should call getAllUsersForEstablishment in userService', () => {
    const userService = TestBed.inject(UserService);
    spyOn(userService, 'getAllUsersForEstablishment').and.callThrough();

    resolver.resolve();

    expect(userService.getAllUsersForEstablishment).toHaveBeenCalled();
  });
});
