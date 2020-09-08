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

import { StaffRecordsTabComponent } from './staff-records-tab.component';

const { build, fake, sequence, } = require('@jackfranklin/test-data-bot');

describe('StaffRecordsTab', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.random.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });

  async function setup(isAdmin = true, subsidiaries = 0) {
    const establishment = establishmentBuilder() as Establishment;
    const component = await render(StaffRecordsTabComponent, {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule,
          HttpClientTestingModule,
        ],
        declarations: [],
        providers: [
          {
            provide: WorkerService,
            useClass: MockWorkerService
          },
          {
            provide: WindowRef,
            useValue: WindowRef
          },
          {
            provide: PermissionsService,
            useFactory: MockPermissionsService.factory(),
            deps: [HttpClient, Router, UserService]
          },
          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService
          }
        ],
        componentProperties: {
          workplace: establishment
        },
      })
    ;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const workerService = injector.inject(WorkerService) as WorkerService;

    return {
      component,
      establishmentService,
      workerService
    };
  }

  it('should render a StaffRecordsTabComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });
  it('should show flu jab when can add worker', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.canAddWorker = true;

    component.fixture.detectChanges()

    expect(component.queryByTestId('flu-jab')).toBeTruthy();
  });
  it('should not show flu jab when no workers', async () => {
    const { component } = await setup();
    component.fixture.componentInstance.canAddWorker = true;
    component.fixture.componentInstance.workers = []
    component.fixture.detectChanges()
    expect(component.queryByTestId('flu-jab')).toBeFalsy();
  });
});

