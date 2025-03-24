import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { jobOptionsEnum, Vacancy } from '@core/model/establishment.model';
import { EstablishmentService } from '@core/services/establishment.service';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockUpdateWorkplaceAfterStaffChangesService } from '@core/test-utils/MockUpdateWorkplaceAfterStaffChangesService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { UpdateVacanciesComponent } from './update-vacancies.component';
import { of } from 'rxjs';

fdescribe('UpdateVacanciesComponent', () => {
  const sixRegisterNursesAndFourSocialWorkers: Vacancy[] = [
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

  const radioButtonLabels = {
    No: 'There are no current staff vacancies',
    'Do not know': 'I do not know if there are any current staff vacancies',
  };

  const mockWorkplaceWithNoVacancies = establishmentBuilder({ overrides: { vacancies: jobOptionsEnum.NONE } });
  const mockWorkplaceWithVacanciesNotKnown = establishmentBuilder({
    overrides: { vacancies: jobOptionsEnum.DONT_KNOW },
  });

  const mockFreshWorkplace = establishmentBuilder({ overrides: { vacancies: null } });

  const setup = async (override: any = {}) => {
    const workplace = override.workplace ?? {};
    const selectedVacancies = override.vacanciesFromSelectJobRolePages ?? null;

    const setupTools = await render(UpdateVacanciesComponent, {
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
      of({ ...uid, vacancies: data.vacancies }),
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
      ...setupTools,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('rendering', () => {
    it('should show a page heading', async () => {
      const { getByRole } = await setup();
      const heading = getByRole('heading', { level: 1 });

      expect(heading.textContent).toEqual('Update your current staff vacancies');
    });

    it('should show a reveal text for "Why we ask for this information"', async () => {
      const { getByText } = await setup();

      const reveal = getByText('Why we ask for this information');
      const revealText = getByText(
        'To show DHSC and others how the level of staff vacancies and the number employed affects the sector over time.',
      );

      expect(reveal).toBeTruthy();
      expect(revealText).toBeTruthy();
    });

    it('should show a warning text to remind about subtract or remove vacancies', async () => {
      const { getByTestId } = await setup();
      const warningText = getByTestId('warning-text');
      const expectedTextContent = 'Remember to SUBTRACT or REMOVE any that are no longer vacancies.';

      expect(warningText.textContent).toContain(expectedTextContent);
    });

    it('should show an "Add more job roles" button', async () => {
      const { getByRole } = await setup();
      const addButton = getByRole('button', { name: 'Add more job roles' });

      expect(addButton).toBeTruthy();
    });

    it('should show the total number of vacancies', async () => {
      const mockWorkplace = establishmentBuilder({ overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers } });
      const { fixture, getByTestId } = await setup({ workplace: mockWorkplace });

      fixture.detectChanges();
      const totalNumber = getByTestId('total-number');
      expect(totalNumber.textContent).toEqual('10');
    });

    it('should show a radio button for "No", and another for "I do not know"', async () => {
      const { getByLabelText } = await setup();

      expect(getByLabelText('There are no current staff vacancies')).toBeTruthy();
      expect(getByLabelText('I do not know if there are any current staff vacancies')).toBeTruthy();
    });

    it('should show a "Save and return" CTA button and a Cancel link', async () => {
      const { getByRole, getByText } = await setup();

      expect(getByRole('button', { name: 'Save and return' })).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    describe('prefill', () => {
      describe('before adding new job roles', () => {
        it('should show a number input and a remove button for every vacancy job role from database', async () => {
          const mockWorkplace = establishmentBuilder({
            overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers },
          });
          const { getByLabelText, getByTestId } = await setup({ workplace: mockWorkplace });

          const numberInputForNurse = getByLabelText('Registered nurse') as HTMLInputElement;
          expect(numberInputForNurse).toBeTruthy();
          expect(numberInputForNurse.value).toEqual('6');
          expect(getByTestId('remove-button-Registered nurse')).toBeTruthy();

          const numberInputForSocialWorkers = getByLabelText('Social worker') as HTMLInputElement;
          expect(numberInputForSocialWorkers).toBeTruthy();
          expect(numberInputForSocialWorkers.value).toEqual('4');
        });

        it('should select the "No" radio button and display no job roles if user previously selected "No"', async () => {
          const { getByLabelText, getByTestId } = await setup({ workplace: mockWorkplaceWithNoVacancies });

          const radioButton = getByLabelText(radioButtonLabels.No) as HTMLInputElement;
          expect(radioButton.checked).toBe(true);
          expect(getByTestId('total-number').textContent).toEqual('0');
        });
      });

      describe('after adding new add roles', () => {
        it('should show every vacancy job role that user selected in accordion page', async () => {
          const { getByLabelText } = await setup({
            vacanciesFromSelectJobRolePages: [
              { jobId: 10, title: 'Care worker', total: 1 },
              { jobId: 27, title: 'Registered nurse', total: 1 },
            ],
          });

          const numberInputForCareWorker = getByLabelText('Care worker') as HTMLInputElement;
          expect(numberInputForCareWorker).toBeTruthy();
          expect(numberInputForCareWorker.value).toEqual('1');

          const numberInputForNurse = getByLabelText('Registered nurse') as HTMLInputElement;
          expect(numberInputForNurse).toBeTruthy();
          expect(numberInputForNurse.value).toEqual('1');
        });

        it('should show no job role selected instead of prefill from backend data, if user did not select any job roles in accordion page', async () => {
          const mockWorkplace = establishmentBuilder({
            overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers },
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

  describe('interaction', () => {
    it('should update the total number when the vacancy number of a job role is changed', async () => {
      const mockWorkplace = establishmentBuilder({ overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers } });
      const { fixture, getByLabelText, getByTestId } = await setup({ workplace: mockWorkplace });

      const numberInputForNurse = getByLabelText('Registered nurse') as HTMLInputElement;
      userEvent.clear(numberInputForNurse);
      userEvent.type(numberInputForNurse, '10');

      fixture.detectChanges();

      const totalNumber = getByTestId('total-number');
      expect(totalNumber.textContent).toEqual('14');
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
        const mockWorkplace = establishmentBuilder({ overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers } });
        const { fixture, getByRole, updateWorkplaceAfterStaffChangesService } = await setup({
          workplace: mockWorkplace,
        });

        const addButton = getByRole('button', { name: 'Add more job roles' });
        userEvent.click(addButton);

        fixture.detectChanges();

        expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual(
          sixRegisterNursesAndFourSocialWorkers,
        );
      });

      it('should bring along any changes made by user in current page', async () => {
        const mockWorkplace = establishmentBuilder({ overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers } });
        const { fixture, getByRole, getByTestId, getByLabelText, updateWorkplaceAfterStaffChangesService } =
          await setup({
            workplace: mockWorkplace,
          });

        const removeButtonForNurse = getByTestId('remove-button-Registered nurse');
        userEvent.click(removeButtonForNurse);

        const numberInputForSocialWorker = getByLabelText('Social worker') as HTMLInputElement;
        userEvent.clear(numberInputForSocialWorker);
        userEvent.type(numberInputForSocialWorker, '5');

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
        const mockWorkplace = establishmentBuilder({ overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers } });
        const { fixture, queryByText, queryByLabelText, getByTestId } = await setup({ workplace: mockWorkplace });

        const removeButtonForNurse = getByTestId('remove-button-Registered nurse');
        userEvent.click(removeButtonForNurse);

        fixture.detectChanges();

        expect(queryByText('Registered nurse')).toBeFalsy();
        expect(queryByLabelText('Registered nurse')).toBeFalsy();
      });

      it('should update the total number', async () => {
        const mockWorkplace = establishmentBuilder({ overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers } });
        const { fixture, getByTestId } = await setup({ workplace: mockWorkplace });

        const removeButtonForNurse = getByTestId('remove-button-Registered nurse');
        const removeButtonForSocialWorker = getByTestId('remove-button-Social worker');
        const totalNumber = getByTestId('total-number');

        userEvent.click(removeButtonForNurse);
        fixture.detectChanges();
        expect(totalNumber.textContent).toEqual('4');

        userEvent.click(removeButtonForSocialWorker);
        fixture.detectChanges();
        expect(totalNumber.textContent).toEqual('0');
      });
    });

    describe('radio buttons for "No" and "Do not know"', () => {
      Object.entries(radioButtonLabels).forEach(([option, label]) => {
        it(`should remove all selected job roles when user clicked the radio button for "${option}"`, async () => {
          const mockWorkplace = establishmentBuilder({
            overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers },
          });
          const { fixture, queryByText, queryByLabelText, getByLabelText, getByTestId } = await setup({
            workplace: mockWorkplace,
          });

          userEvent.click(getByLabelText(label));

          fixture.detectChanges();

          expect(queryByText('Registered nurse')).toBeFalsy();
          expect(queryByLabelText('Registered nurse')).toBeFalsy();

          expect(queryByText('Social worker')).toBeFalsy();
          expect(queryByLabelText('Social worker')).toBeFalsy();

          expect(getByTestId('total-number').textContent).toEqual('0');
        });
      });
    });
  });

  describe('submit form and validation', () => {
    it('should save the changes in job role selection and number', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers },
      });
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
        overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers },
      });
      const { getByLabelText, getByRole, updateJobsSpy } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByLabelText(radioButtonLabels.No));

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      expect(updateJobsSpy).toHaveBeenCalledWith(mockWorkplace.uid, { vacancies: jobOptionsEnum.NONE });
    });

    it('should navigate to the update-workplace-details page', async () => {
      const mockWorkplace = establishmentBuilder({
        overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers },
      });
      const { component, routerSpy, getByRole } = await setup({
        workplace: mockWorkplace,
      });

      userEvent.click(getByRole('button', { name: 'Save and return' }));

      // @ts-expect-error: TS2341: Property 'route' is private
      expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    });

    it('should clear the selectedVacancies value in UpdateWorkplaceAfterStaffChangesService', async () => {
      const { getByRole, getByLabelText, updateWorkplaceAfterStaffChangesService } = await setup({
        vacanciesFromSelectJobRolePages: [
          { jobId: 10, title: 'Care worker', total: 1 },
          { jobId: 27, title: 'Registered nurse', total: 1 },
        ],
      });

      const numberInputForCareWorker = getByLabelText('Care worker') as HTMLInputElement;
      userEvent.clear(numberInputForCareWorker);
      userEvent.type(numberInputForCareWorker, '10');

      userEvent.click(getByRole('button', { name: 'Save and return' }));
      expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual(null);
    });
  });

  it('should return to Check this information page when user clicked the cancel button', async () => {
    const mockWorkplace = establishmentBuilder({
      overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers },
    });
    const { component, getByText, updateJobsSpy, routerSpy, updateWorkplaceAfterStaffChangesService } = await setup({
      workplace: mockWorkplace,
    });

    userEvent.click(getByText('Cancel'));

    expect(updateJobsSpy).not.toHaveBeenCalled();
    // @ts-expect-error: TS2341: Property 'route' is private
    expect(routerSpy).toHaveBeenCalledWith(['../'], { relativeTo: component.route });
    expect(updateWorkplaceAfterStaffChangesService.selectedVacancies).toEqual(null);
  });
});
