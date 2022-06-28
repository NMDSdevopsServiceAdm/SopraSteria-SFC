import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { EligibilityIconComponent } from '@shared/components/eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '@shared/components/inset-text/inset-text.component';
import { SummaryRecordValueComponent } from '@shared/components/summary-record-value/summary-record-value.component';
import { NumericAnswerPipe } from '@shared/pipes/numeric-answer.pipe';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, getByTestId, render, within } from '@testing-library/angular';

import { establishmentBuilder } from '../../../../../server/test/factories/models';
import { WorkplaceModule } from '../workplace.module';
import { ConfirmStaffRecruitmentComponent } from './confirm-staff-recruitment.component';

describe('ConfirmStaffRecruitmentComponent', () => {
  const establishment = establishmentBuilder();
  const setup = async () => {
    const { fixture, getByText, getAllByText, getByTestId, queryByTestId } = await render(
      ConfirmStaffRecruitmentComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WorkplaceModule],
        providers: [
          WindowRef,
          {
            provide: PermissionsService,
            useFactory: MockPermissionsService.factory(['canEditEstablishment']),
            deps: [HttpClient, Router, UserService],
          },

          {
            provide: EstablishmentService,
            useClass: MockEstablishmentService,
          },
        ],
        declarations: [
          ConfirmStaffRecruitmentComponent,
          InsetTextComponent,
          SummaryRecordValueComponent,
          NumericAnswerPipe,
          EligibilityIconComponent,
        ],
        componentProperties: {
          establishment: establishment as Establishment,
        },
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
      routerSpy,
      alertSpy,
      backServiceSpy,
    };
  };

  it('should create', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should display the title', async () => {
    const { getByText } = await setup();
    expect(getByText('Staff recruitment')).toBeTruthy();
  });

  it('should display all questions', async () => {
    const { getByText } = await setup();

    expect(getByText('Advertising spend')).toBeTruthy();
    expect(getByText('People interviewed')).toBeTruthy();
    expect(getByText('Repeat training')).toBeTruthy();
    expect(getByText('Accept Care Certificate')).toBeTruthy();
  });

  it('should prefill the form with the current data from the establishment service', async () => {
    const { component } = await setup();
    establishment.moneySpentOnAdvertisingInTheLastFourWeeks = '123';
    establishment.peopleInterviewedInTheLastFourWeeks = '42';

    expect(component.establishment.moneySpentOnAdvertisingInTheLastFourWeeks).toBe('123');
    expect(component.establishment.peopleInterviewedInTheLastFourWeeks).toBe('42');
    expect(component.establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment).toBe('Yes, always');
    expect(component.establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment).toBe('No, never');
  });

  it('should show the change link when moneySpentOnAdvertisingInTheLastFourWeek is not null and set the link to `recruitment-advertising-cost`', async () => {
    const { component, fixture } = await setup();

    component.moneySpentOnAdvertisingInTheLastFourWeek = establishment.moneySpentOnAdvertisingInTheLastFourWeeks;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const advertisingspendLastFourWeek = within(document.body).queryByTestId('advertisingSpend');

    expect(advertisingspendLastFourWeek.innerHTML).toContain('Change');
    expect(advertisingspendLastFourWeek.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/recruitment-advertising-cost"`,
    );
  });

  it('should show the add link when moneySpentOnAdvertisingInTheLastFourWeek is null and set the link to `recruitment-advertising-cost`', async () => {
    const { component, fixture } = await setup();

    component.moneySpentOnAdvertisingInTheLastFourWeek = null;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const advertisingspendLastFourWeek = within(document.body).queryByTestId('advertisingSpend');

    expect(advertisingspendLastFourWeek.innerHTML).toContain('Add');
    expect(advertisingspendLastFourWeek.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/recruitment-advertising-cost"`,
    );
  });

  it('should show the change link when peopleInterviewedInTheLastFourWeeks is not null and set the link to `number-of-interviews`', async () => {
    const { component, fixture } = await setup();

    component.peopleInterviewedInTheLastFourWeek = establishment.peopleInterviewedInTheLastFourWeeks;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const peopleInterviewedInTheLastFourWeeks = within(document.body).queryByTestId('peopleInterviewed');

    expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain('Change');
    expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/number-of-interviews"`,
    );
  });

  it('should show the add link when peopleInterviewedInTheLastFourWeeks is null and set the link to `number-of-interviews`', async () => {
    const { component, fixture } = await setup();

    component.peopleInterviewedInTheLastFourWeek = null;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const peopleInterviewedInTheLastFourWeeks = within(document.body).queryByTestId('peopleInterviewed');

    expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain('Add');
    expect(peopleInterviewedInTheLastFourWeeks.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/number-of-interviews"`,
    );
  });

  it('should show the change link when doNewStartersRepeatTraining is not null and set the link to `staff-recruitment-capture-training-requirement`', async () => {
    const { component, fixture } = await setup();

    component.doNewStartersRepeatTraining = establishment.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = within(document.body).queryByTestId(
      'repeatTraining',
    );

    expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain('Change');
    expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/staff-recruitment-capture-training-requirement"`,
    );
  });

  it('should show the add link when doNewStartersRepeatMandatoryTrainingFromPreviousEmployment is null and set the link to `staff-recruitment-capture-training-requirement`', async () => {
    const { component, fixture } = await setup();

    component.doNewStartersRepeatTraining = null;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = within(document.body).queryByTestId(
      'repeatTraining',
    );

    expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain('Add');
    expect(doNewStartersRepeatMandatoryTrainingFromPreviousEmployment.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/staff-recruitment-capture-training-requirement"`,
    );
  });

  it('should show the change link when wouldYouAcceptPreviousCertificates is not null and set the link to `accept-previous-care-certificate`', async () => {
    const { component, fixture } = await setup();

    component.wouldYouAcceptPreviousCertificates = establishment.wouldYouAcceptCareCertificatesFromPreviousEmployment;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const wouldYouAcceptCareCertificatesFromPreviousEmployment = within(document.body).queryByTestId(
      'acceptCareCertificate',
    );

    expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain('Change');
    expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/accept-previous-care-certificate"`,
    );
  });

  it('should show the add link when wouldYouAcceptPreviousCertificates is null and set the link to `accept-previous-care-certificate`', async () => {
    const { component, fixture } = await setup();

    component.wouldYouAcceptPreviousCertificates = null;
    component.canEditEstablishment = true;
    fixture.detectChanges();

    const wouldYouAcceptCareCertificatesFromPreviousEmployment = within(document.body).queryByTestId(
      'acceptCareCertificate',
    );

    expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain('Add');
    expect(wouldYouAcceptCareCertificatesFromPreviousEmployment.innerHTML).toContain(
      `href="/workplace/${establishment.uid}/accept-previous-care-certificate"`,
    );
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
    it(`should set the back link to the 'accept-previous-care-certificate' if user is not primary user`, async () => {
      const { component, backServiceSpy } = await setup();

      component.setBackLink();

      expect(backServiceSpy).toHaveBeenCalledWith({
        url: ['workplace', component.establishment.uid, 'accept-previous-care-certificate'],
      });
    });
  });
});
