import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUserService } from '@core/test-utils/MockUserService';

import { AllUsersForEstablishmentResolver } from './all-users-for-establishment.resolver';

describe('AllUsersForEstablishmentResolver', () => {
  function setup(idInParams = null) {
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
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ establishmentuid: idInParams }) } },
        },
      ],
    });

    const resolver = TestBed.inject(AllUsersForEstablishmentResolver);
    const route = TestBed.inject(ActivatedRoute);

    const userService = TestBed.inject(UserService);
    spyOn(userService, 'getAllUsersForEstablishment').and.callThrough();

    return {
      resolver,
      route,
      userService,
    };
  }

  it('should create', () => {
    const { resolver } = setup();

    expect(resolver).toBeTruthy();
  });

  it('should call getAllUsersForEstablishment with params id when no uid in params', () => {
    const { resolver, route, userService } = setup();

    const idFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
    resolver.resolve(route.snapshot);

    expect(userService.getAllUsersForEstablishment).toHaveBeenCalledWith(idFromEstablishmentService);
  });

  it('should call getAllUsersForEstablishment with id from params when it exists', () => {
    const { resolver, route, userService } = setup('uidInParams');

    resolver.resolve(route.snapshot);

    expect(userService.getAllUsersForEstablishment).toHaveBeenCalledWith('uidInParams');
  });
});
