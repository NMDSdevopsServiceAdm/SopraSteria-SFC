import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Eligibility } from '@core/model/wdf.model';
import { CqcStatusChangeService } from '@core/services/cqc-status-change.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WorkerService } from '@core/services/worker.service';
import { MockCqcStatusChangeService } from '@core/test-utils/MockCqcStatusChangeService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { WdfModule } from '@features/wdf/wdf.module';
import { NumericAnswerPipe } from '@shared/pipes/numeric-answer.pipe';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';

import { establishmentWithShareWith, establishmentWithWdfBuilder } from '../../../../../server/test/factories/models';
import { Establishment } from '../../../../mockdata/establishment';
import { EligibilityIconComponent } from '../eligibility-icon/eligibility-icon.component';
import { InsetTextComponent } from '../inset-text/inset-text.component';
import { SummaryRecordValueComponent } from '../summary-record-value/summary-record-value.component';
import { WorkplaceSummaryComponent } from './workplace-summary.component';

describe('WorkplaceSummaryComponent', async () => {
  const setup = async (shareWith = null) => {
    const { fixture, getByText, queryByText } = await render(WorkplaceSummaryComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, BrowserModule, WdfModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditEstablishment']),
          deps: [HttpClient, Router, UserService],
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        { provide: WorkerService, useClass: MockWorkerService },
        { provide: CqcStatusChangeService, useClass: MockCqcStatusChangeService },
      ],
      declarations: [
        WorkplaceSummaryComponent,
        InsetTextComponent,
        SummaryRecordValueComponent,
        NumericAnswerPipe,
        EligibilityIconComponent,
      ],
      componentProperties: {
        wdfView: true,
        workplace: shareWith ? establishmentWithShareWith(shareWith) : (establishmentWithWdfBuilder() as Establishment),
      },
    });

    const component = fixture.componentInstance;

    return { component, fixture, getByText, queryByText };
  };

  it('should create', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('Main service states', async () => {
    it('should show Pending on main service when non-CQC to CQC main service change has been requested', async () => {
      const { component, fixture } = await setup();

      component.cqcStatusRequested = true;
      component.canEditEstablishment = true;
      fixture.detectChanges();

      const mainServiceChangeOrPending = within(document.body).queryByTestId('main-service-change-or-pending');
      expect(mainServiceChangeOrPending.innerHTML).toContain('Pending');
    });

    it('should show Change on main service when non-CQC to CQC main service change has NOT been requested', async () => {
      const { component, fixture } = await setup();

      component.cqcStatusRequested = false;
      component.canEditEstablishment = true;
      fixture.detectChanges();

      const mainServiceChangeOrPending = within(document.body).queryByTestId('main-service-change-or-pending');
      expect(mainServiceChangeOrPending.innerHTML).toContain('Change');
    });

    it('should show requested service name when non-CQC to CQC main service change has been requested', async () => {
      const { component, fixture } = await setup();

      component.cqcStatusRequested = true;
      component.requestedServiceName = 'Requested service name';
      fixture.detectChanges();

      const mainServiceName = within(document.body).queryByTestId('main-service-name');
      expect(mainServiceName.innerHTML).toContain(component.requestedServiceName);
      expect(mainServiceName.innerHTML).not.toContain(component.workplace.mainService.name);
    });

    it('should show existing service name when non-CQC to CQC main service change has NOT been requested', async () => {
      const { component, fixture } = await setup();

      component.cqcStatusRequested = false;
      fixture.detectChanges();

      const mainServiceName = within(document.body).queryByTestId('main-service-name');
      expect(mainServiceName.innerHTML).toContain(component.workplace.mainService.name);
      expect(mainServiceName.innerHTML).not.toContain(component.requestedServiceName);
    });
  });

  describe('Data sharing states', async () => {
    it('should show dash and have Add information button on Data sharing when cqc and localAuthorities set to null (not answered)', async () => {
      const { component, fixture } = await setup({ cqc: null, localAuthorities: null });

      component.canEditEstablishment = true;
      fixture.detectChanges();

      const dataSharing = within(document.body).queryByTestId('data-sharing');
      expect(dataSharing.innerHTML).toContain('Add information');
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

  describe('Staff records banner', async () => {
    it('should show banner if you have more staff records', async () => {
      const { component, fixture } = await setup();

      component.workerCount = 10;
      component.workplace.numberOfStaff = 9;
      component.wdfView = false;
      component.canViewListOfWorkers = true;
      fixture.detectChanges();

      const moreRecords = within(document.body).queryByTestId('morerecords');
      expect(moreRecords.innerHTML).toContain("You've more staff records than staff");
      expect(moreRecords.innerHTML).toContain('View staff records');
    });

    it('should show banner if you have more total staff', async () => {
      const { component, fixture } = await setup();

      component.workerCount = 8;
      component.workplace.numberOfStaff = 9;
      component.wdfView = false;
      component.canViewListOfWorkers = true;
      fixture.detectChanges();

      const moreRecords = within(document.body).queryByTestId('morerecords');
      expect(moreRecords.innerHTML).toContain("You've more staff than staff records");
    });

    it('should show banner if you have more staff records and 0 staff', async () => {
      const { component, fixture } = await setup();

      component.workerCount = 10;
      component.workplace.numberOfStaff = 0;
      component.wdfView = false;
      component.canViewListOfWorkers = true;
      fixture.detectChanges();

      const moreRecords = within(document.body).queryByTestId('morerecords');
      expect(moreRecords.innerHTML).toContain("You've more staff records than staff");
    });

    it("should not show banner if you don't have permission to list workers", async () => {
      const { component, fixture } = await setup();

      component.workerCount = 10;
      component.workplace.numberOfStaff = 9;
      component.wdfView = false;
      component.canViewListOfWorkers = false;
      fixture.detectChanges();

      const moreRecords = within(document.body).queryByTestId('morerecords');
      expect(moreRecords).toBe(null);
    });

    it('should not show banner if it is the WDF View', async () => {
      const { component, fixture } = await setup();

      component.workerCount = 10;
      component.workplace.numberOfStaff = 9;
      component.wdfView = true;
      component.canViewListOfWorkers = true;
      fixture.detectChanges();

      const moreRecords = within(document.body).queryByTestId('morerecords');
      expect(moreRecords).toBe(null);
    });
  });

  describe('WDF Field Confirmation', async () => {
    it('should not show WdfFieldConfirmation component when fields do not need to be confirmed', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
    });

    describe('New starters field confirmation', async () => {
      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Starters', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.starters.isEligible = Eligibility.YES;
        component.workplace.wdf.starters.updatedSinceEffectiveDate = false;
        component.workplace.starters = [
          {
            jobId: 4,
            title: 'Allied Health Professional (not Occupational Therapist)',
            total: 3,
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Starters', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.starters.isEligible = Eligibility.YES;
        component.workplace.wdf.starters.updatedSinceEffectiveDate = false;
        component.workplace.starters = [
          {
            jobId: 4,
            title: 'Allied Health Professional (not Occupational Therapist)',
            total: 3,
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('Main Service field confirmation', async () => {
      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Main Service', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.mainService.isEligible = Eligibility.YES;
        component.workplace.wdf.mainService.updatedSinceEffectiveDate = false;

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Main Service', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.mainService.isEligible = Eligibility.YES;
        component.workplace.wdf.mainService.updatedSinceEffectiveDate = false;

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('Staff leavers field confirmation', async () => {
      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Staff Leavers', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.leavers.isEligible = Eligibility.YES;
        component.workplace.wdf.leavers.updatedSinceEffectiveDate = false;
        component.workplace.leavers = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Staff Leavers', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.leavers.isEligible = Eligibility.YES;
        component.workplace.wdf.leavers.updatedSinceEffectiveDate = false;
        component.workplace.leavers = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('Current staff vacancies field confirmation', async () => {
      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Current Staff Vacancies', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.vacancies.isEligible = Eligibility.YES;
        component.workplace.wdf.vacancies.updatedSinceEffectiveDate = false;
        component.workplace.vacancies = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Current Staff Vacancies', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.vacancies.isEligible = Eligibility.YES;
        component.workplace.wdf.vacancies.updatedSinceEffectiveDate = false;
        component.workplace.vacancies = [
          {
            jobId: 1,
            title: 'Activities worker or co-ordinator',
            total: 1,
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('Service capacity field confirmation', async () => {
      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Service capacity', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.capacities.isEligible = Eligibility.YES;
        component.workplace.wdf.capacities.updatedSinceEffectiveDate = false;
        component.hasCapacity = true;
        component.workplace.capacities = [
          {
            answer: 6,
            question: 'Number of people receiving care on the completion date',
            questionId: 16,
            seq: 0,
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Service capacity', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.capacities.isEligible = Eligibility.YES;
        component.workplace.wdf.capacities.updatedSinceEffectiveDate = false;
        component.hasCapacity = true;
        component.workplace.capacities = [
          {
            answer: 6,
            question: 'Number of people receiving care on the completion date',
            questionId: 16,
            seq: 0,
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('Service users field confirmation', async () => {
      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Service users', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.serviceUsers.isEligible = Eligibility.YES;
        component.workplace.wdf.serviceUsers.updatedSinceEffectiveDate = false;
        component.workplace.serviceUsers = [
          {
            group: 'Older people',
            id: 1,
            service: 'Older people with dementia',
          },
        ];

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Service users', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.serviceUsers.isEligible = Eligibility.YES;
        component.workplace.wdf.serviceUsers.updatedSinceEffectiveDate = false;
        component.workplace.serviceUsers = [
          {
            group: 'Older people',
            id: 1,
            service: 'Older people with dementia',
          },
        ];

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('Total Number of Staff field confirmation', async () => {
      it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Total Number of Staff', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.numberOfStaff.isEligible = Eligibility.YES;
        component.workplace.wdf.numberOfStaff.updatedSinceEffectiveDate = false;
        component.workplace.numberOfStaff = 2;
        component.workerCount = 2;

        fixture.detectChanges();

        expect(getByText('Is this still correct?')).toBeTruthy();
        expect(getByText('Yes, it is')).toBeTruthy();
        expect(getByText('No, change it')).toBeTruthy();
      });

      it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Total Number of Staff', async () => {
        const { component, fixture, getByText } = await setup();

        component.workplace.wdf.numberOfStaff.isEligible = Eligibility.YES;
        component.workplace.wdf.numberOfStaff.updatedSinceEffectiveDate = false;
        component.workplace.numberOfStaff = 2;
        component.workerCount = 2;

        fixture.detectChanges();

        const yesItIsButton = getByText('Yes, it is', { exact: false });
        yesItIsButton.click();

        fixture.detectChanges();

        expect(getByText('Meeting requirements')).toBeTruthy();
      });
    });

    describe('allRequiredFieldsUpdated', async () => {
      it('should return false when any required fields not updated since effective date and not confirmed', async () => {
        const { component, fixture } = await setup();

        component.workplace.wdf.numberOfStaff.updatedSinceEffectiveDate = false;
        component.workplace.wdf.employerType.updatedSinceEffectiveDate = true;
        component.workplace.wdf.leavers.updatedSinceEffectiveDate = true;
        component.workplace.wdf.mainService.updatedSinceEffectiveDate = true;
        component.workplace.wdf.serviceUsers.updatedSinceEffectiveDate = true;
        component.workplace.wdf.starters.updatedSinceEffectiveDate = true;
        component.workplace.wdf.vacancies.updatedSinceEffectiveDate = true;

        fixture.detectChanges();

        expect(component.allRequiredFieldsUpdated()).toBeFalse();
      });

      it('should return false when one required field not confirmed or updated since effective date', async () => {
        const { component, fixture } = await setup();

        component.workplace.wdf.numberOfStaff.updatedSinceEffectiveDate = false;
        component.workplace.wdf.employerType.updatedSinceEffectiveDate = false;
        component.workplace.wdf.leavers.updatedSinceEffectiveDate = false;
        component.workplace.wdf.mainService.updatedSinceEffectiveDate = true;
        component.workplace.wdf.serviceUsers.updatedSinceEffectiveDate = true;
        component.workplace.wdf.starters.updatedSinceEffectiveDate = true;
        component.workplace.wdf.vacancies.updatedSinceEffectiveDate = true;
        component.confirmedFields = ['employerType', 'leavers'];
        fixture.detectChanges();

        expect(component.allRequiredFieldsUpdated()).toBeFalse();
      });

      it('should return true when two fields added to confirmedFields and all other required fields updated since effective date', async () => {
        const { component, fixture } = await setup();

        component.workplace.wdf.numberOfStaff.updatedSinceEffectiveDate = true;
        component.workplace.wdf.employerType.updatedSinceEffectiveDate = true;
        component.workplace.wdf.leavers.updatedSinceEffectiveDate = true;
        component.workplace.wdf.mainService.updatedSinceEffectiveDate = true;
        component.workplace.wdf.serviceUsers.updatedSinceEffectiveDate = true;
        component.workplace.wdf.starters.updatedSinceEffectiveDate = false;
        component.workplace.wdf.vacancies.updatedSinceEffectiveDate = false;
        component.confirmedFields = ['starters', 'vacancies'];

        fixture.detectChanges();

        expect(component.allRequiredFieldsUpdated()).toBeTrue();
      });
    });

    describe('Updating employer type automatically', async () => {
      it('should call updateEmployerType function in ngOnInit when can edit establishment and on WDF page', async () => {
        const { component } = await setup();

        const updateEmployerTypeIfNotUpdatedSinceEffectiveDate = spyOn(
          component,
          'updateEmployerTypeIfNotUpdatedSinceEffectiveDate',
        );

        await component.ngOnInit();

        expect(updateEmployerTypeIfNotUpdatedSinceEffectiveDate).toHaveBeenCalled();
      });

      it('should call confirmField from updateEmployerType function when employer type is eligible but not updated since effective date', async () => {
        const { component } = await setup();

        const confirmField = spyOn(component, 'confirmField');

        component.workplace.wdf.employerType.isEligible = true;
        component.workplace.wdf.employerType.updatedSinceEffectiveDate = false;

        component.updateEmployerTypeIfNotUpdatedSinceEffectiveDate();

        expect(confirmField).toHaveBeenCalledWith('employerType');
      });
    });
  });
});
