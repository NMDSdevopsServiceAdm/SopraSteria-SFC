import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { BackLinkService } from '@core/services/backLink.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { TrainingService } from '@core/services/training.service';
import { WindowRef } from '@core/services/window.ref';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockTrainingService } from '@core/test-utils/MockTrainingService';
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

  async function setup() {
    const establishment = establishmentBuilder() as Establishment;

    const setupTools = await render(SelectJobRolesMandatoryComponent, {
      imports: [HttpClientTestingModule, SharedModule, RouterModule, RouterTestingModule, AddMandatoryTrainingModule],
      declarations: [GroupedRadioButtonAccordionComponent, RadioButtonAccordionComponent],
      providers: [
        BackLinkService,
        ErrorSummaryService,
        WindowRef,
        FormBuilder,
        {
          provide: TrainingService,
          useClass: MockTrainingService,
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

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const trainingService = injector.inject(TrainingService) as TrainingService;
    const resetStateInTrainingServiceSpy = spyOn(trainingService, 'resetState').and.callThrough();

    return {
      ...setupTools,
      component,
      routerSpy,
      resetStateInTrainingServiceSpy,
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
