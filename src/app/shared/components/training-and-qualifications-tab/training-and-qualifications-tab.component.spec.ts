import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { TrainingCategoryService } from '@core/services/training-category.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByTestId, render } from '@testing-library/angular';
import { Worker } from '@core/model/worker.model';

import { TrainingAndQualificationsTabComponent } from './training-and-qualifications-tab.component';

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

describe('TrainingAndQualificationsTabComponent', () => {
  async function setup(withWorkers = true) {
    const { fixture, getByTestId, getByText, queryByText } = await render(TrainingAndQualificationsTabComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
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
          useClass: MockPermissionsService,
        },
      ],
      componentProperties: {
        workplace: establishmentBuilder() as Establishment,
        workers: !withWorkers
          ? undefined
          : ([
              {
                trainingCount: 1,
                trainingLastUpdated: new Date('2020-01-01').toISOString(),
              },
            ] as Worker[]),
        workerCount: !withWorkers ? 0 : 1,
        trainingCounts: {},
      },
    });

    const component = fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      getByTestId,
      getByText,
      queryByText,
      routerSpy,
    };
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  describe('Add multiple training records', () => {
    it('should display the `Add multiple training records` button when the user has edit permission', async () => {
      const { component, fixture, getByText } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();
      const multipleTrainingButton = getByText('Add multiple training records');

      expect(multipleTrainingButton).toBeTruthy();
    });

    it('should navigate to the select staff page', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.canEditWorker = true;
      fixture.detectChanges();

      const multipleTrainingButton = getByText('Add multiple training records');
      fireEvent.click(multipleTrainingButton);

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'add-multiple-training',
        'select-staff',
      ]);
    });

    it('should not display the `Add multiple training records` button when the user does not have edit permission', async () => {
      const { component, fixture, queryByText } = await setup();

      component.canEditWorker = false;
      fixture.detectChanges();
      const multipleTrainingButton = queryByText('Add multiple training records');

      expect(multipleTrainingButton).toBeFalsy();
    });

    it('should not display the `Add multiple training records` button when there are no staff records', async () => {
      const { component, fixture, queryByText } = await setup(false);

      component.canEditWorker = true;
      fixture.detectChanges();
      const multipleTrainingButton = queryByText('Add multiple training records');

      expect(multipleTrainingButton).toBeFalsy();
    });

    it('should display the warning banner when there are no staff records', async () => {
      const { component, fixture, getByTestId } = await setup(false);

      component.canEditWorker = true;
      fixture.detectChanges();
      const noStaffWarning = getByTestId('noStaffRecordsWarningBanner');

      expect(noStaffWarning).toBeTruthy();
    });
  });
});
