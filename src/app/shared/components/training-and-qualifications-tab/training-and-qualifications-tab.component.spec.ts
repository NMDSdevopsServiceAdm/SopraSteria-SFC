import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
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
import { render } from '@testing-library/angular';

import { TrainingAndQualificationsTabComponent } from './training-and-qualifications-tab.component';

const establishmentBuilder = build('Establishment', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.datatype.uuid()),
    name: fake((f) => f.lorem.sentence()),
  },
});

describe('TrainingAndQualificationsTabComponent', () => {
  async function setup() {
    const component = await render(TrainingAndQualificationsTabComponent, {
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
        trainingCounts: {},
      },
    });

    return {
      component,
    };
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the `Add training for multiple staff` button when the user has edit permission', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.canEditWorker = true;
    component.fixture.detectChanges();
    const multipleTrainingButton = component.getByText('Add training for multiple staff');

    expect(multipleTrainingButton).toBeTruthy();
  });

  it('should not display the `Add training for multiple staff` button when the user does not have edit permission', async () => {
    const { component } = await setup();

    component.fixture.componentInstance.canEditWorker = false;
    component.fixture.detectChanges();
    const multipleTrainingButton = component.queryByText('Add training for multiple staff');

    expect(multipleTrainingButton).toBeFalsy();
  });
});
