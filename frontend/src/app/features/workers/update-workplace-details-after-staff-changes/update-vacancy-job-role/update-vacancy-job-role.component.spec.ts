import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Vacancy } from '@core/model/establishment.model';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { UpdateVacancyJobRoleComponent } from './update-vacancy-job-role.component';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { MockUpdateWorkplaceAfterStaffChangesService } from '@core/test-utils/MockUpdateWorkplaceAfterStaffChangesService';

fdescribe('UpdateVacancyJobRoleComponent', () => {
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
    const returnToUrl = override.returnToUrl ? override.returnToUrl : null;
    const preselectedVacancies: Vacancy[] = override.preselectedVacancies ?? [];
    const availableJobs = override.availableJobs ?? mockAvailableJobs;

    const setupTools = await render(UpdateVacancyJobRoleComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {},
              data: {
                jobs: availableJobs,
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

  describe('rendering', () => {
    it('should display a page heading', async () => {
      const { getByRole } = await setup();
      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual('Select job roles for the vacancies you want to add');
    });

    it('should display a text description', async () => {
      const { getByText } = await setup();

      const expectedText = 'You can review the number of vacancies for each role after you click Continue.';

      expect(getByText(expectedText)).toBeTruthy();
    });

    describe('accordion', () => {
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

      it('should render the checkbox as disabled if the job role is already selected before', async () => {
        const preselectedVacancies = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 3,
          },
        ];
        const { getByLabelText } = await setup({
          preselectedVacancies,
        });

        const careWorkerCheckbox = getByLabelText('Care worker (role already added)') as HTMLInputElement;
        expect(careWorkerCheckbox.getAttributeNames()).toContain('disabled');
      });
    });

    it('should render a "Continue" CTA button and a cancel button', async () => {
      const { getByRole, getByText } = await setup();
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
      it('should update the selected vacancies in service', async () => {
        const { component, getByRole, getByText, updateWorkplaceAfterStaffChangesService } = await setup({
          preselectedVacancies,
        });
        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Registered nurse'));
        userEvent.click(getByText('Social worker'));

        userEvent.click(getByText('Continue'));

        const expectedUpdatedVacancies = [
          ...preselectedVacancies,
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
    });
  });
  //     it('should store the user input data in localStorage', async () => {
  //       const { component, getByText, getByRole, setLocalStorageSpy } = await setup();

  //       userEvent.click(getByText('Show all job roles'));
  //       userEvent.click(getByText('Care worker'));
  //       userEvent.click(getByText('Registered nurse'));
  //       userEvent.click(getByText('Other (directly involved in providing care)'));

  //       userEvent.click(getByText('Save and continue'));

  //       const expectedData = {
  //         establishmentUid: component.establishment.uid,
  //         vacancies: [
  //           {
  //             jobId: 10,
  //             title: 'Care worker',
  //             total: null,
  //           },
  //           {
  //             jobId: 23,
  //             title: 'Registered nurse',
  //             total: null,
  //           },
  //           {
  //             jobId: 20,
  //             title: 'Other (directly involved in providing care)',
  //             total: null,
  //           },
  //         ],
  //       };

  //       expect(setLocalStorageSpy).toHaveBeenCalledWith('vacanciesJobRoles', JSON.stringify(expectedData));
  //     });

  //     it('should keep the vacancies numbers that was loaded from database', async () => {
  //       const mockVacanciesFromDatabase: Vacancy[] = [
  //         {
  //           jobId: 10,
  //           title: 'Care worker',
  //           total: 3,
  //         },
  //         {
  //           jobId: 23,
  //           title: 'Registered nurse',
  //           total: 2,
  //         },
  //       ];

  //       const { component, getByText, setLocalStorageSpy } = await setup({
  //         vacanciesFromDatabase: mockVacanciesFromDatabase,
  //       });

  //       userEvent.click(getByText('Show all job roles'));
  //       userEvent.click(getByText('Registered nurse')); // untick this job
  //       userEvent.click(getByText('Social worker')); // add this job
  //       userEvent.click(getByText('Save and continue'));

  //       const expectedData = {
  //         establishmentUid: component.establishment.uid,
  //         vacancies: [
  //           {
  //             jobId: 10,
  //             title: 'Care worker',
  //             total: 3, // should keep this number for next page
  //           },
  //           {
  //             jobId: 27,
  //             title: 'Social worker',
  //             total: null,
  //           },
  //         ],
  //       };

  //       expect(setLocalStorageSpy).toHaveBeenCalledWith('vacanciesJobRoles', JSON.stringify(expectedData));
  //     });

  //     it('should navigate to the vacancies number input page after submit', async () => {
  //       const { component, getByText, routerSpy } = await setup();

  //       userEvent.click(getByText('Show all job roles'));
  //       userEvent.click(getByText('Registered nurse'));
  //       userEvent.click(getByText('Save and continue'));

  //       expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'how-many-vacancies']);
  //     });
  //   });

  //   describe('errors', () => {
  //     it('should display an error message on submit if no job roles are selected', async () => {
  //       const { fixture, getByRole, getByText, getByTestId, setLocalStorageSpy } = await setup();

  //       userEvent.click(getByRole('button', { name: 'Save and continue' }));
  //       fixture.detectChanges();

  //       const expectedErrorMessage = 'Select job roles for all your current staff vacancies';

  //       const accordion = getByTestId('selectJobRolesAccordion');
  //       expect(within(accordion).getByText(expectedErrorMessage)).toBeTruthy();

  //       expect(getByText('There is a problem')).toBeTruthy();
  //       const errorSummaryBox = getByText('There is a problem').parentElement;
  //       expect(within(errorSummaryBox).getByText(expectedErrorMessage)).toBeTruthy();

  //       expect(setLocalStorageSpy).not.toHaveBeenCalled();
  //     });

  //     it('should expand the whole accordion on error', async () => {
  //       const { fixture, getByRole, getByText } = await setup();
  //       userEvent.click(getByRole('button', { name: 'Save and continue' }));

  //       fixture.detectChanges();

  //       expect(getByText('Hide all job roles')).toBeTruthy();
  //     });

  //     it('should continue to display error messages after empty submit and then user selects job roles', async () => {
  //       const { fixture, getByRole, getByText } = await setup();
  //       userEvent.click(getByRole('button', { name: 'Save and continue' }));
  //       fixture.detectChanges();

  //       const errorSummaryBoxHeading = 'There is a problem';
  //       const expectedErrorMessage = 'Select job roles for all your current staff vacancies';

  //       const errorSummaryBox = getByText(errorSummaryBoxHeading).parentElement;

  //       expect(errorSummaryBox).toBeTruthy();
  //       expect(within(errorSummaryBox).getByText(expectedErrorMessage)).toBeTruthy();

  //       userEvent.click(getByText('Care worker'));
  //       userEvent.click(getByText('Registered nurse'));

  //       fixture.detectChanges();

  //       const errorSummaryBoxStillThere = getByText(errorSummaryBoxHeading).parentElement;

  //       expect(errorSummaryBoxStillThere).toBeTruthy();
  //       expect(within(errorSummaryBoxStillThere).getByText(expectedErrorMessage)).toBeTruthy();
  //     });
  //   });
  // });

  // describe('navigation', () => {
  //   it('should return to the workplace summary page when cancel button is clicked', async () => {
  //     const { getByText, routerSpy } = await setup({ returnToUrl: true });
  //     const cancelButton = getByText('Cancel');

  //     userEvent.click(cancelButton);
  //     expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
  //   });

  //   it('should return to the wdf workplace summary page when visited from wdf and cancel button is clicked', async () => {
  //     const { component, getByText, routerSpy } = await setup({ returnToUrl: true });
  //     component.return = { url: ['/wdf', 'workplaces', 'mock-uid'] };

  //     const cancelButton = getByText('Cancel');

  //     userEvent.click(cancelButton);
  //     expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'workplaces', 'mock-uid'], jasmine.anything());
  //   });

  //   it('should set the backlink to "do you have vacancy" page', async () => {
  //     const { component } = await setup();
  //     expect(component.back).toEqual({
  //       url: ['/workplace', component.establishment.uid, 'do-you-have-vacancies'],
  //     });
  //   });

  //   it('should set the backlink to "do you have vacancy" when not in the flow', async () => {
  //     const { component } = await setup({ returnToUrl: true });
  //     expect(component.back).toEqual({
  //       url: ['/workplace', component.establishment.uid, 'do-you-have-vacancies'],
  //     });
  //   });
  // });
});
