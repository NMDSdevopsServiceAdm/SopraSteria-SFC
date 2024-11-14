import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { VacanciesJobRolesSelectionComponent } from './vacancies-job-roles-selection.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { HttpClient } from '@angular/common/http';
import userEvent from '@testing-library/user-event';
import { Vacancy } from '@core/model/establishment.model';

fdescribe('VacanciesJobRolesSelectionComponent', () => {
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

  const setup = async (override: any = {}) => {
    const returnToUrl = 'returnToUrl' in override ? override.returnToUrl : null;
    const vacanciesFromDatabase = override.vacanciesFromDatabase;
    const availableJobs = override.availableJobs ?? mockAvailableJobs;

    const renderResults = await render(VacanciesJobRolesSelectionComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, returnToUrl, {
            vacancies: vacanciesFromDatabase,
          }),
          deps: [HttpClient],
        },
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
      ],
    });

    const component = renderResults.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      routerSpy,
      ...renderResults,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display a heading and a section heading', async () => {
      const { getByRole } = await setup();
      const heading = getByRole('heading', { level: 1 });
      const sectionHeading = heading.previousSibling;

      expect(heading.textContent).toEqual('Select job roles for all your current staff vacancies');
      expect(sectionHeading.textContent).toEqual('Vacancies and turnover');
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

      it('should render a text input when "Care providing roles - Other" is ticked', async () => {
        const { fixture, getByRole, getByLabelText } = await setup();

        userEvent.click(getByLabelText('Care providing roles'));
        userEvent.click(getByRole('checkbox', { name: 'Other (directly involved in providing care)' }));

        fixture.detectChanges();

        expect(getByRole('textbox', { name: 'Job role (optional)' })).toBeTruthy();
      });
    });

    describe('buttons', () => {
      it('should render a "Save and continue" CTA button when in the flow', async () => {
        const { getByRole } = await setup();
        expect(getByRole('button', { name: 'Save and continue' })).toBeTruthy();
      });

      it('should render a "Continue" CTA button when not in the flow', async () => {
        const { getByRole } = await setup({ returnToUrl: '/dashboard#workplace' });
        expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
      });

      it('should not render a "Skip this question" button', async () => {
        const { queryByText } = await setup();
        expect(queryByText('Skip this question')).toBeFalsy();
      });
    });

    describe('progress bar', () => {
      it('should render a progress bar when in the flow', async () => {
        const { getByTestId } = await setup();

        expect(getByTestId('progress-bar')).toBeTruthy();
      });

      it('should not render a progress bar when not in the flow', async () => {
        const { getByTestId, queryByTestId } = await setup({ returnToUrl: '/dashboard#workplace' });

        expect(getByTestId('section-heading')).toBeTruthy();
        expect(queryByTestId('progress-bar')).toBeFalsy();
      });
    });

    describe('prefill', () => {
      it('should tick the checkboxes according to previously saved vacancies for the workplace', async () => {
        const mockVacancies: Vacancy[] = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 2,
          },
          {
            jobId: 23,
            title: 'Registered nurse',
            total: 2,
          },
        ];
        const { getAllByRole } = await setup({ vacanciesFromDatabase: mockVacancies });

        const tickedCheckboxes = getAllByRole('checkbox', { checked: true }) as HTMLInputElement[];
        expect(tickedCheckboxes.length).toEqual(2);
        expect(tickedCheckboxes.map((el) => el.name)).toEqual(['Care worker', 'Registered nurse']);
      });

      it('should expand the accordion for job groups that have prefilled vacancies', async () => {
        const mockVacancies: Vacancy[] = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 2,
          },
        ];
        const { getByLabelText } = await setup({ vacanciesFromDatabase: mockVacancies });

        const sectionForCareProvidingRoles = getByLabelText('Care providing roles');
        const accordionForJobGroup2 = getByLabelText('Professional and related roles');

        expect(within(sectionForCareProvidingRoles).getByText('Hide')).toBeTruthy(); // is expanded
        expect(within(accordionForJobGroup2).getByText('Show')).toBeTruthy(); // not expanded
      });

      it('should prefill the optional job role name for "Care providing role - Other" if given', async () => {
        const mockVacancies: Vacancy[] = [
          {
            jobId: 20,
            title: 'Other (directly involved in providing care)',
            total: 2,
            other: 'Some really special job role name',
          },
        ];

        const { getByRole } = await setup({ vacanciesFromDatabase: mockVacancies });

        const inputBox = getByRole('textbox', { name: 'Job role (optional)' }) as HTMLInputElement;
        expect(inputBox).toBeTruthy();
        expect(inputBox.value).toEqual('Some really special job role name');
      });
    });
  });

  describe('form submit and validation', () => {
    describe('on Success', () => {
      it('should store the user input data in localStorage', async () => {
        const { component, getByText, getByRole } = await setup();
        const localStorageSpy = spyOn(localStorage, 'setItem');

        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Care worker'));
        userEvent.click(getByText('Registered nurse'));
        userEvent.click(getByText('Other (directly involved in providing care)'));

        const otherJobRoleInput = getByRole('textbox', { name: 'Job role (optional)' });
        userEvent.type(otherJobRoleInput, 'example job role name');

        userEvent.click(getByText('Save and continue'));

        const expectedData = {
          establishmentUid: component.establishment.uid,
          vacancies: [
            {
              jobId: 10,
              title: 'Care worker',
              total: null,
            },
            {
              jobId: 23,
              title: 'Registered nurse',
              total: null,
            },
            {
              jobId: 20,
              title: 'Other (directly involved in providing care)',
              total: null,
              other: 'example job role name',
            },
          ],
        };

        expect(localStorageSpy).toHaveBeenCalledWith('updated-vacancies', JSON.stringify(expectedData));
      });

      it('should keep any previously input vacancies numbers', async () => {
        const mockVacanciesFromDatabase: Vacancy[] = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 3,
          },
          {
            jobId: 23,
            title: 'Registered nurse',
            total: 2,
          },
        ];

        const { component, getByText } = await setup({ vacanciesFromDatabase: mockVacanciesFromDatabase });
        const localStorageSpy = spyOn(localStorage, 'setItem');

        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Registered nurse')); // untick this job
        userEvent.click(getByText('Social worker')); // add this job
        userEvent.click(getByText('Save and continue'));

        const expectedData = {
          establishmentUid: component.establishment.uid,
          vacancies: [
            {
              jobId: 10,
              title: 'Care worker',
              total: 3, // should keep this number for next page
            },
            {
              jobId: 27,
              title: 'Social worker',
              total: null,
            },
          ],
        };

        expect(localStorageSpy).toHaveBeenCalledWith('updated-vacancies', JSON.stringify(expectedData));
      });

      it('should navigate to the number input page', async () => {
        const { component, getByText, routerSpy } = await setup();

        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Registered nurse'));
        userEvent.click(getByText('Save and continue'));

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'vacancies-number']);
      });
    });

    describe('errors', () => {
      it('should display an error message on submit if no job roles are selected', async () => {
        const { fixture, getByRole, getByText, getByTestId } = await setup();
        const localStorageSpy = spyOn(localStorage, 'setItem');

        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        const expectedErrorMessage = 'Select job roles for all your current staff vacancies';

        const accordion = getByTestId('selectJobRolesAccordion');
        expect(within(accordion).getByText(expectedErrorMessage)).toBeTruthy();

        expect(getByText('There is a problem')).toBeTruthy();
        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(within(errorSummaryBox).getByText(expectedErrorMessage)).toBeTruthy();

        expect(localStorageSpy).not.toHaveBeenCalled();
      });

      it('should expand the whole accordion on error', async () => {
        const { fixture, getByRole, getByText } = await setup();
        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        fixture.detectChanges();

        expect(getByText('Hide all job roles')).toBeTruthy();
      });
    });
  });
});
