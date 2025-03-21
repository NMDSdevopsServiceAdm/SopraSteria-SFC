import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UpdateWorkplaceAfterStaffChangesService } from '@core/services/update-workplace-after-staff-changes.service';
import { MockUpdateWorkplaceAfterStaffChangesService } from '@core/test-utils/MockUpdateWorkplaceAfterStaffChangesService';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { UpdateVacanciesComponent } from './update-vacancies.component';
import { EstablishmentService } from '@core/services/establishment.service';
import { establishmentBuilder, MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { jobOptionsEnum, Vacancy } from '@core/model/establishment.model';
import userEvent from '@testing-library/user-event';

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

  const mockWorkplaceWithNoVacancies = establishmentBuilder({ overrides: { vacancies: jobOptionsEnum.NONE } });

  const mockFreshWorkplace = establishmentBuilder({ overrides: { vacancies: null } });

  const setup = async (override: any = {}) => {
    const workplace = override.workplace ?? {};

    const setupTools = await render(UpdateVacanciesComponent, {
      imports: [SharedModule, RouterModule, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: UpdateWorkplaceAfterStaffChangesService,
          useFactory: MockUpdateWorkplaceAfterStaffChangesService.factory(),
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

    it('should show a number input and a remove button for every vacancy job role that already exist', async () => {
      const mockWorkplace = establishmentBuilder({ overrides: { vacancies: sixRegisterNursesAndFourSocialWorkers } });
      const { getByLabelText, getByTestId } = await setup({ workplace: mockWorkplace });

      const numberInputForNurse = getByLabelText('Registered nurse') as HTMLInputElement;
      expect(numberInputForNurse).toBeTruthy();
      expect(numberInputForNurse.value).toEqual('6');
      expect(getByTestId('remove-button-Registered nurse')).toBeTruthy();

      const numberInputForSocialWorkers = getByLabelText('Social worker') as HTMLInputElement;
      expect(numberInputForSocialWorkers).toBeTruthy();
      expect(numberInputForSocialWorkers.value).toEqual('4');
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
  });
});
