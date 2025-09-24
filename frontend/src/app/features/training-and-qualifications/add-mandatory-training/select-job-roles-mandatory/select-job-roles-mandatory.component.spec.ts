import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { MandatoryTrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockRouter } from '@core/test-utils/MockRouter';
import { MockMandatoryTrainingService } from '@core/test-utils/MockTrainingService';
import { GroupedRadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/grouped-radio-button-accordion/grouped-radio-button-accordion.component';
import { RadioButtonAccordionComponent } from '@shared/components/accordions/radio-button-accordion/radio-button-accordion.component';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { throwError } from 'rxjs';

import { AddMandatoryTrainingModule } from '../add-mandatory-training.module';
import { SelectJobRolesMandatoryComponent } from './select-job-roles-mandatory.component';
import { MockJobRoles } from '@core/test-utils/MockJobService';

describe('SelectJobRolesMandatoryComponent', () => {
  const mockAvailableJobs = MockJobRoles;

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
      imports: [SharedModule, RouterModule, AddMandatoryTrainingModule],
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
          provide: MandatoryTrainingService,
          useFactory: MockMandatoryTrainingService.factory({ selectedTraining, ...overrides }),
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
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();

    const alertService = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();

    const trainingService = injector.inject(MandatoryTrainingService) as MandatoryTrainingService;
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

    const heading = getByText('Select the job roles that need this training');

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
    const selectJobRolesAndSave = (fixture, getByText, jobRoles = [mockAvailableJobs[0]]) => {
      userEvent.click(getByText('Show all job roles'));

      jobRoles.forEach((role) => userEvent.click(getByText(role.title)));
      fixture.detectChanges();

      userEvent.click(getByText('Save mandatory training'));
      fixture.detectChanges();
    };

    it('should navigate back to add-and-manage-mandatory-training main page', async () => {
      const { fixture, component, getByText, routerSpy } = await setup();

      selectJobRolesAndSave(fixture, getByText);

      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it("should display 'Mandatory training category added' banner", async () => {
      const { fixture, getByText, alertSpy } = await setup();

      selectJobRolesAndSave(fixture, getByText);
      await fixture.whenStable();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training category added',
      });
    });

    it('should clear state in training service', async () => {
      const { fixture, getByText, resetStateInTrainingServiceSpy } = await setup();

      selectJobRolesAndSave(fixture, getByText);

      expect(resetStateInTrainingServiceSpy).toHaveBeenCalled();
    });

    [
      [mockAvailableJobs[0], mockAvailableJobs[1]],
      [mockAvailableJobs[2], mockAvailableJobs[3]],
    ].forEach((jobRoleSet) => {
      it(`should call createAndUpdateMandatoryTraining with training category in service and selected job roles ('${jobRoleSet[0].title}', '${jobRoleSet[1].title}')`, async () => {
        const { fixture, getByText, establishment, selectedTraining, createAndUpdateMandatoryTrainingSpy } =
          await setup();

        selectJobRolesAndSave(fixture, getByText, jobRoleSet);

        expect(createAndUpdateMandatoryTrainingSpy).toHaveBeenCalledWith(establishment.uid, {
          trainingCategoryId: selectedTraining.trainingCategory.id,
          allJobRoles: false,
          jobs: [{ id: jobRoleSet[0].id }, { id: jobRoleSet[1].id }],
        });
      });
    });

    it('should display server error message if call to backend fails', async () => {
      const { fixture, getByText, createAndUpdateMandatoryTrainingSpy } = await setup();

      createAndUpdateMandatoryTrainingSpy.and.returnValue(throwError(() => new Error('Unexpected error')));

      selectJobRolesAndSave(fixture, getByText);

      const expectedErrorMessage = 'There has been a problem saving your mandatory training. Please try again.';

      expect(getByText(expectedErrorMessage)).toBeTruthy();
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

  describe('Existing mandatory training being edited', () => {
    const createMandatoryTrainingBeingEdited = (jobs) => {
      return {
        category: 'Activity provision/Well-being',
        establishmentId: 4090,
        jobs,
        trainingCategoryId: 1,
      };
    };

    it('should check the currently selected job roles if mandatoryTrainingBeingEdited in training service (when editing existing mandatory training)', async () => {
      const jobs = [mockAvailableJobs[0], mockAvailableJobs[1]];

      const { getByLabelText } = await setup({
        mandatoryTrainingBeingEdited: createMandatoryTrainingBeingEdited(jobs),
        allJobRolesCount: 37,
      });

      jobs.forEach((jobRole) => {
        const jobRoleCheckbox = getByLabelText(jobRole.title) as HTMLInputElement;
        expect(jobRoleCheckbox.checked).toBeTruthy();
      });
    });

    it('should not check the currently selected job roles if mandatoryTrainingBeingEdited has all job roles (when editing existing mandatory training)', async () => {
      const jobs = [mockAvailableJobs[0], mockAvailableJobs[1]];

      const { getByLabelText } = await setup({
        mandatoryTrainingBeingEdited: createMandatoryTrainingBeingEdited(jobs),
        allJobRolesCount: 2,
      });

      jobs.forEach((jobRole) => {
        const jobRoleCheckbox = getByLabelText(jobRole.title) as HTMLInputElement;
        expect(jobRoleCheckbox.checked).toBeFalsy();
      });
    });

    it('should expand the accordion for job groups that have job roles selected', async () => {
      const jobs = [mockAvailableJobs[0], mockAvailableJobs[1]];

      const { getByLabelText } = await setup({
        mandatoryTrainingBeingEdited: createMandatoryTrainingBeingEdited(jobs),
      });

      jobs.forEach((jobRole) => {
        const jobRoleGroupAccordionSection = getByLabelText(jobRole.jobRoleGroup);
        expect(within(jobRoleGroupAccordionSection).getByText('Hide')).toBeTruthy(); // is expanded
      });
    });

    it('should not expand the accordion for job groups that do not have job roles selected', async () => {
      const jobs = [mockAvailableJobs[0]];

      const { getByLabelText } = await setup({
        mandatoryTrainingBeingEdited: createMandatoryTrainingBeingEdited(jobs),
      });

      const jobRoleGroupAccordionSectionWithPreselected = getByLabelText(jobs[0].jobRoleGroup);
      expect(within(jobRoleGroupAccordionSectionWithPreselected).getByText('Hide')).toBeTruthy(); // is expanded

      const jobRoleGroupAccordionSectionWithNoneSelected = getByLabelText(mockAvailableJobs[1].jobRoleGroup);
      expect(within(jobRoleGroupAccordionSectionWithNoneSelected).getByText('Show')).toBeTruthy(); // not expanded
    });

    it('should call createAndUpdateMandatoryTraining with training category in service and previous training ID', async () => {
      const jobs = [mockAvailableJobs[0], mockAvailableJobs[1]];
      const mandatoryTrainingBeingEdited = createMandatoryTrainingBeingEdited(jobs);

      const { getByText, establishment, selectedTraining, createAndUpdateMandatoryTrainingSpy } = await setup({
        mandatoryTrainingBeingEdited,
      });

      userEvent.click(getByText('Save mandatory training'));

      expect(createAndUpdateMandatoryTrainingSpy).toHaveBeenCalledWith(establishment.uid, {
        previousTrainingCategoryId: mandatoryTrainingBeingEdited.trainingCategoryId,
        trainingCategoryId: selectedTraining.trainingCategory.id,
        allJobRoles: false,
        jobs: [{ id: jobs[0].id }, { id: jobs[1].id }],
      });
    });

    it("should display 'Mandatory training category updated' banner on submit", async () => {
      const jobs = [mockAvailableJobs[0], mockAvailableJobs[1]];
      const mandatoryTrainingBeingEdited = createMandatoryTrainingBeingEdited(jobs);

      const { fixture, getByText, alertSpy } = await setup({
        mandatoryTrainingBeingEdited,
      });

      userEvent.click(getByText('Save mandatory training'));
      await fixture.whenStable();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Mandatory training category updated',
      });
    });
  });
});