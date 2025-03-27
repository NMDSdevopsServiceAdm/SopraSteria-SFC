import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Vacancy } from '@core/model/establishment.model';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { JobRoleType, SelectJobRolesToAddComponent } from './select-job-roles-to-add.component';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { MockUpdateWorkplaceAfterStaffChangesService } from '@core/test-utils/MockUpdateWorkplaceAfterStaffChangesService';

describe('SelectJobRolesToAddComponent', () => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = async (override: any = {}) => {
    const preselectedVacancies: Vacancy[] = override.preselectedVacancies ?? [];

    const setupTools = await render(SelectJobRolesToAddComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
              data: {
                jobs: mockAvailableJobs,
                jobRoleType: override.jobRoleType,
              },
            },
          },
        },
        {
          provide: UpdateWorkplaceAfterStaffChangesService,
          useFactory: MockUpdateWorkplaceAfterStaffChangesService.factory({ selectedVacancies: preselectedVacancies }),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const updateWorkplaceAfterStaffChangesService = injector.inject(
      UpdateWorkplaceAfterStaffChangesService,
    ) as UpdateWorkplaceAfterStaffChangesService;

    return {
      component,
      routerSpy,
      updateWorkplaceAfterStaffChangesService,
      ...setupTools,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  const jobRoleType = JobRoleType.Vacancies;
  describe('rendering', () => {
    it('should display a page heading', async () => {
      const { getByRole } = await setup({ jobRoleType });
      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual('Select job roles for the vacancies you want to add');
    });

    it('should display a text description', async () => {
      const { getByText } = await setup({ jobRoleType });

      const expectedText = 'You can review the number of vacancies for each role after you click Continue.';

      expect(getByText(expectedText)).toBeTruthy();
    });

    describe('accordion', () => {
      it('should render an accordion for job role selection', async () => {
        const { getByTestId, getByText } = await setup({ jobRoleType });

        expect(getByTestId('selectJobRolesAccordion')).toBeTruthy();
        expect(getByText('Show all job roles')).toBeTruthy();
      });

      it('should render an accordion section for each job role group', async () => {
        const { getByText } = await setup({ jobRoleType });

        expect(getByText('Care providing roles')).toBeTruthy();
        expect(getByText('Professional and related roles')).toBeTruthy();
      });

      it('should render a checkbox for each job role', async () => {
        const { getByRole } = await setup({ jobRoleType });

        mockAvailableJobs.forEach((job) => {
          const checkbox = getByRole('checkbox', { name: job.title });
          expect(checkbox).toBeTruthy();
        });
      });

      it('should render the checkbox as disabled if the job role is already selected before', async () => {
        const preselectedVacancies = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 3,
          },
        ];
        const { getByLabelText } = await setup({
          jobRoleType,
          preselectedVacancies,
        });

        const careWorkerCheckbox = getByLabelText('Care worker (role already added)') as HTMLInputElement;
        expect(careWorkerCheckbox.getAttributeNames()).toContain('disabled');
      });
    });

    it('should render a "Continue" CTA button and a cancel button', async () => {
      const { getByRole, getByText } = await setup({ jobRoleType });
      expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('form submit and validation', () => {
    const preselectedVacancies = [
      {
        jobId: 10,
        title: 'Care worker',
        total: 3,
      },
    ];

    describe('on Success', () => {
      it('should update the selected vacancies stored in service', async () => {
        const { getByText, updateWorkplaceAfterStaffChangesService } = await setup({
          jobRoleType,
          preselectedVacancies,
        });
        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Registered nurse'));
        userEvent.click(getByText('Social worker'));

        userEvent.click(getByText('Continue'));

        const expectedUpdatedVacancies = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 3,
          },
          {
            jobId: 23,
            title: 'Registered nurse',
            total: 1,
          },
          {
            jobId: 27,
            title: 'Social worker',
            total: 1,
          },
        ];

        expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual(expectedUpdatedVacancies);
      });

      it('should navigate to update staff vacancy page after submit', async () => {
        const { component, getByText, routerSpy } = await setup({ jobRoleType });
        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Registered nurse'));

        userEvent.click(getByText('Continue'));

        // @ts-expect-error: TS2445: Property 'route' is protected
        expect(routerSpy).toHaveBeenCalledWith(['../update-vacancies'], { relativeTo: component.route });
      });
    });

    it('should return to the update staff vacancy page when cancel button is clicked', async () => {
      const { component, getByText, routerSpy } = await setup({ jobRoleType });
      userEvent.click(getByText('Cancel'));

      // @ts-expect-error: TS2445: Property 'route' is protected
      expect(routerSpy).toHaveBeenCalledWith(['../update-vacancies'], { relativeTo: component.route });
    });

    describe('errors', () => {
      it('should display an error message on submit if no job roles are selected', async () => {
        const { fixture, getByRole, getByText, getByTestId } = await setup({ jobRoleType });

        userEvent.click(getByRole('button', { name: 'Continue' }));
        fixture.detectChanges();

        const expectedErrorMessage = 'Select job roles for the vacancies you want to add';

        const accordion = getByTestId('selectJobRolesAccordion');
        expect(within(accordion).getByText(expectedErrorMessage)).toBeTruthy();

        expect(getByText('There is a problem')).toBeTruthy();
        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(within(errorSummaryBox).getByText(expectedErrorMessage)).toBeTruthy();
      });

      it('should expand the whole accordion on error', async () => {
        const { fixture, getByRole, getByText } = await setup({ jobRoleType });
        userEvent.click(getByRole('button', { name: 'Continue' }));

        fixture.detectChanges();

        expect(getByText('Hide all job roles')).toBeTruthy();
      });

      it('should continue to display error messages after empty submit and user selects job roles', async () => {
        const { fixture, getByRole, getByText } = await setup({ jobRoleType });
        userEvent.click(getByRole('button', { name: 'Continue' }));
        fixture.detectChanges();

        const errorSummaryBoxHeading = 'There is a problem';
        const expectedErrorMessage = 'Select job roles for the vacancies you want to add';

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
  });
});
