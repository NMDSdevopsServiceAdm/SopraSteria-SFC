import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { PermissionType } from '@core/model/permissions.model';
import { Worker } from '@core/model/worker.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { UserService } from '@core/services/user.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { workerBuilder } from '@core/test-utils/MockWorkerService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { TrainingLinkPanelComponent } from '../training-link-panel/training-link-panel.component';
import { TrainingAndQualificationsTabComponent } from './training-and-qualifications-tab.component';

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

fdescribe('TrainingAndQualificationsTabComponent', () => {
  async function setup(permissions = ['canEditWorker'], withWorkers = true) {
    const workers = withWorkers && ([workerBuilder(), workerBuilder()] as Worker[]);
    const { fixture, getByText, queryByText, getByTestId } = await render(TrainingAndQualificationsTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [TrainingLinkPanelComponent],
      providers: [
        TrainingCategoryService,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: FeatureFlagsService,
          useClass: MockFeatureFlagsService,
        },
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(permissions as PermissionType[]),
          deps: [HttpClient, Router, UserService],
        },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        trainingCounts: {},
        workers: workers,
        workerCount: workers.length,
      },
    });

    const component = fixture.componentInstance;

    return {
      component,
      fixture,
      getByText,
      queryByText,
      getByTestId,
    };
  }

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('add multiple training records button', () => {
    it('should display the `Add multiple training records` button with the correct link when the user has edit permission', async () => {
      const { component, getByText } = await setup();

      const workplaceUid = component.workplace.uid;
      const multipleTrainingButton = getByText('Add multiple training records');
      expect(multipleTrainingButton).toBeTruthy();
      expect(multipleTrainingButton.getAttribute('href')).toEqual(
        `/workplace/${workplaceUid}/add-multiple-training/select-staff`,
      );
    });

    it('should not display the `Add multiple training records` button when the user does not have edit permission', async () => {
      const { queryByText } = await setup([]);

      const multipleTrainingButton = queryByText('Add multiple training records');
      expect(multipleTrainingButton).toBeFalsy();
    });
  });

  it('renders the training link panel', async () => {
    const { getByTestId } = await setup();
    expect(getByTestId('trainingLinkPanel')).toBeTruthy();
  });

  it('should display a correct message when there are no staff', async () => {
    const { getByText } = await setup(['canEditWorker'], false);

    expect(getByText('You need to start adding your staff records.')).toBeTruthy();
  });

  describe('staff and training views when there are workers', () => {
    it('should render the tab bar to show different views', async () => {
      const { getByText } = await setup();

      expect(getByText('Staff')).toBeTruthy();
      expect(getByText('Training')).toBeTruthy();
    });

    xit('shoud render a tab bar with the default table showing t and q by staff name', async () => {
      const { getByText } = await setup();
    });
  });
});
