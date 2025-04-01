import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Establishment, jobOptionsEnum, Vacancy } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUpdateWorkplaceAfterStaffChangesService } from '@core/test-utils/MockUpdateWorkplaceAfterStaffChangesService';
import { SharedModule } from '@shared/shared.module';
import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { of, throwError } from 'rxjs';

import { UpdateStartersComponent } from './update-starters.component';

fdescribe('UpdateStartersComponent', () => {
  const dateToday = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const radioButtonLabels = {
    No: `No staff started on or after ${dateToday}`,
    DoNotKnow: `I do not know how many staff started on or after ${dateToday}`,
  };
  const messageWhenNoJobRoleSelected = {
    None: `No staff started on or after ${dateToday}.`,
    DoNotKnow: `You do not know how many staff started on or after ${dateToday}.`,
    Default: `You've not added any staff who've started since ${dateToday}.`,
  };

  const mockVacancies: Vacancy[] = [
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

  const mockWorkplace = establishmentBuilder({ overrides: { vacancies: mockVacancies } }) as Establishment;
  const mockWorkplaceWithNoVacancies = establishmentBuilder({ overrides: { vacancies: jobOptionsEnum.NONE } });
  const mockWorkplaceWithVacanciesNotKnown = establishmentBuilder({
    overrides: { vacancies: jobOptionsEnum.DONT_KNOW },
  });

  const mockFreshWorkplace = establishmentBuilder({ overrides: { vacancies: null } }) as Establishment;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setup = async (override: any = {}) => {
    const workplace = override.workplace ?? mockWorkplaceWithNoVacancies;
    const selectedVacancies = override.vacanciesFromSelectJobRolePages ?? null;

    const setupTools = await render(UpdateStartersComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: UpdateWorkplaceAfterStaffChangesService,
          useFactory: MockUpdateWorkplaceAfterStaffChangesService.factory({ selectedVacancies }),
        },
        {
          provide: EstablishmentService,
          useFactory: MockEstablishmentService.factory({ cqc: null, localAuthorities: null }, null, workplace),
          deps: [HttpClient],
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
          },
        },
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const updateJobsSpy = spyOn(establishmentService, 'updateJobs').and.callFake((uid, data) =>
      of({ uid, vacancies: data.vacancies }),
    );
    const setStateSpy = spyOn(establishmentService, 'setState').and.callThrough();

    const updateWorkplaceAfterStaffChangesService = injector.inject(
      UpdateWorkplaceAfterStaffChangesService,
    ) as UpdateWorkplaceAfterStaffChangesService;

    return {
      component,
      routerSpy,
      updateJobsSpy,
      setStateSpy,
      updateWorkplaceAfterStaffChangesService,
      dateToday,
      ...setupTools,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole, dateToday } = await setup();
      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual(`Update the number of staff who've started SINCE ${dateToday}`);
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
      const { getByTestId, dateToday } = await setup();
      const warningText = getByTestId('warning-text');
      const expectedTextContent = `Remember to SUBTRACT or REMOVE any staff who started before ${dateToday}.`;

      expect(warningText.textContent).toContain(expectedTextContent);
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

        expect(heading.textContent).toEqual(`Add the number of staff who've started SINCE ${dateToday}`);
      });

      it('should not show the reminder text for subtracting or removing starters', async () => {
        const { queryByTestId, queryByText } = await setup({ workplace: mockFreshWorkplace });

        const warningText = queryByTestId('warning-text');
        expect(warningText).toBeFalsy();
        expect(queryByText(`Remember to SUBTRACT or REMOVE any staff who started before ${dateToday}.`)).toBeFalsy();
      });

      it('should show "Add job roles" as the text of add job role button', async () => {
        const { getByRole } = await setup({ workplace: mockFreshWorkplace });

        const addButton = getByRole('button', { name: 'Add job roles' });

        expect(addButton).toBeTruthy();
      });
    });

    describe('job roles', () => {
      describe('before adding new job roles', () => {
        it('should show a number input and a remove button for every vacancy job role from database', async () => {
          const mockWorkplace = establishmentBuilder({
            overrides: { vacancies: mockVacancies },
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
          const { getByLabelText, getByTestId, getByText } = await setup({ workplace: mockWorkplaceWithNoVacancies });

          const radioButton = getByLabelText(radioButtonLabels.No) as HTMLInputElement;
          expect(radioButton.checked).toBe(true);
          expect(getByTestId('total-number').textContent).toEqual('0');

          expect(getByText(messageWhenNoJobRoleSelected.None)).toBeTruthy();
        });

        it('should select the "No" radio button and display a message if user previously selected "Do not know"', async () => {
          const { getByLabelText, getByTestId, getByText } = await setup({
            workplace: mockWorkplaceWithVacanciesNotKnown,
          });

          const radioButton = getByLabelText(radioButtonLabels.DoNotKnow) as HTMLInputElement;
          expect(radioButton.checked).toBe(true);
          expect(getByTestId('total-number').textContent).toEqual('0');

          expect(getByText(messageWhenNoJobRoleSelected.DoNotKnow)).toBeTruthy();
        });

        describe('after adding new add roles', () => {
          it('should show every vacancy job role that user selected in accordion page', async () => {
            await setup({
              vacanciesFromSelectJobRolePages: [
                { jobId: 10, title: 'Care worker', total: 1 },
                { jobId: 27, title: 'Registered nurse', total: 1 },
              ],
            });

            await expectJobRoleToHaveValue('Care worker', '1');
            await expectJobRoleToHaveValue('Registered nurse', '1');
          });

          it('should show no job role selected instead of prefill from backend data, if user did not select any job roles in accordion page', async () => {
            const mockWorkplace = establishmentBuilder({
              overrides: { vacancies: mockVacancies },
            });
            const { queryByText, queryByLabelText, getByTestId } = await setup({
              vacanciesFromSelectJobRolePages: [],
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
    it('should update the total number when the vacancy number of a job role is changed', async () => {
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
        expect(routerSpy).toHaveBeenCalledWith(['../update-vacancies-job-roles'], { relativeTo: component.route });
      });

      it('should store the current job role selections in service', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { vacancies: mockVacancies },
        });
        const { fixture, getByRole, updateWorkplaceAfterStaffChangesService } = await setup({
          workplace: mockWorkplace,
        });

        const addButton = getByRole('button', { name: 'Add more job roles' });
        userEvent.click(addButton);

        fixture.detectChanges();

        expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual(mockVacancies);
      });

      it('should bring along any changes made by user in current page', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { vacancies: mockVacancies },
        });
        const { fixture, getByRole, updateWorkplaceAfterStaffChangesService } = await setup({
          workplace: mockWorkplace,
        });

        await clickRemoveButtonForJobRole('Registered nurse');
        await fillInValueForJobRole('Social worker', '5');

        const addButton = getByRole('button', { name: 'Add more job roles' });
        userEvent.click(addButton);

        fixture.detectChanges();

        expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual([
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
          overrides: { vacancies: mockVacancies },
        });
        const { fixture, queryByText, queryByLabelText } = await setup({ workplace: mockWorkplace });

        await clickRemoveButtonForJobRole('Registered nurse');

        fixture.detectChanges();

        expect(queryByText('Registered nurse')).toBeFalsy();
        expect(queryByLabelText('Registered nurse')).toBeFalsy();
      });

      it('should update the total number', async () => {
        const mockWorkplace = establishmentBuilder({
          overrides: { vacancies: mockVacancies },
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
          overrides: { vacancies: mockVacancies },
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
          overrides: { vacancies: mockVacancies },
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
        overrides: { vacancies: mockVacancies },
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

      expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, { vacancies: [{ jobId: 27, total: 10 }] });
    });

    it('should save the vacancy as None if user selected None', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { vacancies: mockVacancies },
      }) as Establishment;
      const { getByLabelText, getByRole, updateJobsSpy } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByLabelText(radioButtonLabels.No));

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, { vacancies: jobOptionsEnum.NONE });
    });

    it('should navigate to the update-workplace-details page', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { vacancies: mockVacancies },
      });
      const { component, routerSpy, getByRole } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      // @ts-expect-error: TS2341: Property 'route' is private
      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it('should clear the selectedVacancies value in UpdateWorkplaceAfterStaffChangesService', async () => {
      const { getByRole, updateWorkplaceAfterStaffChangesService } = await setup({
        vacanciesFromSelectJobRolePages: [
          { jobId: 10, title: 'Care worker', total: 1 },
          { jobId: 27, title: 'Registered nurse', total: 1 },
        ],
      });

      await fillInValueForJobRole('Care worker', '10');

      userEvent.click(getByRole('button', { name: 'Save and return' }));
      expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual(null);
    });

    describe('validation', () => {
      const testCases = [
        {
          inputValue: '',
          expectedErrorMessage: {
            summaryBox: 'Enter the number of current staff vacancies or remove care worker',
            inline: 'Enter the number of current staff vacancies or remove care worker',
          },
        },
        {
          inputValue: '0',
          expectedErrorMessage: {
            summaryBox: 'Number of vacancies must be between 1 and 999 (care worker)',
            inline: 'Number of vacancies must be between 1 and 999',
          },
        },
        {
          inputValue: 'apple',
          expectedErrorMessage: {
            summaryBox: 'Number of vacancies must be between 1 and 999 (care worker)',
            inline: 'Number of vacancies must be between 1 and 999',
          },
        },
        {
          inputValue: '9999',
          expectedErrorMessage: {
            summaryBox: 'Number of vacancies must be between 1 and 999 (care worker)',
            inline: 'Number of vacancies must be between 1 and 999',
          },
        },
      ];

      testCases.forEach(({ inputValue, expectedErrorMessage }) => {
        it(`should show an error when user input "${inputValue}" for a job role`, async () => {
          const { fixture, getByRole, updateJobsSpy } = await setup({
            vacanciesFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 1 }],
          });

          await fillInValueForJobRole('Care worker', inputValue);

          userEvent.click(getByRole('button', { name: 'Save and return' }));

          fixture.detectChanges();

          expectErrorMessageAppears(expectedErrorMessage.summaryBox, expectedErrorMessage.inline);
          expect(updateJobsSpy).not.toHaveBeenCalled();
        });
      });

      it('should still show the correct error messages even if some job roles were removed before submit', async () => {
        const { fixture, getByRole } = await setup({
          vacanciesFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 3 }, ...mockVacancies],
        });

        await fillInValueForJobRole('Registered nurse', '9999');
        await fillInValueForJobRole('Social worker', '');
        await clickRemoveButtonForJobRole('Care worker');

        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expectErrorMessageAppears(
          'Number of vacancies must be between 1 and 999 (registered nurse)',
          'Number of vacancies must be between 1 and 999',
        );
        expectErrorMessageAppears('Enter the number of current staff vacancies or remove social worker');
      });

      it('should still show the correct error messages even if some job roles were removed after submit', async () => {
        const { fixture, getByRole } = await setup({
          vacanciesFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 3 }, ...mockVacancies],
        });

        await fillInValueForJobRole('Registered nurse', '9999');
        await fillInValueForJobRole('Social worker', '');

        userEvent.click(getByRole('button', { name: 'Save and return' }));
        await clickRemoveButtonForJobRole('Care worker');

        fixture.detectChanges();

        expectErrorMessageAppears(
          'Number of vacancies must be between 1 and 999 (registered nurse)',
          'Number of vacancies must be between 1 and 999',
        );
        expectErrorMessageAppears('Enter the number of current staff vacancies or remove social worker');
      });

      it('should show error messages when no job roles were added and user did not chose "No" or "Do not know"', async () => {
        const { fixture, getByRole, updateJobsSpy, getAllByText } = await setup({
          workplace: mockFreshWorkplace,
        });
        const expectedErrorMessage1 = 'Add a job role';
        const expectedErrorMessage2 = 'Select there are no current staff vacancies or do not know';

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
          vacanciesFromSelectJobRolePages: [{ jobId: 10, title: 'Care worker', total: 1 }],
        });

        await fillInValueForJobRole('Care worker', '0');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expectErrorMessageAppears(
          'Number of vacancies must be between 1 and 999 (care worker)',
          'Number of vacancies must be between 1 and 999',
        );
        expectErrorMessageAppears('Select there are no current staff vacancies or do not know');
        expect(queryByText('Add a job role')).toBeFalsy();

        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should not show the "Select there are no ..." error message if at least one job role is added with a valid number', async () => {
        const { fixture, getByRole, queryByText, updateJobsSpy } = await setup({
          vacanciesFromSelectJobRolePages: [
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

        expect(queryByText('Select there are no current staff vacancies or do not know')).toBeFalsy();
        expect(updateJobsSpy).not.toHaveBeenCalled();
      });

      it('should clear the "Select there are no ..." error and allow submit if all job roles are filled with a valid number', async () => {
        const { fixture, getByRole, queryByText, updateJobsSpy } = await setup({
          workplace: mockWorkplace,
          vacanciesFromSelectJobRolePages: [
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

        expectErrorMessageAppears('Select there are no current staff vacancies or do not know');

        await fillInValueForJobRole('Care worker', '1');
        await fillInValueForJobRole('Registered nurse', '2');
        await fillInValueForJobRole('Social worker', '3');
        userEvent.click(getByRole('button', { name: 'Save and return' }));

        fixture.detectChanges();

        expect(queryByText('Select there are no current staff vacancies or do not know')).toBeFalsy();
        expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, {
          vacancies: [
            { jobId: 10, total: 1 },
            { jobId: 23, total: 2 },
            { jobId: 27, total: 3 },
          ],
        });
      });
    });
  });

  it('should show a server error if failed to update vacancies', async () => {
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

    expectErrorMessageAppears('Failed to update current staff vacancies', false);
  });

  it('should return to Check this information page when user clicked the cancel button', async () => {
    const { component, getByText, updateJobsSpy, routerSpy, updateWorkplaceAfterStaffChangesService } = await setup({
      workplace: mockWorkplace,
    });

    userEvent.click(getByText('Cancel'));

    expect(updateJobsSpy).not.toHaveBeenCalled();
    // @ts-expect-error: TS2341: Property 'route' is private
    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual(null);
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
