import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { Observable, throwError } from 'rxjs';

import { AddMandatoryTrainingModule } from '../add-mandatory-training.module';
import { AllOrSelectedJobRolesComponent } from './all-or-selected-job-roles.component';

describe('AllOrSelectedJobRolesComponent', () => {
  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder();
    const routerSpy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));

    const setupTools = await render(AllOrSelectedJobRolesComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, AddMandatoryTrainingModule],
      providers: [
        {
          provide: TrainingService,
          useValue: {
            selectedTraining:
              overrides.selectedTraining !== undefined
                ? overrides.selectedTraining
                : {
                    trainingCategory: {
                      category: 'Activity provision, wellbeing',
                      id: 1,
                      seq: 0,
                      trainingCategoryGroup: 'Care skills and knowledge',
                    },
                  },
            resetState: () => {},
          },
        },
        { provide: Router, useFactory: MockRouter.factory({ navigate: routerSpy }) },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        {
          provide: ActivatedRoute,
          useValue: {
            params: Observable.from([{ establishmentuid: establishment.uid }]),
            snapshot: {
              parent: {
                data: { establishment },
              },
            },
          },
        },
        AlertService,
        WindowRef,
      ],
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const resetStateInTrainingServiceSpy = spyOn(trainingService, 'resetState').and.callThrough();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const createAndUpdateMandatoryTrainingSpy = spyOn(
      establishmentService,
      'createAndUpdateMandatoryTraining',
    ).and.callThrough();

    return {
      ...setupTools,
      component,
      routerSpy,
      resetStateInTrainingServiceSpy,
      alertSpy,
      createAndUpdateMandatoryTrainingSpy,
      establishment,
    };
  }

  it('should render component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should show the page caption', async () => {
    const { getByText } = await setup();

    const caption = getByText('Add a mandatory training category');

    expect(caption).toBeTruthy();
  });

  it('should show the page heading', async () => {
    const { getByText } = await setup();

    const heading = getByText('Which job roles need this training?');

    expect(heading).toBeTruthy();
  });

  it('should navigate back to the select training category page if no training category set in training service', async () => {
    const { component, routerSpy } = await setup({ selectedTraining: null });

    expect(routerSpy).toHaveBeenCalledWith(['../select-training-category'], { relativeTo: component.route });
  });

  describe('Mandatory for everybody message', () => {
    ['Activity provision, wellbeing', 'Digital leadership skills'].forEach((category) => {
      it(`should display with selected training category (${category}) when All job roles radio is clicked`, async () => {
        const selectedTraining = {
          trainingCategory: {
            category,
            id: 1,
            seq: 0,
            trainingCategoryGroup: 'Care skills and knowledge',
          },
        };

        const { fixture, getByText } = await setup({ selectedTraining });

        const expectedMessage = `If you click Continue, '${selectedTraining.trainingCategory.category}' will be mandatory for everybody in your workplace.`;

        const allJobRolesRadio = getByText('All job roles');
        userEvent.click(allJobRolesRadio);
        fixture.detectChanges();

        const mandatoryForEverybodyMessage = getByText(expectedMessage);

        expect(mandatoryForEverybodyMessage).toBeTruthy();
        expect(mandatoryForEverybodyMessage.parentElement).not.toHaveClass('govuk-radios__conditional--hidden');
      });
    });

    it('should not display on page load when no radio is selected', async () => {
      const { queryByText } = await setup();

      const mandatoryForEverybodyMessage = queryByText('If you click Continue', { exact: false });

      expect(mandatoryForEverybodyMessage.parentElement).toHaveClass('govuk-radios__conditional--hidden');
    });

    it('should not display after user clicks Only selected jobs radio', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const selectedJobRolesRadio = getByText('Only selected job roles');
      userEvent.click(selectedJobRolesRadio);
      fixture.detectChanges();

      const mandatoryForEverybodyMessage = queryByText('If you click Continue', { exact: false });

      expect(mandatoryForEverybodyMessage.parentElement).toHaveClass('govuk-radios__conditional--hidden');
    });

    it('should stop displaying if user has clicked All job roles and then clicks Only selected jobs radio', async () => {
      const { fixture, getByText, queryByText } = await setup();

      const allJobRolesRadio = getByText('All job roles');
      userEvent.click(allJobRolesRadio);
      fixture.detectChanges();

      const selectedJobRolesRadio = getByText('Only selected job roles');
      userEvent.click(selectedJobRolesRadio);
      fixture.detectChanges();

      const mandatoryForEverybodyMessage = queryByText('If you click Continue', { exact: false });

      expect(mandatoryForEverybodyMessage.parentElement).toHaveClass('govuk-radios__conditional--hidden');
    });
  });

  describe('Cancel button', () => {
    it('should navigate to the add-and-manage-mandatory-training page (relative route ../) when clicked', async () => {
      const { component, getByText, routerSpy } = await setup({ selectedTraining: null });

      const cancelButton = getByText('Cancel');
      userEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it('should clear state in training service when clicked', async () => {
      const { getByText, resetStateInTrainingServiceSpy } = await setup({ selectedTraining: null });

      const cancelButton = getByText('Cancel');
      userEvent.click(cancelButton);

      expect(resetStateInTrainingServiceSpy).toHaveBeenCalled();
    });
  });

  describe('Error messages', () => {
    it('should display an error message if option not selected and Continue is clicked', async () => {
      const { fixture, getByText, getAllByText } = await setup();

      fireEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(
        getAllByText('Select whether this training is for all job roles or only selected job roles').length,
      ).toEqual(2);
    });
  });

  describe('On submit', () => {
    describe("when 'All job roles selected'", () => {
      const selectAllJobRolesAndSubmit = (fixture, getByText) => {
        fireEvent.click(getByText('All job roles'));
        fixture.detectChanges();

        fireEvent.click(getByText('Continue'));
        fixture.detectChanges();
      };

      it('should call createAndUpdateMandatoryTraining with training category in service and allJobRoles true', async () => {
        const selectedTraining = {
          trainingCategory: {
            category: 'Activity provision, wellbeing',
            id: 3,
            seq: 0,
            trainingCategoryGroup: 'Care skills and knowledge',
          },
        };

        const { fixture, getByText, establishment, createAndUpdateMandatoryTrainingSpy } = await setup({
          selectedTraining,
        });

        selectAllJobRolesAndSubmit(fixture, getByText);

        expect(createAndUpdateMandatoryTrainingSpy).toHaveBeenCalledWith(establishment.uid, {
          trainingCategoryId: selectedTraining.trainingCategory.id,
          allJobRoles: true,
          jobs: [],
        });
      });

      it('should navigate back to add-and-manage-mandatory-training main page', async () => {
        const { component, fixture, getByText, routerSpy } = await setup();

        selectAllJobRolesAndSubmit(fixture, getByText);

        expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
      });

      it("should display 'Mandatory training category added' banner", async () => {
        const { fixture, getByText, alertSpy } = await setup();

        selectAllJobRolesAndSubmit(fixture, getByText);

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Mandatory training category added',
        });
      });

      it('should clear state in training service', async () => {
        const { fixture, getByText, resetStateInTrainingServiceSpy } = await setup();

        selectAllJobRolesAndSubmit(fixture, getByText);

        expect(resetStateInTrainingServiceSpy).toHaveBeenCalled();
      });

      it('should display server error message if call to backend fails', async () => {
        const { fixture, getByText, createAndUpdateMandatoryTrainingSpy } = await setup();

        createAndUpdateMandatoryTrainingSpy.and.returnValue(throwError(() => new Error('Unexpected error')));

        selectAllJobRolesAndSubmit(fixture, getByText);

        const expectedErrorMessage = 'There has been a problem saving your mandatory training. Please try again.';

        expect(getByText(expectedErrorMessage)).toBeTruthy();
      });
    });

    it("should navigate to select-job-roles page when user submits with 'Only selected job roles' selected", async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      fireEvent.click(getByText('Only selected job roles'));
      fixture.detectChanges();

      fireEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['../', 'select-job-roles'], { relativeTo: component.route });
    });
  });
});
