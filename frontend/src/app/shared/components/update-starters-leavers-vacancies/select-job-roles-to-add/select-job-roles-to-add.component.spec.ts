import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Starter, Vacancy } from '@core/model/establishment.model';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { MockJobRoles } from '@core/test-utils/MockJobService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { JobRoleType, SelectJobRolesToAddComponent } from './select-job-roles-to-add.component';

describe('SelectJobRolesToAddComponent', () => {
  const mockAvailableJobs = MockJobRoles;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = async (override: any = {}) => {
    const selectedVacancies: Vacancy[] = override.preselectedVacancies ?? [];
    const selectedStarters: Starter[] = override.preselectedStarters ?? [];

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
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory({ selectedVacancies, selectedStarters }),
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const vacanciesAndTurnoverService = injector.inject(VacanciesAndTurnoverService) as VacanciesAndTurnoverService;

    return {
      component,
      routerSpy,
      vacanciesAndTurnoverService,
      ...setupTools,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  const pageStates = [
    {
      jobRoleType: JobRoleType.Vacancies,
      preselectedField: 'preselectedVacancies',
      selectedField: 'selectedVacancies',
    },
    {
      jobRoleType: JobRoleType.Starters,
      preselectedField: 'preselectedStarters',
      selectedField: 'selectedStarters',
    },
  ];

  pageStates.forEach(({ jobRoleType, selectedField, preselectedField }) => {
    describe(`${jobRoleType} version of page`, () => {
      describe('rendering', () => {
        it('should display a page heading', async () => {
          const { getByRole } = await setup({ jobRoleType });
          const heading = getByRole('heading', { level: 1 });

          expect(heading.textContent).toEqual(`Select job roles for the ${jobRoleType} you want to add`);
        });

        it('should display a text description', async () => {
          const { getByText } = await setup({ jobRoleType });

          const expectedText = `You can review the number of ${jobRoleType} for each role after you click Continue.`;

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
            const preselected = [
              {
                jobId: 10,
                title: 'Care worker',
                total: 3,
              },
            ];
            const { getByLabelText } = await setup({
              jobRoleType,
              [preselectedField]: preselected,
            });

            const careWorkerCheckbox = getByLabelText('Care worker (role already added)') as HTMLInputElement;
            expect(careWorkerCheckbox.getAttributeNames()).toContain('disabled');
          });

          it('should expand the accordion for job groups that have job roles selected before', async () => {
            const preselected = [
              {
                jobId: 10,
                title: 'Care worker',
                total: 3,
              },
            ];

            const { getByLabelText } = await setup({
              jobRoleType,
              [preselectedField]: preselected,
            });

            const accordionSection = getByLabelText('Care providing roles');
            expect(within(accordionSection).getByText('Hide')).toBeTruthy(); // is expanded
          });
        });

        it('should render a "Continue" CTA button and a cancel button', async () => {
          const { getByRole, getByText } = await setup({ jobRoleType });
          expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
          expect(getByText('Cancel')).toBeTruthy();
        });
      });

      describe('form submit', () => {
        const preselected = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 3,
          },
        ];

        describe('on Success', () => {
          it(`should update the selected ${jobRoleType} stored in service`, async () => {
            const { getByText, vacanciesAndTurnoverService } = await setup({
              jobRoleType,
              [preselectedField]: preselected,
            });
            userEvent.click(getByText('Show all job roles'));
            userEvent.click(getByText('Registered nurse'));
            userEvent.click(getByText('Social worker'));

            userEvent.click(getByText('Continue'));

            const expectedUpdatedField = [
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

            expect(vacanciesAndTurnoverService[selectedField]).toEqual(expectedUpdatedField);
          });

          it(`should navigate to update ${jobRoleType} page after submit`, async () => {
            const { component, getByText, routerSpy } = await setup({ jobRoleType });
            userEvent.click(getByText('Show all job roles'));
            userEvent.click(getByText('Registered nurse'));

            userEvent.click(getByText('Continue'));

            // @ts-expect-error: TS2445: Property 'route' is protected
            expect(routerSpy).toHaveBeenCalledWith([`../update-${jobRoleType}`], { relativeTo: component.route });
          });
        });

        it('should allow user to click continue and return to previous page even if no job role were selected', async () => {
          const { component, getByText, routerSpy } = await setup({ jobRoleType });

          userEvent.click(getByText('Continue'));

          // @ts-expect-error: TS2445: Property 'route' is protected
          expect(routerSpy).toHaveBeenCalledWith([`../update-${jobRoleType}`], { relativeTo: component.route });
        });

        it(`should return to the update ${jobRoleType} page when cancel button is clicked`, async () => {
          const { component, getByText, routerSpy } = await setup({ jobRoleType });
          userEvent.click(getByText('Cancel'));

          // @ts-expect-error: TS2445: Property 'route' is protected
          expect(routerSpy).toHaveBeenCalledWith([`../update-${jobRoleType}`], { relativeTo: component.route });
        });
      });
    });
  });
});
