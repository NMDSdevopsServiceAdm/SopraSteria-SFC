import { provideHttpClient } from '@angular/common/http';
import dayjs from 'dayjs';

import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Starter } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService } from '@core/services/vacancies-and-turnover.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { FormatUtil } from '@core/utils/format-util';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { HowManyStartersComponent } from './how-many-starters.component';

describe('HowManyStartersComponent', () => {
  const todayOneYearAgo = FormatUtil.formatDateToLocaleDateString(dayjs().subtract(1, 'years').toDate());

  const mockSelectedJobRoles: Starter[] = [
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
  ];

  const setup = async (override: any = {}) => {
    const availableJobs = override.availableJobs;
    const workplace = override.workplace ?? {};

    const selectedJobRoles = override.noLocalStorageData ? null : override.selectedJobRoles ?? mockSelectedJobRoles;

    const renderResults = await render(HowManyStartersComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, null, workplace),
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
        {
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory({ selectedStarters: selectedJobRoles }),
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = renderResults.fixture.componentInstance;

    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const vacanciesAndTurnoverService = injector.inject(VacanciesAndTurnoverService) as VacanciesAndTurnoverService;

    const updateJobsSpy = spyOn(establishmentService, 'updateJobs').and.callThrough();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      router,
      routerSpy,
      updateJobsSpy,
      vacanciesAndTurnoverService,
      ...renderResults,
    };
  };

  const getInputBoxForJobRole = (jobTitle: string): HTMLInputElement => {
    return screen.getByRole('textbox', { name: jobTitle });
  };

  const fillInValueForJobRole = async (jobRoleTitle: string, inputText: string) => {
    const numberInputForJobRole = screen.getByLabelText(jobRoleTitle) as HTMLInputElement;
    userEvent.clear(numberInputForJobRole);
    userEvent.type(numberInputForJobRole, inputText);
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should display a heading and a section heading', async () => {
      const { getByRole, getByTestId } = await setup();

      const heading = getByRole('heading', { level: 1 });
      const sectionHeading = within(getByTestId('section-heading'));

      expect(heading).toBeTruthy();
      expect(heading.textContent).toEqual(`How many starters have you had SINCE ${todayOneYearAgo}?`);
      expect(sectionHeading.getByText('Vacancies and turnover')).toBeTruthy();
    });

    it('should render a reveal text to explain why we ask for this information', async () => {
      const { getByText } = await setup();
      const revealText = getByText('Why we ask for this information');

      expect(revealText).toBeTruthy();
      userEvent.click(revealText);

      const revealTextContent =
        "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.";
      expect(getByText(revealTextContent)).toBeTruthy();
    });

    describe('starters numbers input form', () => {
      it('should render a input box for each selected job role', async () => {
        const { getByText } = await setup();

        mockSelectedJobRoles.forEach((role) => {
          expect(getByText(role.title)).toBeTruthy();
          const numberInput = getInputBoxForJobRole(role.title);
          expect(numberInput).toBeTruthy();
        });
      });

      it('should show a title for the job roles number table', async () => {
        const { getByText } = await setup();
        expect(getByText('Starters in the last 12 months')).toBeTruthy();
      });

      it('should show a description for the total number', async () => {
        const { getByText } = await setup();
        expect(getByText('Total number of starters')).toBeTruthy();
      });
    });
  });

  describe('buttons', () => {
    it('should render a "Save and continue" CTA button when in the flow', async () => {
      const { getByRole } = await setup();
      expect(getByRole('button', { name: 'Save and continue' })).toBeTruthy();
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
  });

  describe('prefill', () => {
    it('should prefill any job roles number that are brought along from previous page', async () => {
      const mockSelectedJobRoles = [
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

      const { getByTestId } = await setup({ selectedJobRoles: mockSelectedJobRoles });

      expect(getInputBoxForJobRole('Care worker').value).toEqual('3');
      expect(getInputBoxForJobRole('Registered nurse').value).toEqual('2');
      expect(getByTestId('total-number').innerText).toEqual('5');
    });

    it('should fill any missing job role number as 1', async () => {
      const mockSelectedJobRoles = [
        {
          jobId: 10,
          title: 'Care worker',
          total: null,
        },
        {
          jobId: 23,
          title: 'Registered nurse',
          total: 4,
        },
      ];

      const { getByTestId } = await setup({ selectedJobRoles: mockSelectedJobRoles });

      expect(getInputBoxForJobRole('Care worker').value).toEqual('1');
      expect(getInputBoxForJobRole('Registered nurse').value).toEqual('4');
      expect(getByTestId('total-number').innerText).toEqual('5');
    });

    it('should prefill job roles from workplace when not in local storage (when user has submitted previously and gone back to third page)', async () => {
      const mockSelectedJobRole = {
        jobId: 4,
        title: 'Allied health professional (not occupational therapist)',
        total: 6,
      };

      const { getByTestId } = await setup({
        noLocalStorageData: true,
        workplace: { starters: [mockSelectedJobRole] },
      });

      expect(getInputBoxForJobRole(mockSelectedJobRole.title).value).toEqual('6');
      expect(getByTestId('total-number').innerText).toEqual('6');
    });
  });

  describe('form submit and validations', () => {
    describe('on Success', () => {
      it('should call updateJobs with the input starters number', async () => {
        const { component, getByRole, updateJobsSpy } = await setup();

        await fillInValueForJobRole('Care worker', '2');
        await fillInValueForJobRole('Registered nurse', '4');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        expect(updateJobsSpy).toHaveBeenCalledWith(component.establishment.uid, {
          starters: [
            { jobId: 10, total: 2 },
            { jobId: 23, total: 4 },
          ],
        });
      });

      it('should navigate to the do-you-have-leavers page if in the flow', async () => {
        const { component, getByRole, routerSpy } = await setup();

        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'do-you-have-leavers']);
      });

      it('should clear the selected job roles stored in service after submit', async () => {
        const { getByRole, vacanciesAndTurnoverService } = await setup();

        const clearJobRolesSpy = spyOn(vacanciesAndTurnoverService, 'clearAllSelectedJobRoles');

        userEvent.click(getByRole('button', { name: 'Save and continue' }));

        expect(clearJobRolesSpy).toHaveBeenCalled();
      });
    });

    describe('errors', () => {
      it('should show an error message if number input box is empty', async () => {
        const { fixture, getByRole, getByText, getByTestId, updateJobsSpy } = await setup();

        userEvent.clear(getInputBoxForJobRole('Care worker'));
        userEvent.clear(getInputBoxForJobRole('Registered nurse'));

        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        expect(getByText('There is a problem')).toBeTruthy();
        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(within(errorSummaryBox).getByText('Enter the number of starters (care worker)')).toBeTruthy();
        expect(within(errorSummaryBox).getByText('Enter the number of starters (registered nurse)')).toBeTruthy();

        const numberInputsTable = getByTestId('number-inputs-table');
        expect(within(numberInputsTable).getAllByText('Enter the number of starters')).toHaveSize(2);

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should show an error message if the input number is out of range', async () => {
        const { fixture, getByRole, getByText, getByTestId, updateJobsSpy } = await setup();

        await fillInValueForJobRole('Care worker', '0');
        await fillInValueForJobRole('Registered nurse', '99999');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(
          within(errorSummaryBox).getByText('Number of starters must be between 1 and 999 (care worker)'),
        ).toBeTruthy();
        expect(
          within(errorSummaryBox).getByText('Number of starters must be between 1 and 999 (registered nurse)'),
        ).toBeTruthy();

        const numberInputsTable = getByTestId('number-inputs-table');
        expect(within(numberInputsTable).getAllByText('Number of starters must be between 1 and 999')).toHaveSize(2);

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should show the error message without converting abbreviation in job titles to lower case', async () => {
        const { fixture, getByText, getByRole } = await setup({
          selectedJobRoles: [{ jobId: 36, title: 'IT manager', total: 1 }],
        });

        await fillInValueForJobRole('IT manager', '0');
        userEvent.click(getByRole('button', { name: 'Save and continue' }));
        fixture.detectChanges();

        const errorSummaryBox = getByText('There is a problem').parentElement;
        expect(
          within(errorSummaryBox).getByText('Number of starters must be between 1 and 999 (IT manager)'),
        ).toBeTruthy();
      });
    });
  });

  describe('navigation', async () => {
    it('should navigate to "Do you have starters" page if failed to load selected job roles data', async () => {
      const { component, routerSpy } = await setup({ selectedJobRoles: [] });
      component.loadSelectedJobRoles();
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'do-you-have-starters']);
    });

    describe('backlink', () => {
      it('should set the backlink to job role selection page', async () => {
        const { component } = await setup();
        expect(component.back).toEqual({
          url: ['/workplace', component.establishment.uid, 'select-starter-job-roles'],
        });
      });
    });

    describe('Add job roles button', () => {
      it('should show an "Add job roles" button', async () => {
        const { getByRole } = await setup();
        expect(getByRole('button', { name: 'Add job roles' })).toBeTruthy();
      });

      it('should navigate to job role selection page when AddJobRoles button is clicked', async () => {
        const { component, fixture, getByRole, routerSpy } = await setup();

        userEvent.click(getByRole('button', { name: 'Add job roles' }));
        fixture.detectChanges();

        expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishment.uid, 'select-starter-job-roles']);
      });

      it('should save any change in job role number to vacanciesAndTurnoverService before navigation', async () => {
        const { getByRole, vacanciesAndTurnoverService } = await setup();

        await fillInValueForJobRole('Care worker', '10');
        await fillInValueForJobRole('Registered nurse', '20');

        userEvent.click(getByRole('button', { name: 'Add job roles' }));
        expect(vacanciesAndTurnoverService.selectedStarters).toEqual([
          { jobId: 10, title: 'Care worker', total: 10 },
          { jobId: 23, title: 'Registered nurse', total: 20 },
        ]);
      });
    });
  });
});