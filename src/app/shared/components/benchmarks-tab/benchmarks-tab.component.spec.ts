import { render, within } from '@testing-library/angular';
import { of } from 'rxjs';
import { Establishment } from '../../../../mockdata/establishment';

import { SharedModule } from '@shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WindowRef } from '@core/services/window.ref';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HttpClient } from '@angular/common/http';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { getTestBed } from '@angular/core/testing';
import { BenchmarksTabComponent } from '@shared/components/benchmarks-tab/benchmarks-tab.component';
import { BenchmarksService } from '@core/services/benchmarks.service';
import { MockBenchmarksService } from '@core/test-utils/MockBenchmarkService';

fdescribe('BenchmarksTabComponent', () => {
  async function setup(isAdmin = true, subsidiaries = 0) {
    const component =  await render(BenchmarksTabComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      declarations: [
      ],
      providers: [
        {
          provide: WindowRef,
          useClass: WindowRef
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(),
          deps: [HttpClient, Router, UserService]
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
          deps: [HttpClient]
        },
        {
          provide: BenchmarksService,
          useClass: MockBenchmarksService
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService
        },
        {
          provide: AuthService,
          useClass: MockAuthService
        }
      ]
    });

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

    return {
      component,
      establishmentService,
      router
    };
  }

  it('should render a BenchmarksTabComponent', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.workplace = Establishment;
    expect(component).toBeTruthy();
  });
});
