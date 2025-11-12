import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment, jobOptionsEnum, Starter } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { VacanciesAndTurnoverService, WorkplaceUpdatePage } from '@core/services/vacancies-and-turnover.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { FormatUtil } from '@core/utils/format-util';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { UpdateStartersComponent } from './update-starters.component';

describe('UpdateStartersComponent', () => {
  const today = new Date();
  today.setFullYear(today.getFullYear() - 1);

  const todayOneYearAgo = FormatUtil.formatDateToLocaleDateString(today);

  const radioButtonLabels = {
    No: `No staff started on or after ${todayOneYearAgo}`,
    DoNotKnow: `I do not know if any staff started on or after ${todayOneYearAgo}`,
  };
  const messageWhenNoJobRoleSelected = {
    None: `No staff started on or after ${todayOneYearAgo}.`,
    DoNotKnow: `You do not know if any staff started on or after ${todayOneYearAgo}.`,
    Default: `You've not added any staff who've started since ${todayOneYearAgo}.`,
  };

  const mockStarters: Starter[] = [
    {
      jobId: 23,
      title: 'Registered nurse',
      total: 6,
    },
    {
      jobId: 27,
      title: 'Social worker',
      total: 4,
    },
  ];

  const mockWorkplace = establishmentBuilder({ overrides: { starters: mockStarters } }) as Establishment;
  const mockWorkplaceWithNoStarters = establishmentBuilder({ overrides: { starters: jobOptionsEnum.NONE } });
  const mockWorkplaceWithStartersNotKnown = establishmentBuilder({
    overrides: { starters: jobOptionsEnum.DONT_KNOW },
  });

  const mockFreshWorkplace = establishmentBuilder({ overrides: { starters: null } }) as Establishment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = async (override: any = {}) => {
    const workplace = override.workplace ?? mockWorkplaceWithNoStarters;
    const selectedStarters = override.startersFromSelectJobRolePages ?? null;
    const addToVisitedPagesSpy = jasmine.createSpy('addToVisitedPages');
    const addToSubmittedPagesSpy = jasmine.createSpy('addToSubmittedPages');

    const setupTools = await render(UpdateStartersComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory({
            selectedStarters,
            addToVisitedPages: addToVisitedPagesSpy,
            addToSubmittedPages: addToSubmittedPagesSpy,
          }),
        },
        {
          provide: EstablishmentService,
          useValue: {
            establishment: workplace,
            updateJobs: () => {},
            setState: () => {},
            ...override.establishmentService,
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { data: override.snapshot },
          },
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateJobsSpy = spyOn(establishmentService, 'updateJobs').and.callFake((uid, data) =>
      of({ uid, starters: data.starters }),
    );
    const setStateSpy = spyOn(establishmentService, 'setState').and.callThrough();

    const vacanciesAndTurnoverService = injector.inject(VacanciesAndTurnoverService) as VacanciesAndTurnoverService;

    return {
      ...setupTools,
      component,
      routerSpy,
      updateJobsSpy,
      setStateSpy,
      vacanciesAndTurnoverService,
      addToVisitedPagesSpy,
      addToSubmittedPagesSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should add page to visitedPages in vacanciesAndTurnoverService', async () => {
    const { addToVisitedPagesSpy } = await setup();

    expect(addToVisitedPagesSpy).toHaveBeenCalledWith(WorkplaceUpdatePage.UPDATE_STARTERS);
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();
      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual(`Update the number of staff who've started SINCE ${todayOneYearAgo}`);
    });

    it('should show a reveal text for "Why we ask for this information"', async () => {
      const { getByText } = await setup();

      const reveal = getByText('Why we ask for this information');
      const revealText = getByText(
        "To see if the care sector is attracting new workers and see whether DHSC and the government's national and local recruitment plans are working.",
      );

      expect(reveal).toBeTruthy();
      expect(revealText).toBeTruthy();
    });

    it('should show a warning text to remind user to subtract or remove starters', async () => {
      const { getByTestId } = await setup();
      const warningText = getByTestId('warning-text');
      const expectedTextContent = `Remember to SUBTRACT or REMOVE any staff who started before ${todayOneYearAgo}.`;

      expect(warningText.textContent).toContain(expectedTextContent);
    });

    it('should not show explanation message for adding when question answered', async () => {
      const { queryByText } = await setup();

      const addMessage = queryByText('Only add the number of starters in permanent and temporary job roles.');

      expect(addMessage).toBeFalsy();
    });

    it('should have "Starters in the last 12 months" as the table title', async () => {
      const { getByText } = await setup();
      const tableTitle = getByText('Starters in the last 12 months');

      expect(tableTitle).toBeTruthy();
    });

    it('should show an "Add more job roles" button', async () => {
      const { getByRole } = await setup();
      const addButton = getByRole('button', { name: 'Add more job roles' });

      expect(addButton).toBeTruthy();
    });

    it('should show the total number of starters', async () => {
      const { getByText, getByTestId } = await setup({ workplace: mockWorkplace });

      const totalNumber = getByTestId('total-number');
      expect(totalNumber.textContent).toEqual('10');
      expect(getByText('Total number of starters'));
    });

    it('should show a radio button for "No", and another for "I do not know"', async () => {
      const { getByLabelText } = await setup();

      expect(getByLabelText(radioButtonLabels.No)).toBeTruthy();
      expect(getByLabelText(radioButtonLabels.DoNotKnow)).toBeTruthy();
    });

    it('should show a "Save and return" CTA button and a Cancel link', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    describe('in case of a fresh workplace', () => {
      it('should show a different page heading', async () => {
        const { getByRole } = await setup({ workplace: mockFreshWorkplace });
        const heading = getByRole('heading', { level: 1 });

        expect(heading.textContent).toEqual(`Add the number of staff who've started SINCE ${todayOneYearAgo}`);
      });

      it('should not show the reminder text for subtracting or removing starters', async () => {
        const { queryByTestId, queryByText } = await setup({ workplace: mockFreshWorkplace });

        const warningText = queryByTestId('warning-text');
        expect(warningText).toBeFalsy();
        expect(
          queryByText(`Remember to SUBTRACT or REMOVE any staff who started before ${todayOneYearAgo}.`),
        ).toBeFalsy();
      });

      it('should show "Add job roles" as the text of add job role button', async () => {
        const { getByRole } = await setup({ workplace: mockFreshWorkplace });

        const addButton = getByRole('button', { name: 'Add job roles' });

        expect(addButton).toBeTruthy();
      });

      it('should show explanation message for adding', async () => {
        const { getByText } = await setup({ workplace: mockFreshWorkplace });

        const addMessage = getByText('Only add the number of starters in permanent and temporary job roles.');

        expect(addMessage).toBeTruthy();
      });
    });

    describe('job roles', () => {
      describe('before adding new job roles', () => {
        it('should show a number input and a remove button for every starter job role from database', async () => {
          const mockWorkplace = establishmentBuilder({
            overrides: { starters: mockStarters },
          });
          const { getByTestId } = await setup({ workplace: mockWorkplace });

          await expectJobRoleToHaveValue('Registered nurse', '6');
          expect(getByTestId('remove-button-Registered nurse')).toBeTruthy();

          await expectJobRoleToHaveValue('Social worker', '4');
          expect(getByTestId('remove-button-Social worker')).toBeTruthy();
        });

        it(`should show a message "You've not added any staff who've started..." if for a fresh workplace`, async () => {
          const { getByText } = await setup({ workplace: mockFreshWorkplace });

          expect(getByText(messageWhenNoJobRoleSelected.Default)).toBeTruthy();
        });

        it('should select the "No" radio button and display a message if user previously selected "No"', async () => {
          const { getByLabelText, getByTestId, getByText } = await setup({ workplace: mockWorkplaceWithNoStarters });

          const radioButton = getByLabelText(radioButtonLabels.No) as HTMLInputElement;
          expect(radioButton.checked).toBe(true);
          expect(getByTestId('total-number').textContent).toEqual('0');

          expect(getByText(messageWhenNoJobRoleSelected.None)).toBeTruthy();
        });

        it('should select the "No" radio button and display a message if user previously selected "Do not know"', async () => {
          const { getByLabelText, getByTestId, getByText } = await setup({
            workplace: mockWorkplaceWithStartersNotKnown,
          });

          const radioButton = getByLabelText(radioButtonLabels.DoNotKnow) as HTMLInputElement;
          expect(radioButton.checked).toBe(true);
          expect(getByTestId('total-number').textContent).toEqual('0');

          expect(getByText(messageWhenNoJobRoleSelected.DoNotKnow)).toBeTruthy();
        });

        describe('after adding new add roles', () => {
          it('should show every starter job role that user selected in accordion page', async () => {
            await setup({
              startersFromSelectJobRolePages: [
                { jobId: 10, title: 'Care worker', total: 1 },
                { jobId: 27, title: 'Registered nurse', total: 1 },
              ],
            });

            await expectJobRoleToHaveValue('Care worker', '1');
            await expectJobRoleToHaveValue('Registered nurse', '1');
          });

          it('should show no job role selected instead of prefill from backend data, if user did not select any job roles in accordion page', async () => {
            const mockWorkplace = establishmentBuilder({
              overrides: { starters: mockStarters },
            });
            const { queryByText, queryByLabelText, getByTestId } = await setup({
              startersFromSelectJobRolePages: [],
              workplace: mockWorkplace,
            });

            expect(queryByText('Registered nurse')).toBeFalsy();
            expect(queryByLabelText('Registered nurse')).toBeFalsy();

            expect(queryByText('Social worker')).toBeFalsy();
            expect(queryByLabelText('Social worker')).toBeFalsy();

            expect(getByTestId('total-number').textContent).toEqual('0');
          });
        });
      });
    });
  });

  describe('interaction', () => {
    it('should update the total number when the starter number of a job role is changed', async () => {
      const { fixture, getByTestId } = await setup({ workplace: mockWorkplace });

      await fillInValueForJobRole('Registered nurse', '10');

      fixture.detectChanges();

      expect(getByTestId('total-number').textContent).toEqual('14');
    });

    describe('add job role button', () => {
      it('should navigate to select-job-role page', async () => {
        const { component, fixture, routerSpy, getByRole } = await setup();

        const addButton = getByRole('button', { name: 'Add more job roles' });
        userEvent.click(addButton);

        fixture.detectChanges();

        // @ts-expect-error: TS2341: Property 'route' is private
        expect(routerSpy).toHaveBeenCalledWith(['../update-starters-job-roles'], { relativeTo: component.route });
      });

      it('should store the current job role selections in service', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { fixture, getByRole, vacanciesAndTurnoverService } = await setup({
          workplace: mockWorkplace,
        });

        const addButton = getByRole('button', { name: 'Add more job roles' });
        userEvent.click(addButton);

        fixture.detectChanges();

        expect(vacanciesAndTurnoverService.selectedStarters).toEqual(mockStarters);
      });

      it('should bring along any changes made by user in current page', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { fixture, getByRole, vacanciesAndTurnoverService } = await setup({
          workplace: mockWorkplace,
        });

        await clickRemoveButtonForJobRole('Registered nurse');
        await fillInValueForJobRole('Social worker', '5');

        const addButton = getByRole('button', { name: 'Add more job roles' });
        userEvent.click(addButton);

        fixture.detectChanges();

        expect(vacanciesAndTurnoverService.selectedStarters).toEqual([
          {
            jobId: 27,
            title: 'Social worker',
            total: 5,
          },
        ]);
      });
    });

    describe('remove button', () => {
      it('should remove a job role from the list when remove button is clicked', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { fixture, queryByText, queryByLabelText } = await setup({ workplace: mockWorkplace });

        await clickRemoveButtonForJobRole('Registered nurse');

        fixture.detectChanges();

        expect(queryByText('Registered nurse')).toBeFalsy();
        expect(queryByLabelText('Registered nurse')).toBeFalsy();
      });

      it('should update the total number', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { fixture, getByTestId, getByText } = await setup({ workplace: mockWorkplace });

        const totalNumber = getByTestId('total-number');

        await clickRemoveButtonForJobRole('Registered nurse');
        fixture.detectChanges();
        expect(totalNumber.textContent).toEqual('4');

        await clickRemoveButtonForJobRole('Social worker');
        fixture.detectChanges();
        expect(totalNumber.textContent).toEqual('0');
        expect(getByText(messageWhenNoJobRoleSelected.Default)).toBeTruthy();
      });
    });

    describe('radio buttons for "No" and "Do not know"', () => {
      it(`should remove all selected job roles when user clicked the radio button for "No"`, async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { fixture, queryByText, queryByLabelText, getByText, getByLabelText, getByTestId } = await setup({
          workplace: mockWorkplace,
        });

        userEvent.click(getByLabelText(radioButtonLabels.No));

        fixture.detectChanges();

        expect(queryByText('Registered nurse')).toBeFalsy();
        expect(queryByLabelText('Registered nurse')).toBeFalsy();

        expect(queryByText('Social worker')).toBeFalsy();
        expect(queryByLabelText('Social worker')).toBeFalsy();

        expect(getByTestId('total-number').textContent).toEqual('0');

        expect(getByText(messageWhenNoJobRoleSelected.None)).toBeTruthy();
      });

      it(`should remove all selected job roles when user clicked the radio button for "Do not know"`, async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { fixture, queryByText, queryByLabelText, getByText, getByLabelText, getByTestId } = await setup({
          workplace: mockWorkplace,
        });

        userEvent.click(getByLabelText(radioButtonLabels.DoNotKnow));

        fixture.detectChanges();

        expect(queryByText('Registered nurse')).toBeFalsy();
        expect(queryByLabelText('Registered nurse')).toBeFalsy();

        expect(queryByText('Social worker')).toBeFalsy();
        expect(queryByLabelText('Social worker')).toBeFalsy();

        expect(getByTestId('total-number').textContent).toEqual('0');

        expect(getByText(messageWhenNoJobRoleSelected.DoNotKnow)).toBeTruthy();
      });
    });
  });

  describe('submit form and validation', () => {
    it('should save the changes in job role selection and number', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { starters: mockStarters },
      }) as Establishment;
      const { getByLabelText, getByRole, getByTestId, updateJobsSpy } = await setup({
        workplace: mockWorkplace,
      });

      const removeButtonForNurse = getByTestId('remove-button-Registered nurse');
      userEvent.click(removeButtonForNurse);

      const numberInputForSocialWorker = getByLabelText('Social worker') as HTMLInputElement;
      userEvent.clear(numberInputForSocialWorker);
      userEvent.type(numberInputForSocialWorker, '10');

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, { starters: [{ jobId: 27, total: 10 }] });
    });

    it('should save starters as None if user selected None', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { starters: mockStarters },
      }) as Establishment;
      const { getByLabelText, getByRole, updateJobsSpy } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByLabelText(radioButtonLabels.No));

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, { starters: jobOptionsEnum.NONE });
    });

    describe('Navigation on save', () => {
      it('should navigate to the update-workplace-details page if staffUpdatesView passed in as true from routing', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { component, routerSpy, getByRole } = await setup({
          workplace: mockWorkplace,
          snapshot: { staffUpdatesView: true },
        });

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        // @ts-expect-error: TS2341: Property 'route' is private
        expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
      });

      it('should navigate to the workplace tab on dashboard when set as returnTo in establishment service', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { routerSpy, getByRole } = await setup({
          workplace: mockWorkplace,
          establishmentService: {
            returnTo: { url: ['/dashboard'], fragment: 'workplace' },
          },
        });

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
      });

      it('should navigate to the funding workplace tab when set as returnTo in establishment service', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { routerSpy, getByRole } = await setup({
          workplace: mockWorkplace,
          establishmentService: { returnTo: { url: ['/funding/data'], fragment: 'workplace' } },
        });

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(routerSpy).toHaveBeenCalledWith(['/funding/data'], { fragment: 'workplace' });
      });

      it('should navigate to the workplace tab on dashboard when no returnTo and not in staffUpdatesView', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { starters: mockStarters },
        });
        const { routerSpy, getByRole } = await setup({
          workplace: mockWorkplace,
        });

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
      });
    });

    it('should clear the selectedStarters value in vacanciesAndTurnoverService', async () => {
      const { getByRole, vacanciesAndTurnoverService } = await setup({
        startersFromSelectJobRolePages: [
          { jobId: 10, title: 'Care worker', total: 1 },
          { jobId: 27, title: 'Registered nurse', total: 1 },
        ],
      });

      await fillInValueForJobRole('Care worker', '10');

      userEvent.click(getByRole('button', { name: 'Save and return' }));
      expect(vacanciesAndTurnoverService.selectedStarters).toEqual(null);
    });

    it('should add starters page to submittedPages in vacanciesAndTurnoverService', async () => {
      const { getByRole, addToSubmittedPagesSpy } = await setup();

      userEvent.click(getByRole('button', { name: 'Save and return' }));
      expect(addToSubmittedPagesSpy).toHaveBeenCalledWith(WorkplaceUpdatePage.UPDATE_STARTERS);
    });

    describe('validation', () => {
      const testCases = [
        {
          inputValue: '',
          expectedErrorMessage: {
            summaryBox: 'Enter the number of starters or remove care worker',
            inline: 'Enter the number of starters or remove care worker',
          },
        },
        {
          inputValue: '0',
          expectedErrorMessage: {
            summaryBox: 'Number of starters must be between 1 and 999 (care worker)',
            inline: 'Number of starters must be between 1 and 999',
          },
        },
        {
          inputValue: 'apple',
          expectedErrorMessage: {
            summaryBox: 'Number of starters must be between 1 and 999 (care worker)',
            inline: 'Number of starters must be between 1 and 999',
          },
        },
        {
          inputValue: '9999',
          expectedErrorMessage: {
            summaryBox: 'Number of starters must be between 1 and 999 (care worker)',
            inline: 'Number of starters must be between 1 and 999',
          },
        },
      ];

      testCases.forEach(({ inputValue, expectedErrorMessage }) => {
        it(`should show an error when user input "${inputValue}" for a job role`, async () => {
          const { fixture, getByRole, updateJobsSpy } = await setup({
            startersFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 1 }],
          });

          await fillInValueForJobRole('Care worker', inputValue);

          userEvent.click(getByRole('button', { name: 'Save and return' }));

          fixture.detectChanges();

          expectErrorMessageAppears(expectedErrorMessage.summaryBox, expectedErrorMessage.inline);
          expect(updateJobsSpy).not.toHaveBeenCalled();
        });
      });

      it('should show the error message without converting abbreviation in job titles to lower case', async () => {
        const { fixture, getByRole, updateJobsSpy } = await setup({
          startersFromSelectJobRolePages: [{ jobId: 36, title: 'IT manager', total: 1 }],
        });

        await fillInValueForJobRole('IT manager', '0');

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        const expectedErrorMessage = {
          summaryBox: 'Number of starters must be between 1 and 999 (IT manager)',
          inline: 'Number of starters must be between 1 and 999',
        };

        fixture.detectChanges();

        expectErrorMessageAppears(expectedErrorMessage.summaryBox, expectedErrorMessage.inline);
        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should still show the correct error messages even if some job roles were removed before submit', async () => {
        const { fixture, getByRole } = await setup({
          startersFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 3 }, ...mockStarters],
        });

        await fillInValueForJobRole('Registered nurse', '9999');
        await fillInValueForJobRole('Social worker', '');
        await clickRemoveButtonForJobRole('Care worker');

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expectErrorMessageAppears(
          'Number of starters must be between 1 and 999 (registered nurse)',
          'Number of starters must be between 1 and 999',
        );
        expectErrorMessageAppears('Enter the number of starters or remove social worker');
      });

      it('should still show the correct error messages even if some job roles were removed after submit', async () => {
        const { fixture, getByRole } = await setup({
          startersFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 3 }, ...mockStarters],
        });

        await fillInValueForJobRole('Registered nurse', '9999');
        await fillInValueForJobRole('Social worker', '');

        userEvent.click(getByRole('button', { name: 'Save and return' }));
        await clickRemoveButtonForJobRole('Care worker');

        fixture.detectChanges();

        expectErrorMessageAppears(
          'Number of starters must be between 1 and 999 (registered nurse)',
          'Number of starters must be between 1 and 999',
        );
        expectErrorMessageAppears('Enter the number of starters or remove social worker');
      });

      it('should show error messages when no job roles were added and user did not chose "No" or "Do not know"', async () => {
        const { fixture, getByRole, updateJobsSpy, getAllByText } = await setup({
          workplace: mockFreshWorkplace,
        });
        const expectedErrorMessage1 = 'Add a job role';
        const expectedErrorMessage2 = 'Select no staff started or do not know';

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expectErrorMessageAppears(expectedErrorMessage1);
        expectErrorMessageAppears(expectedErrorMessage2);
        expect(updateJobsSpy).not.toHaveBeenCalled();

        const addJobRoleButton = getByRole('button', { name: 'Add job roles' });
        const buttonFocusSpy = spyOn(addJobRoleButton, 'focus');

        userEvent.click(getAllByText('Add a job role')[0]);

        await fixture.whenStable();

        expect(buttonFocusSpy).toHaveBeenCalled();
      });

      it('should show error messages user entered "0" for a job role and did not chose "No" or "Do not know"', async () => {
        const { fixture, getByRole, updateJobsSpy, queryByText } = await setup({
          startersFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 1 }],
        });

        await fillInValueForJobRole('Care worker', '0');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expectErrorMessageAppears(
          'Number of starters must be between 1 and 999 (care worker)',
          'Number of starters must be between 1 and 999',
        );
        expectErrorMessageAppears('Select no staff started or do not know');
        expect(queryByText('Add a job role')).toBeFalsy();

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should not show the "Select there are no ..." error message if at least one job role is added with a valid number', async () => {
        const { fixture, getByRole, queryByText, updateJobsSpy } = await setup({
          startersFromSelectJobRolePages: [
            { jobId: 10, title: 'Care worker', total: 1 },
            { jobId: 23, title: 'Registered nurse', total: 1 },
            { jobId: 27, title: 'Social worker', total: 1 },
          ],
        });

        await fillInValueForJobRole('Care worker', '0');
        await fillInValueForJobRole('Registered nurse', '2');
        await fillInValueForJobRole('Social worker', '0');

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expect(queryByText('Select no staff started or do not know')).toBeFalsy();
        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should clear the "Select there are no ..." error and allow submit if all job roles are filled with a valid number', async () => {
        const { fixture, getByRole, queryByText, updateJobsSpy } = await setup({
          workplace: mockWorkplace,
          startersFromSelectJobRolePages: [
            { jobId: 10, title: 'Care worker', total: 1 },
            { jobId: 23, title: 'Registered nurse', total: 1 },
            { jobId: 27, title: 'Social worker', total: 1 },
          ],
        });

        await fillInValueForJobRole('Care worker', '0');
        await fillInValueForJobRole('Registered nurse', '0');
        await fillInValueForJobRole('Social worker', '0');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expectErrorMessageAppears('Select no staff started or do not know');

        await fillInValueForJobRole('Care worker', '1');
        await fillInValueForJobRole('Registered nurse', '2');
        await fillInValueForJobRole('Social worker', '3');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expect(queryByText('Select no staff started or do not know')).toBeFalsy();
        expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, {
          starters: [
            { jobId: 10, total: 1 },
            { jobId: 23, total: 2 },
            { jobId: 27, total: 3 },
          ],
        });
      });
    });
  });

  it('should show a server error if failed to update starters', async () => {
    const { fixture, updateJobsSpy, getByRole } = await setup({
      workplace: mockWorkplace,
    });
    const errorResponse = new HttpErrorResponse({
      error: { message: 'Internal server error' },
      status: 500,
      statusText: 'Internal server error',
    });

    updateJobsSpy.and.returnValue(throwError(errorResponse));

    await fillInValueForJobRole('Social worker', '3');
    userEvent.click(getByRole('button', { name: 'Save and return' }));

    fixture.detectChanges();

    expectErrorMessageAppears('Failed to update starters', false);
  });

  describe('Navigation on cancel', () => {
    it('should navigate to the update-workplace-details page if staffUpdates view passed in as true from routing', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { starters: mockStarters },
      });
      const { component, routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
        snapshot: { staffUpdatesView: true },
      });

      userEvent.click(getByText('Cancel'));

      // @ts-expect-error: TS2341: Property 'route' is private
      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it('should navigate to the workplace tab on dashboard when set as returnTo in establishment service', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { starters: mockStarters },
      });
      const { routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
        establishmentService: {
          returnTo: { url: ['/dashboard'], fragment: 'workplace' },
        },
      });

      userEvent.click(getByText('Cancel'));

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
    });

    it('should navigate to the funding workplace tab when set as returnTo in establishment service', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { starters: mockStarters },
      });
      const { routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
        establishmentService: { returnTo: { url: ['/funding/data'], fragment: 'workplace' } },
      });

      userEvent.click(getByText('Cancel'));

      expect(routerSpy).toHaveBeenCalledWith(['/funding/data'], { fragment: 'workplace' });
    });

    it('should navigate to the workplace tab on dashboard when no returnTo and not in staffUpdatesView', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { starters: mockStarters },
      });
      const { routerSpy, getByText } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByText('Cancel'));

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'workplace' });
    });
  });

  const fillInValueForJobRole = async (jobRoleTitle: string, inputText: string) => {
    const numberInputForJobRole = screen.getByLabelText(jobRoleTitle) as HTMLInputElement;
    userEvent.clear(numberInputForJobRole);
    userEvent.type(numberInputForJobRole, inputText);
  };

  const clickRemoveButtonForJobRole = async (jobRoleTitle: string) => {
    const removeButtonForJobRole = screen.getByTestId(`remove-button-${jobRoleTitle}`);
    userEvent.click(removeButtonForJobRole);
  };

  const expectJobRoleToHaveValue = async (jobRoleTitle: string, expectedText: string) => {
    const numberInputForJobRole = screen.getByLabelText(jobRoleTitle) as HTMLInputElement;
    expect(numberInputForJobRole).toBeTruthy();
    expect(numberInputForJobRole.value).toEqual(expectedText);
  };

  const expectErrorMessageAppears = (errorMessage: string, inlineErrorMessage: boolean | string = true) => {
    const errorBoxTitle = screen.getByText('There is a problem');
    expect(errorBoxTitle).toBeTruthy();

    const errorSummaryBox = errorBoxTitle.parentElement;
    expect(within(errorSummaryBox).getByText(errorMessage)).toBeTruthy();

    if (inlineErrorMessage === true || errorMessage === inlineErrorMessage) {
      expect(screen.getAllByText(errorMessage)).toHaveSize(2);
    } else if (typeof inlineErrorMessage === 'string') {
      expect(screen.getByText(inlineErrorMessage)).toBeTruthy();
    }
  };
});