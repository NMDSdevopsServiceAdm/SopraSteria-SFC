import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { EstablishmentService } from '@core/services/establishment.service';
import {
  DoYouWantToAddOrDeleteAnswer,
  VacanciesAndTurnoverService,
} from '@core/services/vacancies-and-turnover.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockVacanciesAndTurnoverService } from '@core/test-utils/MockVacanciesAndTurnoverService';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { DeleteAnotherStaffRecordComponent } from './delete-another-staff-record.component';

describe('DeleteAnotherStaffRecordComponent', () => {
  async function setup(overrides: any = {}) {
    const resetVisitedAndSubmittedPagesSpy = jasmine.createSpy('resetVisitedAndSubmittedPages');

    const setupTools = await render(DeleteAnotherStaffRecordComponent, {
      imports: [RouterTestingModule, ReactiveFormsModule],
      providers: [
        UntypedFormBuilder,
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: VacanciesAndTurnoverService,
          useFactory: MockVacanciesAndTurnoverService.factory({
            resetVisitedAndSubmittedPages: resetVisitedAndSubmittedPagesSpy,
            ...overrides.updateWorkplaceService,
          }),
        },
      provideHttpClient(), provideHttpClientTesting(),],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const navigateSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    const vacanciesAndTurnoverService = injector.inject(VacanciesAndTurnoverService) as VacanciesAndTurnoverService;
    const doYouWantToAddOrDeleteAnswerSpy = spyOnProperty(
      vacanciesAndTurnoverService,
      'doYouWantToAddOrDeleteAnswer',
      'set',
    );

    return {
      ...setupTools,
      component,
      navigateSpy,
      resetVisitedAndSubmittedPagesSpy,
      doYouWantToAddOrDeleteAnswerSpy,
    };
  }

  it('renders a component', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('displays the header text', async () => {
    const { getByText } = await setup();

    expect(getByText('Do you want to delete another staff record?')).toBeTruthy();
  });

  it('displays the section text', async () => {
    const { getByText } = await setup();

    expect(getByText('Staff records')).toBeTruthy();
  });

  it('displays the yes/no radio buttons', async () => {
    const { getByLabelText } = await setup();

    const yesRadioButton = getByLabelText('Yes');
    const noRadioButton = getByLabelText('No');

    expect(yesRadioButton).toBeTruthy();
    expect(noRadioButton).toBeTruthy();
  });

  describe('continue button', () => {
    it('is rendered', async () => {
      const { getByText } = await setup();
      expect(getByText('Continue')).toBeTruthy();
    });

    it(`navigates to staff record flow when 'yes' is selected`, async () => {
      const { fixture, getByText, navigateSpy } = await setup();

      userEvent.click(getByText('Yes'));
      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
    });

    it(`navigates to staff changes summary when 'no' is selected`, async () => {
      const { fixture, getByText, navigateSpy } = await setup();

      userEvent.click(getByText('No'));
      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        'update-workplace-details-after-deleting-staff',
      ]);
    });

    it(`navigates to staff changes summary when neither option is selected`, async () => {
      const { fixture, getByText, navigateSpy } = await setup();

      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        'update-workplace-details-after-deleting-staff',
      ]);
    });

    it('should call resetVisitedAndSubmittedPages when navigating to staff changes summary', async () => {
      const { getByText, resetVisitedAndSubmittedPagesSpy } = await setup();

      userEvent.click(getByText('Continue'));

      expect(resetVisitedAndSubmittedPagesSpy).toHaveBeenCalled();
    });
  });

  describe('Prefilling radio buttons when user has navigated back to page', () => {
    it('should prefill yes radio button when doYouWantToAddOrDeleteAnswer is yes in service', async () => {
      const { getByLabelText } = await setup({
        updateWorkplaceService: { doYouWantToAddOrDeleteAnswer: DoYouWantToAddOrDeleteAnswer.YES },
      });

      const yesRadioButton = getByLabelText(DoYouWantToAddOrDeleteAnswer.YES) as HTMLInputElement;

      expect(yesRadioButton.checked).toBeTruthy();
    });

    it('should prefill no radio button when doYouWantToAddOrDeleteAnswer is no in service', async () => {
      const { getByLabelText } = await setup({
        updateWorkplaceService: { doYouWantToAddOrDeleteAnswer: DoYouWantToAddOrDeleteAnswer.NO },
      });

      const noRadioButton = getByLabelText(DoYouWantToAddOrDeleteAnswer.NO) as HTMLInputElement;

      expect(noRadioButton.checked).toBeTruthy();
    });

    it('should not prefill either radio button when doYouWantToAddOrDeleteAnswer is null in service', async () => {
      const { getByLabelText } = await setup({
        updateWorkplaceService: { doYouWantToAddOrDeleteAnswer: null },
      });

      const yesRadioButton = getByLabelText('Yes') as HTMLInputElement;
      const noRadioButton = getByLabelText('No') as HTMLInputElement;

      expect(yesRadioButton.checked).toBeFalsy();
      expect(noRadioButton.checked).toBeFalsy();
    });

    it('should set doYouWantToAddOrDeleteAnswer as Yes in service when Yes submitted', async () => {
      const { getByLabelText, getByText, doYouWantToAddOrDeleteAnswerSpy } = await setup();

      const yesRadioButton = getByLabelText('Yes') as HTMLInputElement;
      userEvent.click(yesRadioButton);
      userEvent.click(getByText('Continue'));

      expect(doYouWantToAddOrDeleteAnswerSpy).toHaveBeenCalledWith(DoYouWantToAddOrDeleteAnswer.YES);
    });

    it('should set doYouWantToAddOrDeleteAnswer as No in service when No submitted', async () => {
      const { getByLabelText, getByText, doYouWantToAddOrDeleteAnswerSpy } = await setup();

      const noRadioButton = getByLabelText('No') as HTMLInputElement;
      userEvent.click(noRadioButton);
      userEvent.click(getByText('Continue'));

      expect(doYouWantToAddOrDeleteAnswerSpy).toHaveBeenCalledWith(DoYouWantToAddOrDeleteAnswer.NO);
    });
  });
});