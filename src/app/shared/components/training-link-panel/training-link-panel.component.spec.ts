import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { TrainingLinkPanelComponent } from '@shared/components/training-link-panel/training-link-panel.component';
import { render } from '@testing-library/angular';

import { Establishment as MockEstablishment } from '../../../../mockdata/establishment';

describe('TrainingLinkPanelComponent', () => {
  async function setup() {
    const component = await render(TrainingLinkPanelComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: PermissionsService,
          useClass: MockPermissionsService,
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, true),
          deps: [HttpClient],
        },
      ],
      componentProperties: {
        workplace: MockEstablishment as Establishment,
      },
    });

    return { component };
  }

  it('should render a TrainingLinkPanelComponent', async () => {
    const { component } = await setup();

    component.fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show the latest date of any training record (1/1/20)', async () => {
    const { component } = await setup();

    component.fixture.detectChanges();
    component.getByText('Updated 1 January 2020');
  });
});
