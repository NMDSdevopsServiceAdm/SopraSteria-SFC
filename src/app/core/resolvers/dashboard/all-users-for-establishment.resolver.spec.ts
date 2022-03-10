import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PermissionType } from '@core/model/permissions.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';

import { AllUsersForEstablishmentResolver } from './all-users-for-establishment.resolver';

describe('AllUsersForEstablishmentResolver', () => {
  function setup(idInParams = null, permissions = ['canViewListOfUsers']) {
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
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
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

  it('should call getAllUsersForEstablishment with uid in establishment service when no uid in params', () => {
    const { resolver, route, userService } = setup();

    const uidFromEstablishmentService = '98a83eef-e1e1-49f3-89c5-b1287a3cc8dd';
    resolver.resolve(route.snapshot);

    expect(userService.getAllUsersForEstablishment).toHaveBeenCalledWith(uidFromEstablishmentService);
  });

  it('should call getAllUsersForEstablishment with uid from params when it exists', () => {
    const { resolver, route, userService } = setup('uidInParams');

    resolver.resolve(route.snapshot);

    expect(userService.getAllUsersForEstablishment).toHaveBeenCalledWith('uidInParams');
  });

  it('should not call getAllUsersForEstablishment when workplace does not have canViewListOfUsers permission', () => {
    const { resolver, route, userService } = setup('paramUid', []);

    resolver.resolve(route.snapshot);

    expect(userService.getAllUsersForEstablishment).not.toHaveBeenCalled();
  });
});
