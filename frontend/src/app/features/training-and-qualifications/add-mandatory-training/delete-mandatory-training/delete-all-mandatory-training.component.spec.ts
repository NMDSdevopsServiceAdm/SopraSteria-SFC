import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { RemoveAllMandatoryTrainingComponent } from './delete-all-mandatory-training.component';

describe('RemoveAllMandatoryTrainingComponent', () => {
  async function setup() {
    const establishment = establishmentBuilder() as Establishment;

    const setupTools = await render(RemoveAllMandatoryTrainingComponent, {
      imports: [SharedModule, RouterModule],
      declarations: [],
      providers: [
        AlertService,
        BackLinkService,
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
                  establishment,
                },
              },
            },
          },
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const trainingService = injector.inject(TrainingService);
    const alertService = injector.inject(AlertService) as AlertService;

    const deleteAllMandatoryTrainingSpy = spyOn(trainingService, 'deleteAllMandatoryTraining').and.callThrough();
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      ...setupTools,
      component,
      deleteAllMandatoryTrainingSpy,
      alertSpy,
      routerSpy,
      establishment,
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
        'If you do this, your workplace will no longer have any training set up as being mandatory for your staff.',
      ),
    ).toBeTruthy();
  });

  it('Should render Remove categories button and cancel link', async () => {
    const { getByText } = await setup();
    expect(getByText('Remove categories')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  describe('On submit', async () => {
    it('should delete the mandatory trainings when the button is clicked', async () => {
      const { getByText, deleteAllMandatoryTrainingSpy, establishment } = await setup();

      const submitButton = getByText('Remove categories');
      fireEvent.click(submitButton);

      expect(deleteAllMandatoryTrainingSpy).toHaveBeenCalledWith(establishment.id);
    });

    it('return to the add-and-manage-mandatory-training page', async () => {
      const { getByText, routerSpy, establishment } = await setup();

      const submitButton = getByText('Remove categories');
      fireEvent.click(submitButton);

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', establishment.uid, 'add-and-manage-mandatory-training']);
    });

    it("should display a success banner with 'All mandatory training categories removed'", async () => {
      const { fixture, alertSpy, getByText } = await setup();

      const submitButton = getByText('Remove categories');
      fireEvent.click(submitButton);
      await fixture.whenStable();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'All mandatory training categories removed',
      });
    });
  });

  it('should return to the add-and-manage-mandatory-training when Cancel is clicked', async () => {
    const { getByText, routerSpy, establishment } = await setup();

    userEvent.click(getByText('Cancel'));
    expect(routerSpy).toHaveBeenCalledWith(['/workplace', establishment.uid, 'add-and-manage-mandatory-training']);
  });
});
