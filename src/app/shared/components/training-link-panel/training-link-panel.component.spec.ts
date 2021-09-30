import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { TrainingLinkPanelComponent } from '@shared/components/training-link-panel/training-link-panel.component';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
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
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: UserService,
          useFactory: MockUserService.factory(0, true),
          deps: [HttpClient],
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
      ],
      componentProperties: {
        workplace: MockEstablishment as Establishment,
        workers: [
          {
            trainingCount: 1,
            trainingLastUpdated: new Date('2020-01-01').toISOString(),
          },
        ] as Worker[],
      },
    });

    const fixture = component.fixture;
    const componentInstance = fixture.componentInstance;
    return { component, fixture, componentInstance };
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

  it('should show the Manage mandatory training link when canEditEstablishment in permissions service is true', async () => {
    const { component } = await setup();

    expect(component.getByText('Manage mandatory training')).toBeTruthy();
  });

  it('should not show the Manage mandatory training link when user does not have edit access', async () => {
    const { component, fixture, componentInstance } = await setup();

    componentInstance.canEditEstablishment = false;
    fixture.detectChanges();

    expect(component.queryByText('Manage mandatory training')).toBeFalsy();
  });
});
