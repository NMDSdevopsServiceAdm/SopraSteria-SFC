import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Establishment } from '@core/model/establishment.model';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockCqcStatusChangeService } from '@core/test-utils/MockCqcStatusChangeService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { WdfModule } from '@features/wdf/wdf-data-change/wdf.module';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { establishmentWithShareWith, establishmentWithWdfBuilder } from '../../../../../server/test/factories/models';
import { NewWorkplaceSummaryComponent } from './new-workplace-summary.component';

fdescribe('NewWorkplaceSummaryComponent', () => {
  const setup = async (shareWith = null) => {
    const { fixture, getByText, getByTestId, queryByTestId } = await render(NewWorkplaceSummaryComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, WdfModule],
      declarations: [],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: EstablishmentService,
          useClass: MockEstablishmentService,
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        {
          provide: CqcStatusChangeService,
          useClass: MockCqcStatusChangeService,
        },
      ],
      componentProperties: {
        wdfView: true,
        workplace: shareWith ? establishmentWithShareWith(shareWith) : (establishmentWithWdfBuilder() as Establishment),
        // return: { url: ['/'] },
      },
    });
    const component = fixture.componentInstance;

    return { component, fixture, getByText, getByTestId, queryByTestId };
  };

  it('should render a NewWorkplaceSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should render the sections', async () => {
    const { getByTestId } = await setup();

    expect(getByTestId('services-section')).toBeTruthy();
    expect(getByTestId('vacancies-and-turnover-section')).toBeTruthy();
    expect(getByTestId('recruitment-section')).toBeTruthy();
    expect(getByTestId('permissions-section')).toBeTruthy();
  });

  describe('Recruitment section', () => {
    describe('Advertising spend', () => {
      fit('should show dash and have Add information button on Advertising spend row when moneySpentOnAdvertisingInTheLastFourWeeksType is set to null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.workplace.moneySpentOnAdvertisingInTheLastFourWeeks = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const advertisingSpendRow = within(document.body).queryByTestId('advertising-spend');
        console.log(advertisingSpendRow.getAttribute('href'));
        expect(within(advertisingSpendRow).queryByText('Add')).toBeTruthy();
        expect(within(advertisingSpendRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on Advertising spend row when moneySpentOnAdvertisingInTheLastFourWeeksType has a value (answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const advertisingSpendRow = within(document.body).queryByTestId('advertising-spend');

        expect(
          within(advertisingSpendRow).getByText(`£${component.workplace.moneySpentOnAdvertisingInTheLastFourWeeks}`),
        ).toBeTruthy();
        expect(within(advertisingSpendRow).queryByText('Change')).toBeTruthy();
      });
    });

    describe('People interviewed', () => {
      it('should show dash and have Add information button on People Interviewed row when peopleInterviewedInTheLastFourWeeks is set to null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.workplace.peopleInterviewedInTheLastFourWeeks = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const peopleInterviewedRow = within(document.body).queryByTestId('people-interviewed');

        expect(within(peopleInterviewedRow).queryByText('Add')).toBeTruthy();
        expect(within(peopleInterviewedRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on People Interviewed row when peopleInterviewedInTheLastFourWeeks has a value (answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const peopleInterviewedRow = within(document.body).queryByTestId('people-interviewed');

        expect(
          within(peopleInterviewedRow).queryByText(component.workplace.peopleInterviewedInTheLastFourWeeks),
        ).toBeTruthy();
        expect(within(peopleInterviewedRow).queryByText('Change')).toBeTruthy();
      });
    });

    describe('Repeat training', () => {
      it('should show dash and have Add information button on  Repeat Training row when doNewStartersRepeatMandatoryTrainingFromPreviousEmployment is set to null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.workplace.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const repeatTrainingRow = within(document.body).queryByTestId('repeat-training');

        expect(within(repeatTrainingRow).queryByText('Add')).toBeTruthy();
        expect(within(repeatTrainingRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on  Repeat Training row when doNewStartersRepeatMandatoryTrainingFromPreviousEmployment has a value (answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const repeatTrainingRow = within(document.body).queryByTestId('repeat-training');

        expect(
          within(repeatTrainingRow).queryByText(
            component.workplace.doNewStartersRepeatMandatoryTrainingFromPreviousEmployment,
          ),
        ).toBeTruthy();
        expect(within(repeatTrainingRow).queryByText('Change')).toBeTruthy();
      });
    });

    describe('Accept care certificate', () => {
      it('should show dash and have Add information button on accept care certificate row when wouldYouAcceptCareCertificatesFromPreviousEmployment is set to null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.workplace.wouldYouAcceptCareCertificatesFromPreviousEmployment = null;
        component.canEditEstablishment = true;
        fixture.detectChanges();

        const acceptCareCertificateRow = within(document.body).queryByTestId('accept-care-certificate');

        expect(within(acceptCareCertificateRow).queryByText('Add')).toBeTruthy();
        expect(within(acceptCareCertificateRow).queryByText('-')).toBeTruthy();
      });

      it('should show Change button on accept care certificate row when wouldYouAcceptCareCertificatesFromPreviousEmployment has a value (answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const acceptCareCertificateRow = within(document.body).queryByTestId('accept-care-certificate');

        expect(
          within(acceptCareCertificateRow).queryByText(
            component.workplace.wouldYouAcceptCareCertificatesFromPreviousEmployment,
          ),
        ).toBeTruthy();
        expect(within(acceptCareCertificateRow).queryByText('Change')).toBeTruthy();
      });
    });
  });

  describe('Permissions section', () => {
    describe('Data sharing', () => {
      it('should show dash and have Add information button on Data sharing when cqc and localAuthorities set to null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        expect(dataSharing.innerHTML).toContain('Add');
        expect(dataSharing.innerHTML).toContain('-');
      });

      it('should show Local authorities and have Change button on Data sharing when localAuthorities set to true', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: true });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        expect(dataSharing.innerHTML).toContain('Change');
        expect(dataSharing.innerHTML).toContain('Local authorities');
      });

      it('should show CQC and have Change button on Data sharing when cqc set to true', async () => {
        const { component, fixture } = await setup({ cqc: true, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        expect(dataSharing.innerHTML).toContain('Change');
        expect(dataSharing.innerHTML).toContain('Care Quality Commission (CQC)');
      });

      it('should show Not sharing and have Change button on Data sharing when cqc and localAuthorities are set to false', async () => {
        const { component, fixture } = await setup({ cqc: false, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        expect(dataSharing.innerHTML).toContain('Change');
        expect(dataSharing.innerHTML).toContain('Not sharing');
      });

      it('should show Not sharing and have Change button on Data sharing when cqc is set to false and localAuthorities is null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: false, localAuthorities: null });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        expect(dataSharing.innerHTML).toContain('Change');
        expect(dataSharing.innerHTML).toContain('Not sharing');
      });

      it('should show Not sharing and have Change button on Data sharing when localAuthorities is set to false and cqc is null (not answered)', async () => {
        const { component, fixture } = await setup({ cqc: null, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        expect(dataSharing.innerHTML).toContain('Change');
        expect(dataSharing.innerHTML).toContain('Not sharing');
      });

      it('should not show Not sharing when one of cqc and localAuthorities is false and one is true', async () => {
        const { component, fixture } = await setup({ cqc: true, localAuthorities: false });

        component.canEditEstablishment = true;
        fixture.detectChanges();

        const dataSharing = within(document.body).queryByTestId('data-sharing');
        expect(dataSharing.innerHTML).toContain('Change');
        expect(dataSharing.innerHTML).not.toContain('Not sharing');
      });
    });
  });
});
