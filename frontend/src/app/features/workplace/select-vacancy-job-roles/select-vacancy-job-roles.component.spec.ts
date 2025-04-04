import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Vacancy } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { SelectVacancyJobRolesComponent } from './select-vacancy-job-roles.component';

describe('SelectVacancyJobRolesComponent', () => {
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
    const returnToUrl = override.returnToUrl ? override.returnToUrl : null;
    const vacanciesFromDatabase = override.vacanciesFromDatabase ?? null;
    const availableJobs = override.availableJobs ?? mockAvailableJobs;
    const localStorageData = override.localStorageData ?? null;

    const setLocalStorageSpy = spyOn(localStorage, 'setItem');
    const getLocalStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(localStorageData);

    const renderResults = await render(SelectVacancyJobRolesComponent, {
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
      setLocalStorageSpy,
      getLocalStorageSpy,
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
    });

    describe('buttons', () => {
      it('should render a "Save and continue" CTA button when in the flow', async () => {
        const { getByRole } = await setup();
        expect(getByRole('button', { name: 'Save and continue' })).toBeTruthy();
      });

      it('should render a "Continue" CTA button when not in the flow', async () => {
        const { getByRole } = await setup({ returnToUrl: true });
        expect(getByRole('button', { name: 'Continue' })).toBeTruthy();
      });

      it('should not render a "Skip this question" button', async () => {
        const { queryByText } = await setup();
        expect(queryByText('Skip this question')).toBeFalsy();
      });

      it('should render a "Cancel" button when not in flow', async () => {
        const { getByText } = await setup({ returnToUrl: true });
        expect(getByText('Cancel')).toBeTruthy();
      });

      it('should not render a "Cancel" button when in flow', async () => {
        const { queryByText } = await setup();
        expect(queryByText('Cancel')).toBeFalsy();
      });
    });

    describe('progress bar', () => {
      it('should render a progress bar when in the flow', async () => {
        const { getByTestId } = await setup();

        expect(getByTestId('progress-bar')).toBeTruthy();
      });

      it('should not render a progress bar when not in the flow', async () => {
        const { getByTestId, queryByTestId } = await setup({ returnToUrl: true });

        expect(getByTestId('section-heading')).toBeTruthy();
        expect(queryByTestId('progress-bar')).toBeFalsy();
      });
    });

    describe('Setting and clearing data from local storage', () => {
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

      it('should tick the checkboxes according to previously saved vacancies for the workplace', async () => {
        const { getAllByRole } = await setup({ vacanciesFromDatabase: mockVacancies });

        const tickedCheckboxes = getAllByRole('checkbox', { checked: true }) as HTMLInputElement[];
        expect(tickedCheckboxes.length).toEqual(2);
        expect(tickedCheckboxes.map((el) => el.name)).toEqual(['Care worker', 'Registered nurse']);
      });

      it('should expand the accordion for job groups that have prefilled vacancies', async () => {
        const careWorkerOnly: Vacancy[] = [
          {
            jobId: 10,
            title: 'Care worker',
            total: 2,
          },
        ];
        const { getByLabelText } = await setup({ vacanciesFromDatabase: careWorkerOnly });

        const careProvidingRolesAccordion = getByLabelText('Care providing roles');
        const professionalRolesAccordion = getByLabelText('Professional and related roles');

        expect(within(careProvidingRolesAccordion).getByText('Hide')).toBeTruthy(); // is expanded
        expect(within(professionalRolesAccordion).getByText('Show')).toBeTruthy(); // not expanded
      });

      it('should prefill from the data in localStorage if editing the same workplace', async () => {
        const mockLocalStorageData = { establishmentUid: 'mocked-uid', vacancies: mockVacancies };
        const { getAllByRole } = await setup({ localStorageData: JSON.stringify(mockLocalStorageData) });

        const tickedCheckboxes = getAllByRole('checkbox', { checked: true }) as HTMLInputElement[];
        expect(tickedCheckboxes.length).toEqual(2);
        expect(tickedCheckboxes.map((el) => el.name)).toEqual(['Care worker', 'Registered nurse']);
      });

      it('should not prefill from the data in localStorage if editing a different workplace', async () => {
        const mockLocalStorageData = { establishmentUid: 'other-workplace-uid', vacancies: mockVacancies };
        const { queryAllByRole } = await setup({ localStorageData: JSON.stringify(mockLocalStorageData) });

        const tickedCheckboxes = queryAllByRole('checkbox', { checked: true }) as HTMLInputElement[];
        expect(tickedCheckboxes.length).toEqual(0);
      });

      it('should clear data in local storage when user clicks "Cancel" button', async () => {
        const { getByText } = await setup({ returnToUrl: true });

        const localStorageRemoveItemSpy = spyOn(localStorage, 'removeItem');
        const cancelButton = getByText('Cancel');

        userEvent.click(cancelButton);

        expect(localStorageRemoveItemSpy).toHaveBeenCalledTimes(2);
        expect(localStorageRemoveItemSpy.calls.all()[0].args).toEqual(['hasVacancies']);
        expect(localStorageRemoveItemSpy.calls.all()[1].args).toEqual(['vacanciesJobRoles']);
      });
    });
  });

  describe('form submit and validation', () => {
    describe('on Success', () => {
      it('should store the user input data in localStorage', async () => {
        const { component, getByText, getByRole, setLocalStorageSpy } = await setup();

        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Care worker'));
        userEvent.click(getByText('Registered nurse'));
        userEvent.click(getByText('Other (directly involved in providing care)'));

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
            },
          ],
        };

        expect(setLocalStorageSpy).toHaveBeenCalledWith('vacanciesJobRoles', JSON.stringify(expectedData));
      });

      it('should keep the vacancies numbers that was loaded from database', async () => {
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

        const { component, getByText, setLocalStorageSpy } = await setup({
          vacanciesFromDatabase: mockVacanciesFromDatabase,
        });

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

        expect(setLocalStorageSpy).toHaveBeenCalledWith('vacanciesJobRoles', JSON.stringify(expectedData));
      });

      it('should navigate to the vacancies number input page after submit', async () => {
        const { component, getByText, routerSpy } = await setup();

        userEvent.click(getByText('Show all job roles'));
        userEvent.click(getByText('Registered nurse'));
        userEvent.click(getByText('Save and continue'));

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'how-many-vacancies']);
      });
    });

    describe('errors', () => {
      it('should display an error message on submit if no job roles are selected', async () => {
        const { fixture, getByRole, getByText, getByTestId, setLocalStorageSpy } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        const expectedErrorMessage = 'Select job roles for all your current staff vacancies';

        const accordion = getByTestId('selectJobRolesAccordion');
        expect(within(accordion).getByText(expectedErrorMessage)).toBeTruthy();

        expect(getByText('There is a problem')).toBeTruthy();
        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(within(errorSummaryBox).getByText(expectedErrorMessage)).toBeTruthy();

        expect(setLocalStorageSpy).not.toHaveBeenCalled();
      });

      it('should expand the whole accordion on error', async () => {
        const { fixture, getByRole, getByText } = await setup();
        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        fixture.detectChanges();

        expect(getByText('Hide all job roles')).toBeTruthy();
      });

      it('should continue to display error messages after empty submit and then user selects job roles', async () => {
        const { fixture, getByRole, getByText } = await setup();
        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        const errorSummaryBoxHeading = 'There is a problem';
        const expectedErrorMessage = 'Select job roles for all your current staff vacancies';

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

  describe('navigation', () => {
    it('should return to the workplace summary page when cancel button is clicked', async () => {
      const { getByText, routerSpy } = await setup({ returnToUrl: true });
      const cancelButton = getByText('Cancel');

      userEvent.click(cancelButton);
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace', queryParams: undefined });
    });

    it('should return to the funding workplace summary page when visited from funding and cancel button is clicked', async () => {
      const { component, getByText, routerSpy } = await setup({ returnToUrl: true });
      component.return = { url: ['/funding', 'workplaces', 'mock-uid'] };

      const cancelButton = getByText('Cancel');

      userEvent.click(cancelButton);
      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'workplaces', 'mock-uid'], jasmine.anything());
    });

    it('should set the backlink to "do you have vacancy" page', async () => {
      const { component } = await setup();
      expect(component.back).toEqual({
        url: ['/workplace', component.establishment.uid, 'do-you-have-vacancies'],
      });
    });

    it('should set the backlink to "do you have vacancy" when not in the flow', async () => {
      const { component } = await setup({ returnToUrl: true });
      expect(component.back).toEqual({
        url: ['/workplace', component.establishment.uid, 'do-you-have-vacancies'],
      });
    });
  });
});
