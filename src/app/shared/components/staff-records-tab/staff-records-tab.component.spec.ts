import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { StaffRecordsTabComponent } from './staff-records-tab.component';

describe('StaffRecordsTab', () => {
  async function setup(permissions = []) {
    const establishment = establishmentBuilder() as Establishment;
    const { fixture, getByText, queryByText } = await render(StaffRecordsTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: WindowRef,
          useValue: WindowRef,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
      ],
      componentProperties: {
        workplace: establishment,
      },
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const workerSpy = spyOn(workerService, 'setAddStaffRecordInProgress');

    return {
      component,
      fixture,
      getByText,
      queryByText,
      establishmentService,
      workerService,
      workerSpy,
    };
  }

  it('should render a StaffRecordsTabComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should not display Add a staff record if user does not have canAddWorker permission', async () => {
    const { queryByText } = await setup();
    expect(queryByText('Add a staff record')).toBeFalsy();
  });

  it('should display Add a staff record if user does have canAddWorker permission', async () => {
    const { queryByText } = await setup(['canAddWorker']);
    expect(queryByText('Add a staff record')).toBeTruthy();
  });
});
