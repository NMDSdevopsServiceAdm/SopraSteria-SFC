import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { render } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { CheckAnswersComponent } from './check-answers.component';

describe('CheckAnswersComponent', () => {
  async function setup() {
    return await render(CheckAnswersComponent, {
      imports: [RouterModule, RouterTestingModule, WorkplaceModule, HttpClientTestingModule],
      providers: [
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: WorkerService, useClass: MockWorkerService },
      ],
    });
  }

  it('should render a CheckAnswersComponent', async () => {
    const component = await setup();

    expect(component).toBeTruthy();
  });
});
