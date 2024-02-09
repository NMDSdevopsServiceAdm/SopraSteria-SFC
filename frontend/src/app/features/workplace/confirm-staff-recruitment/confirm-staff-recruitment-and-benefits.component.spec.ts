import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render, within } from '@testing-library/angular';

import { WorkplaceModule } from '../workplace.module';
import { ConfirmStaffRecruitmentAndBenefitsComponent } from './confirm-staff-recruitment-and-benefits.component';

describe('ConfirmStaffRecruitmentAndBenefitsComponent', () => {
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByTestId, queryByText } = await render(
      ConfirmStaffRecruitmentAndBenefitsComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkplaceModule],
        providers: [
          WindowRef,
          BackService,
          AlertService,
          {
            provide: PermissionsService,
            useFactory: MockPermissionsService.factory(['canEditEstablishment']),
            deps: [HttpClient, Router, UserService],
          },

          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
          { provide: WorkerService, useClass: MockWorkerService },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate');
    routerSpy.and.returnValue(Promise.resolve(true));

    const alert = injector.inject(AlertService) as AlertService;
    const alertSpy = spyOn(alert, 'addAlert');
    alertSpy.and.callThrough();

    const backService = injector.inject(BackService) as BackService;
    const backServiceSpy = spyOn(backService, 'setBackLink');
    backServiceSpy.and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getAllByText,
      getByTestId,
      queryByTestId,
      queryByText,
      routerSpy,
      alertSpy,
      backServiceSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('Staff recruitment questions', () => {
    it('should display all questions', async () => {
      const { getByText } = await setup();

      expect(getByText('Advertising spend')).toBeTruthy();
      expect(getByText('People interviewed')).toBeTruthy();
      expect(getByText('Repeat training')).toBeTruthy();
      expect(getByText('Accept Care Certificate')).toBeTruthy();
    });

    it('should prefill the form with the current data from the establishment service', async () => {
      const { component } = await setup();

      expect(component.establishment.moneySpentOnAdvertisingInTheLastFourWeeks).toBe('78');
      expect(component.establishment.peopleInterviewedInTheLastFourWeeks).toBe('None');
      expect(component.establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).toBe('No, never');
      expect(component.establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment).toBe('No, never');
    });

    describe('Change links staff recruitment', () => {
      it('should show the change link when moneySpentOnAdvertisingInTheLastFourWeek is not null and set the link to `recruitment-advertising-cost`', async () => {
        await setup();

        const advertisingspendLastFourWeek = within(document.body).queryByTestId('advertisingSpend');

        expect(advertisingspendLastFourWeek.innerHTML).toContain('Change');
        expect(advertisingspendLastFourWeek.innerHTML).toContain(
          `href="/workplace/mocked-uid/recruitment-advertising-cost"`,
        );
      });

      it('should show the add link when moneySpentOnAdvertisingInTheLastFourWeek is null and set the link to `recruitment-advertising-cost`', async () => {
        const { component, fixture } = await setup();

        component.establishment.moneySpentOnAdvertisingInTheLastFourWeeks = undefined;
        fixture.detectChanges();

        const advertisingspendLastFourWeek = within(document.body).queryByTestId('advertisingSpend');

        expect(advertisingspendLastFourWeek.innerHTML).toContain('Add');
        expect(advertisingspendLastFourWeek.innerHTML).toContain(
          `href="/workplace/mocked-uid/recruitment-advertising-cost"`,
        );
      });

      it('should show the change link when peopleInterviewedInTheLastFourWeeks is not null and set the link to `number-of-interviews`', async () => {
        await setup();

        const peopleInterviewedInTheLastFourWeeks = within(document.body).queryByTestId('peopleInterviewed');

        expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain('Change');
        expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain(
          `href="/workplace/mocked-uid/number-of-interviews"`,
        );
      });

      it('should show the add link when peopleInterviewedInTheLastFourWeeks is null and set the link to `number-of-interviews`', async () => {
        const { component, fixture } = await setup();

        component.establishment.peopleInterviewedInTheLastFourWeeks = null;
        fixture.detectChanges();
        const peopleInterviewedInTheLastFourWeeks = within(document.body).queryByTestId('peopleInterviewed');

        expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain('Add');
        expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain(
          `href="/workplace/mocked-uid/number-of-interviews"`,
        );
      });

      it('should show the change link when doNewStartersRepeatTraining is not null and set the link to `staff-recruitment-capture-training-requirement`', async () => {
        await setup();

        const doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = within(document.body).queryByTestId(
          'repeatTraining',
        );

        expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain('Change');
        expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain(
          `href="/workplace/mocked-uid/staff-recruitment-capture-training-requirement"`,
        );
      });

      it('should show the add link when doNewStartersRepeatMandatoryTrainingFromPreviousEmployment is null and set the link to `staff-recruitment-capture-training-requirement`', async () => {
        const { component, fixture } = await setup();

        component.establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = null;
        fixture.detectChanges();
        const doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = within(document.body).queryByTestId(
          'repeatTraining',
        );

        expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain('Add');
        expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain(
          `href="/workplace/mocked-uid/staff-recruitment-capture-training-requirement"`,
        );
      });

      it('should show the change link when wouldYouAcceptPreviousCertificates is not null and set the link to `accept-previous-care-certificate`', async () => {
        await setup();

        const wouldYouAcceptCareCertificatesFromPreviousEmployment = within(document.body).queryByTestId(
          'acceptCareCertificate',
        );

        expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain('Change');
        expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain(
          `href="/workplace/mocked-uid/accept-previous-care-certificate"`,
        );
      });

      it('should show the add link when wouldYouAcceptPreviousCertificates is null and set the link to `accept-previous-care-certificate`', async () => {
        const { component, fixture } = await setup();

        component.establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment = null;
        fixture.detectChanges();
        const wouldYouAcceptCareCertificatesFromPreviousEmployment = within(document.body).queryByTestId(
          'acceptCareCertificate',
        );

        expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain('Add');
        expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain(
          `href="/workplace/mocked-uid/accept-previous-care-certificate"`,
        );
      });
    });
  });

  describe('Staff benefits questions', () => {
    it('should display all questions', async () => {
      const { getByText } = await setup();

      expect(getByText('Cash loyalty bonus')).toBeTruthy();
      expect(getByText('Offer more than Statutory Sick Pay')).toBeTruthy();
      expect(getByText('Higher pension contributions')).toBeTruthy();
      expect(getByText('Number of days leave')).toBeTruthy();
    });

    it('should prefill the form with the current data from the establishment service', async () => {
      const { component } = await setup();

      expect(component.establishment.careWorkersCashLoyaltyForFirstTwoYears).toBe('No');
      expect(component.establishment.sickPay).toBe('No');
      expect(component.establishment.pensionContribution).toBe('No');
      expect(component.establishment.careWorkersLeaveDaysPerYear).toBe('35');
    });

    describe('change links benefits', () => {
      it('should show the change link when careWorkersCashLoyaltyForFirstTwoYears is not null and set the link to `cash-loyalty`', async () => {
        await setup();

        const careWorkersCashLoyaltyForFirstTwoYears = within(document.body).queryByTestId('cashLoyaltyBonusSpend');

        expect(careWorkersCashLoyaltyForFirstTwoYears.innerHTML).toContain('Change');
        expect(careWorkersCashLoyaltyForFirstTwoYears.innerHTML).toContain(`href="/workplace/mocked-uid/cash-loyalty"`);
      });

      it('should show the add link when careWorkersCashLoyaltyForFirstTwoYears is null and set the link to `cash-loyalty`', async () => {
        const { component, fixture } = await setup();

        component.establishment.careWorkersCashLoyaltyForFirstTwoYears = null;
        fixture.detectChanges();

        const careWorkersCashLoyaltyForFirstTwoYears = within(document.body).queryByTestId('cashLoyaltyBonusSpend');

        expect(careWorkersCashLoyaltyForFirstTwoYears.innerHTML).toContain('Add');
        expect(careWorkersCashLoyaltyForFirstTwoYears.innerHTML).toContain(`href="/workplace/mocked-uid/cash-loyalty"`);
      });

      it('should show the add link when moneySpentOnAdvertisingInTheLastFourWeek is null and set the link to `recruitment-advertising-cost`', async () => {
        const { component, fixture } = await setup();

        component.establishment.moneySpentOnAdvertisingInTheLastFourWeeks = null;
        fixture.detectChanges();

        const advertisingspendLastFourWeek = within(document.body).queryByTestId('advertisingSpend');

        expect(advertisingspendLastFourWeek.innerHTML).toContain('Add');
        expect(advertisingspendLastFourWeek.innerHTML).toContain(
          `href="/workplace/mocked-uid/recruitment-advertising-cost"`,
        );
      });

      it('should show the change link when sickPay is not null and set the link to `benefits-statutory-sick-pay`', async () => {
        await setup();

        const sickPay = within(document.body).queryByTestId('offerMoreThanStatutorySickPay');

        expect(sickPay.innerHTML).toContain('Change');
        expect(sickPay.innerHTML).toContain(`href="/workplace/mocked-uid/benefits-statutory-sick-pay"`);
      });

      it('should show the add link when sickPay is null and set the link to `benefits-statutory-sick-pay`', async () => {
        const { component, fixture } = await setup();

        component.establishment.sickPay = null;
        fixture.detectChanges();

        const sickPay = within(document.body).queryByTestId('offerMoreThanStatutorySickPay');

        expect(sickPay.innerHTML).toContain('Add');
        expect(sickPay.innerHTML).toContain(`href="/workplace/mocked-uid/benefits-statutory-sick-pay"`);
      });

      it('should show the change link when higherPensionContribution is not null and set the link to `pensions`', async () => {
        await setup();

        const higherPensionContribution = within(document.body).queryByTestId('higherPensionContributions');

        expect(higherPensionContribution.innerHTML).toContain('Change');
        expect(higherPensionContribution.innerHTML).toContain(`href="/workplace/mocked-uid/pensions"`);
      });

      it('should show the add link when higherPensionContribution is null and set the link to `pensions`', async () => {
        const { component, fixture } = await setup();

        component.establishment.pensionContribution = null;
        fixture.detectChanges();

        const higherPensionContribution = within(document.body).queryByTestId('higherPensionContributions');

        expect(higherPensionContribution.innerHTML).toContain('Add');
        expect(higherPensionContribution.innerHTML).toContain(`href="/workplace/mocked-uid/pensions"`);
      });

      it('should show the change link when careWorkersLeaveDaysPerYear is not null and set the link to `staff-benefit-holiday-leave`', async () => {
        await setup();

        const careWorkersLeaveDaysPerYear = within(document.body).queryByTestId('numberOfDaysLeave');

        expect(careWorkersLeaveDaysPerYear.innerHTML).toContain('Change');
        expect(careWorkersLeaveDaysPerYear.innerHTML).toContain(
          `href="/workplace/mocked-uid/staff-benefit-holiday-leave"`,
        );
      });

      it('should show the add link when careWorkersLeaveDaysPerYear is null and set the link to `staff-benefit-holiday-leave`', async () => {
        const { component, fixture } = await setup();

        component.establishment.careWorkersLeaveDaysPerYear = null;
        fixture.detectChanges();

        const careWorkersLeaveDaysPerYear = within(document.body).queryByTestId('numberOfDaysLeave');

        expect(careWorkersLeaveDaysPerYear.innerHTML).toContain('Add');
        expect(careWorkersLeaveDaysPerYear.innerHTML).toContain(
          `href="/workplace/mocked-uid/staff-benefit-holiday-leave"`,
        );
      });
    });
  });

  describe('onSuccess', () => {
    it('should display an alert when the "Confirm your answers" button is clicked', async () => {
      const { getByText, fixture, alertSpy } = await setup();

      const confirmAndReturnButton = getByText('Confirm your answers');
      fireEvent.click(confirmAndReturnButton);

      await fixture.whenStable();
      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: `Your answers have been saved with your 'Workplace' information`,
      });
    });
  });

  describe('Back link', () => {
    it(`should set the back link to the 'staff-benefit-holiday-leave' if user is not primary user`, async () => {
      const { component, backServiceSpy } = await setup();

      component.setBackLink();

      expect(backServiceSpy).toHaveBeenCalledWith({
        url: ['workplace', component.establishment.uid, 'staff-benefit-holiday-leave'],
      });
    });
  });
});
