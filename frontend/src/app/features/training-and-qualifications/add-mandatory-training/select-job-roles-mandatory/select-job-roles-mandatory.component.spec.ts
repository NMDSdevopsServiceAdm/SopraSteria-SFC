import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { AddMandatoryTrainingModule } from '../add-mandatory-training.module';
import { SelectJobRolesMandatoryComponent } from './select-job-roles-mandatory.component';

describe('SelectJobRolesMandatoryComponent', () => {
  const mockAvailableJobs = [
    {
      id: 4,
      title: 'Allied health professional (not occupational therapist)',
      jobRoleGroup: 'Professional and related roles',
    },
    {
      id: 10,
      title: 'Care worker',
      jobRoleGroup: 'Care providing roles',
    },
    {
      id: 23,
      title: 'Registered nurse',
      jobRoleGroup: 'Professional and related roles',
    },
    {
      id: 27,
      title: 'Social worker',
      jobRoleGroup: 'Professional and related roles',
    },
    {
      id: 20,
      title: 'Other (directly involved in providing care)',
      jobRoleGroup: 'Care providing roles',
    },
  ];

  async function setup(overrides: any = {}) {
    const establishment = establishmentBuilder() as Establishment;
    const routerSpy = jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true));
    const selectedTraining = {
      trainingCategory: {
        category: 'Activity provision, wellbeing',
        id: 1,
        seq: 0,
        trainingCategoryGroup: 'Care skills and knowledge',
      },
    };

    const setupTools = await render(SelectJobRolesMandatoryComponent, {
      imports: [HttpClientTestingModule, SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule],
      declarations: [GroupedRadioButtonAccordionComponent, RadioButtonAccordionComponent],
      providers: [
        BackLinkService,
        ErrorSummaryService,
        AlertService,
        WindowRef,
        FormBuilder,
        { provide: Router, useFactory: MockRouter.factory({ navigate: routerSpy }) },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        {
          provide: TrainingService,
          useValue: {
            selectedTraining: overrides.selectedTraining !== undefined ? overrides.selectedTraining : selectedTraining,
            resetState: () => {},
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                establishment,
                jobs: mockAvailableJobs,
              },
            },
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const resetStateInTrainingServiceSpy = spyOn(trainingService, 'resetState').and.callThrough();

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
      selectedTraining,
      createAndUpdateMandatoryTrainingSpy,
      establishment,
    };
  }

  it('should create', async () => {
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

    const heading = getByText('Select the job roles which need this training');

    expect(heading).toBeTruthy();
  });

  it('should navigate back to the select training category page if no training category set in training service', async () => {
    const { component, routerSpy } = await setup({ selectedTraining: null });

    expect(routerSpy).toHaveBeenCalledWith(['../select-training-category'], { relativeTo: component.route });
  });

  describe('Accordion', () => {
    it('should render an accordion for job role selection', async () => {
      const { getByTestId, getByText } = await setup();

      expect(getByTestId('selectJobRolesAccordion')).toBeTruthy();
      expect(getByText('Show all job roles')).toBeTruthy();
    });

    it('should render an accordion section for each job role group', async () => {
      const { getByText } = await setup();

      expect(getByText('Care providing roles')).toBeTruthy();
      expect(getByText('Professional and related roles')).toBeTruthy();
    });

    it('should render a checkbox for each job role', async () => {
      const { getByRole } = await setup();

      mockAvailableJobs.forEach((job) => {
        const checkbox = getByRole('checkbox', { name: job.title });
        expect(checkbox).toBeTruthy();
      });
    });
  });

  describe('On submit', () => {
    const selectJobRolesAndSave = (getByText, jobRoles = [mockAvailableJobs[0]]) => {
      userEvent.click(getByText('Show all job roles'));

      jobRoles.forEach((role) => userEvent.click(getByText(role.title)));

      userEvent.click(getByText('Save mandatory training'));
    };

    it('should navigate back to add-and-manage-mandatory-training main page', async () => {
      const { component, getByText, routerSpy } = await setup();

      selectJobRolesAndSave(getByText);

      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it("should display 'Mandatory training category added' banner", async () => {
      const { getByText, alertSpy } = await setup();

      selectJobRolesAndSave(getByText);

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training category added',
      });
    });

    it('should clear state in training service', async () => {
      const { getByText, resetStateInTrainingServiceSpy } = await setup();

      selectJobRolesAndSave(getByText);

      expect(resetStateInTrainingServiceSpy).toHaveBeenCalled();
    });

    [
      [mockAvailableJobs[0], mockAvailableJobs[1]],
      [mockAvailableJobs[2], mockAvailableJobs[3]],
    ].forEach((jobRoleSet) => {
      it(`should call createAndUpdateMandatoryTraining with training category in service and selected job roles ('${jobRoleSet[0].title}', '${jobRoleSet[1].title}')`, async () => {
        const { getByText, establishment, selectedTraining, createAndUpdateMandatoryTrainingSpy } = await setup();

        selectJobRolesAndSave(getByText, jobRoleSet);

        expect(createAndUpdateMandatoryTrainingSpy).toHaveBeenCalledWith(establishment.uid, {
          trainingCategoryId: selectedTraining.trainingCategory.id,
          allJobRoles: false,
          jobs: [{ id: jobRoleSet[0].id }, { id: jobRoleSet[1].id }],
        });
      });
    });
  });

  describe('Errors', () => {
    const expectedErrorMessage = 'Select the job roles that need this training';
    const errorSummaryBoxHeading = 'There is a problem';

    it('should display an error message on submit if no job roles are selected', async () => {
      const { fixture, getByRole, getByText, getByTestId } = await setup();

      userEvent.click(getByRole('button', { name: 'Save mandatory training' }));
      fixture.detectChanges();

      const accordion = getByTestId('selectJobRolesAccordion');
      expect(within(accordion).getByText(expectedErrorMessage)).toBeTruthy();

      const thereIsAProblemMessage = getByText(errorSummaryBoxHeading);

      const errorSummaryBox = thereIsAProblemMessage.parentElement;
      expect(within(errorSummaryBox).getByText(expectedErrorMessage)).toBeTruthy();
    });

    it('should expand the whole accordion on error', async () => {
      const { fixture, getByRole, getByText } = await setup();

      userEvent.click(getByRole('button', { name: 'Save mandatory training' }));
      fixture.detectChanges();

      expect(getByText('Hide all job roles')).toBeTruthy();
    });

    it('should continue to display error messages after empty submit and then user selects job roles', async () => {
      const { fixture, getByRole, getByText } = await setup();

      userEvent.click(getByRole('button', { name: 'Save mandatory training' }));
      fixture.detectChanges();

      const errorSummaryBox = getByText(errorSummaryBoxHeading).parentElement;

      expect(errorSummaryBox).toBeTruthy();
      expect(within(errorSummaryBox).getByText(expectedErrorMessage)).toBeTruthy();

      userEvent.click(getByText('Care worker'));
      userEvent.click(getByText('Registered nurse'));

      fixture.detectChanges();

      const errorSummaryBoxStillThere = getByText(errorSummaryBoxHeading).parentElement;

      expect(errorSummaryBoxStillThere).toBeTruthy();
      expect(within(errorSummaryBoxStillThere).getByText(expectedErrorMessage)).toBeTruthy();
    });
  });

  describe('On click of Cancel button', () => {
    it('should return to the add-and-manage-mandatory-training page', async () => {
      const { component, getByText, routerSpy } = await setup();

      const cancelButton = getByText('Cancel');
      userEvent.click(cancelButton);

      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it('should clear state in training service', async () => {
      const { getByText, resetStateInTrainingServiceSpy } = await setup();

      const cancelButton = getByText('Cancel');
      userEvent.click(cancelButton);

      expect(resetStateInTrainingServiceSpy).toHaveBeenCalled();
    });
  });
});
