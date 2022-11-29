import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { RemoveAllMandatoryTrainingComponent } from './delete-all-mandatory-training.component';

describe('RemoveAllMandatoryTrainingComponent', () => {
  async function setup() {
    const { getByText, fixture } = await render(RemoveAllMandatoryTrainingComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
      providers: [
        AlertService,
        BackService,
        TrainingService,
        {
          provide: WindowRef,
          useClass: WindowRef,
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: TrainingService,
          useClass: MockTrainingService,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: {
                  establishment: {
                    uid: '98a83eef-e1e1-49f3-89c5-b1287a3cc8de',
                  },
                },
              },
            },
          },
        },
      ],
    });
    const component = fixture.componentInstance;

    const injector = getTestBed();
    const trainingService = injector.inject(TrainingService);
    const alertService = injector.inject(AlertService) as AlertService;

    const deleteAllMandatoryTrainingSpy = spyOn(trainingService, 'deleteAllMandatoryTraining').and.callThrough();
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      fixture,
      deleteAllMandatoryTrainingSpy,
      alertSpy,
      routerSpy,
      getByText,
    };
  }

  it('should render the component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('Should display the remove mandatory training title', async () => {
    const { getByText } = await setup();
    expect(getByText(`You're about to remove all mandatory training categories for your workplace`)).toBeTruthy();
  });

  it('Should display the remove mandatory training paragraph', async () => {
    const { getByText } = await setup();
    expect(
      getByText(
        'If you do this, your workplace will not have any training set up as being mandatory for your staff at the moment.',
      ),
    ).toBeTruthy();
  });

  describe('remove mandatory training button', async () => {
    it('Should render Remove categories button and cancel link', async () => {
      const { getByText } = await setup();
      expect(getByText('Remove categories')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('should delete the mandatory trainings when the button is clicked', async () => {
      const { getByText, deleteAllMandatoryTrainingSpy } = await setup();

      const submitButton = getByText('Remove categories');
      fireEvent.click(submitButton);

      expect(deleteAllMandatoryTrainingSpy).toHaveBeenCalled();
    });

    it('return to the add-and-manage-mandatory-training when cancel is clicked', async () => {
      const { component, getByText, routerSpy } = await setup();

      userEvent.click(getByText('Cancel'));
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.establishment.uid,
        'add-and-manage-mandatory-training',
      ]);
    });
  });
});
