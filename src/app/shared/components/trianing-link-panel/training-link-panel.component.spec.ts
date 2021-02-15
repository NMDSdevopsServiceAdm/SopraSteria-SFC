import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { TrainingLinkPanelComponent } from '@shared/components/trianing-link-panel/trianing-link-panel.component.component';
import { render } from '@testing-library/angular';

describe('TrainingLinkPanelComponent', () => {
  async function setup() {
    const component = await render(TrainingLinkPanelComponent, {
      imports: [RouterModule, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
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
    });
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;

    return { component, establishmentService };
  }

  it('should render a TrainingLinkPanelComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the latest date of any training record (1/1/20)', async () => {
    const { component } = await setup();

    component.fixture.detectChanges();
    component.getByText('Updated 1 January 2020');
  });
});
