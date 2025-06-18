import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { Contracts } from '@core/model/contracts.enum';
import { Establishment } from '@core/model/establishment.model';
import { Eligibility } from '@core/model/wdf.model';
import { Worker, WorkerDays, WorkerEditResponse } from '@core/model/worker.model';
import { InternationalRecruitmentService } from '@core/services/international-recruitment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WdfConfirmFieldsService } from '@core/services/wdf/wdf-confirm-fields.service';
import { WorkerService } from '@core/services/worker.service';
import { establishmentBuilder } from '@core/test-utils/MockEstablishmentService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService, workerWithWdf } from '@core/test-utils/MockWorkerService';
import { FundingModule } from '@features/funding/funding.module';
import { SharedModule } from '@shared/shared.module';
import { render, within } from '@testing-library/angular';
import { of } from 'rxjs';

import { StaffRecordSummaryComponent } from './staff-record-summary.component';

describe('StaffRecordSummaryComponent', () => {
  const setup = async (overrides: any = {}) => {
    const setupTools = await render(StaffRecordSummaryComponent, {
      imports: [SharedModule, HttpClientTestingModule, BrowserModule, FundingModule],
      providers: [
        InternationalRecruitmentService,
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(overrides.permissions ?? ['canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        WdfConfirmFieldsService,
        provideRouter([]),
      ],
      componentProperties: {
        wdfView: overrides.wdfView ?? true,
        workplace: establishmentBuilder() as Establishment,
        worker: buildWorker(overrides.worker),
        overallWdfEligibility: overrides.overallWdfEligibility ?? false,
      },
    });

    const component = setupTools.fixture.componentInstance;
    const injector = getTestBed();
    const workerService = injector.inject(WorkerService) as WorkerService;
    spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

    const wdfConfirmFieldsService = injector.inject(WdfConfirmFieldsService) as WdfConfirmFieldsService;

    return {
      ...setupTools,
      component,
      workerService,
      wdfConfirmFieldsService,
    };
  };

  const eligibleObject = {
    isEligible: Eligibility.YES,
    updatedSinceEffectiveDate: true,
  };
  const eligibleButNotUpdatedObject = {
    isEligible: Eligibility.YES,
    updatedSinceEffectiveDate: false,
  };
  const notEligible = {
    isEligible: Eligibility.NO,
    updatedSinceEffectiveDate: false,
  };
  const notRelevant = {
    isEligible: Eligibility.NOT_RELEVANT,
    updatedSinceEffectiveDate: false,
  };

  const buildWorker = (workerOverrides) => {
    const worker = workerWithWdf() as Worker;

    if (workerOverrides) {
      Object.keys(workerOverrides).forEach((override) => {
        if (override == 'wdf') {
          Object.keys(workerOverrides.wdf).forEach((field) => {
            worker.wdf[field] = workerOverrides.wdf[field];
          });
        } else {
          worker[override] = workerOverrides[override];
        }
      });
    }

    return worker;
  };

  it('should render a StaffRecordSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('updateFieldsWhichDontRequireConfirmation()', () => {
    it('should update worker if there are auto fields which have not been updated and are eligible', async () => {
      const { component, workerService } = await setup({
        worker: { wdf: { dateOfBirth: eligibleButNotUpdatedObject } },
      });

      await component.updateFieldsWhichDontRequireConfirmation();

      expect(workerService.updateWorker).toHaveBeenCalled();
    });

    it('should NOT auto update the worker when confirm field is called after all fields are updated and eligible', async () => {
      const { component, workerService } = await setup({
        worker: { wdf: { dateOfBirth: eligibleObject } },
      });

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        dateOfBirth: component.worker.dateOfBirth,
      });
    });

    it('should update the worker for careCertificate if its Yes, completed and not updated', async () => {
      const { component, workerService } = await setup({
        worker: { careCertificate: 'Yes, completed', wdf: { careCertificate: eligibleButNotUpdatedObject } },
      });

      await component.updateFieldsWhichDontRequireConfirmation();

      expect(workerService.updateWorker).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        careCertificate: component.worker.careCertificate,
      });
    });

    it('should NOT update the worker for careCertificate if it is No and not updated', async () => {
      const { component, workerService } = await setup({
        worker: { careCertificate: 'No', wdf: { careCertificate: eligibleButNotUpdatedObject } },
      });

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        careCertificate: component.worker.careCertificate,
      });
    });

    it('should update the worker for qualificationInSocialCare if it is Yes and not updated', async () => {
      const { component, workerService } = await setup({
        worker: { qualificationInSocialCare: 'Yes', wdf: { qualificationInSocialCare: eligibleButNotUpdatedObject } },
      });

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        qualificationInSocialCare: component.worker.qualificationInSocialCare,
      });
    });

    it('should NOT update the worker for qualificationInSocialCare if it is No and not updated', async () => {
      const { component, workerService } = await setup({
        worker: { qualificationInSocialCare: 'No', wdf: { qualificationInSocialCare: eligibleButNotUpdatedObject } },
      });

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        qualificationInSocialCare: component.worker.qualificationInSocialCare,
      });
    });
  });

  describe('allRequiredFieldsUpdatedAndEligible()', () => {
    it('should return false if any required fields not updated since effective date and not confirmed', async () => {
      const { component, wdfConfirmFieldsService } = await setup({
        worker: { wdf: { contract: eligibleButNotUpdatedObject } },
      });
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue([]);

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    it('should return false if any required fields are not eligible', async () => {
      const { component, wdfConfirmFieldsService } = await setup({
        worker: { wdf: { daysSick: notEligible } },
      });
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue([]);

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    it('should return true if all required fields are either eligible and updated since effective date or Not relevant', async () => {
      const { component, wdfConfirmFieldsService } = await setup({
        worker: { wdf: { daysSick: notRelevant } },
      });
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue([]);

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return true if all required fields are either eligible and updated since effective date or in confirmed fields array', async () => {
      const { component, wdfConfirmFieldsService } = await setup({
        worker: { wdf: { mainJob: eligibleButNotUpdatedObject, otherQualification: eligibleButNotUpdatedObject } },
      });
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue(['mainJob', 'otherQualification']);

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return true if otherQualification needs updating but is set to Yes and all other required fields are eligible', async () => {
      const { component } = await setup({
        worker: { otherQualification: 'Yes', wdf: { otherQualification: eligibleButNotUpdatedObject } },
      });

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return false if otherQualification is set to Yes but highestQualification needs updating', async () => {
      const { component } = await setup({
        worker: {
          otherQualification: 'Yes',
          wdf: { otherQualification: eligibleButNotUpdatedObject, highestQualification: eligibleButNotUpdatedObject },
        },
      });

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    it('should return true if qualificationInSocialCare needs updating but is set to Yes and all other required fields are eligible', async () => {
      const { component } = await setup({
        worker: {
          qualificationInSocialCare: 'Yes',
          wdf: { qualificationInSocialCare: eligibleButNotUpdatedObject },
        },
      });

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return false if qualificationInSocialCare is set to Yes but socialCareQualification needs updating', async () => {
      const { component } = await setup({
        worker: {
          qualificationInSocialCare: 'Yes',
          wdf: {
            qualificationInSocialCare: eligibleButNotUpdatedObject,
            socialCareQualification: eligibleButNotUpdatedObject,
          },
        },
      });

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    ['No', "Don't know"].forEach((answer) => {
      it(`should return false if otherQualification needs updating and is set to something other than Yes (${answer})`, async () => {
        const { component } = await setup({
          worker: {
            otherQualification: answer,
            wdf: {
              otherQualification: eligibleButNotUpdatedObject,
            },
          },
        });

        expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
      });

      it(`should return false if qualificationInSocialCare needs updating and is set to something other than Yes (${answer})`, async () => {
        const { component } = await setup({
          worker: {
            qualificationInSocialCare: answer,
            wdf: {
              qualificationInSocialCare: eligibleButNotUpdatedObject,
            },
          },
        });

        expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
      });
    });
  });

  describe('WdfFieldConfirmation', () => {
    const buildWorkerWithFieldNotUpdatedSinceEffectiveDate = (fields) => {
      return {
        ...fields,
        wdf: {
          [Object.keys(fields)[0]]: {
            isEligible: Eligibility.YES,
            updatedSinceEffectiveDate: false,
          },
        },
      };
    };

    it('should not show WdfFieldConfirmation component when fields do not need to be confirmed', async () => {
      const { queryByText } = await setup();

      expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
    });

    [
      {
        name: 'Main job role',
        fields: {
          mainJob: { jobId: 10, title: 'Care Worker' },
          contract: Contracts.Permanent,
        },
      },
      {
        name: 'Contract type',
        fields: { contract: Contracts.Permanent },
      },
      {
        name: 'Date started in main job role',
        fields: { mainJobStartDate: '2020-01-12' },
      },
      {
        name: 'Days sickness in last 12 months',
        fields: {
          daysSick: {
            days: 4,
            value: null,
          } as WorkerDays,
          contract: Contracts.Permanent,
        },
      },
      {
        name: 'Zero hours contract',
        fields: {
          zeroHoursContract: 'Yes',
        },
      },
      {
        name: 'Highest level of social care qualification',
        fields: {
          socialCareQualification: { qualificationId: 4, title: 'Level 3' },
          qualificationInSocialCare: 'Yes',
        },
      },
      {
        name: 'Has a social care qualification when answer No',
        fields: {
          qualificationInSocialCare: 'No',
        },
      },
      {
        name: "Has a social care qualification when answer Don't know",
        fields: {
          qualificationInSocialCare: "Don't know",
        },
      },
      {
        name: "Started or completed Care Certificate when answered 'No'",
        fields: {
          careCertificate: 'No',
        },
      },
      {
        name: "Started or completed Care Certificate when answered 'Yes, in progress or partially completed'",
        fields: {
          careCertificate: 'Yes, in progress or partially completed',
        },
      },
      {
        name: 'Highest level of non-social care qualification',
        fields: {
          highestQualification: { qualificationId: 5, title: 'Level 4' },
          otherQualification: 'Yes',
        },
      },
      {
        name: 'Salary',
        fields: {
          annualHourlyPay: { value: 'Annually', rate: 24000 },
          contract: Contracts.Permanent,
        },
      },
      {
        name: 'Average weekly working hours',
        fields: {
          weeklyHoursAverage: { value: 'Yes', hours: 30 },
          contract: Contracts.Agency,
          zeroHoursContract: 'Yes',
        },
      },
      {
        name: 'Contracted weekly hours',
        fields: {
          weeklyHoursContracted: { value: 'Yes', hours: 30 },
          contract: Contracts.Permanent,
          zeroHoursContract: 'No',
        },
      },
      {
        name: "Non-social care qualification when answered 'No'",
        fields: {
          otherQualification: 'No',
        },
      },
      {
        name: "Non-social care qualification when answered 'Don't know'",
        fields: { otherQualification: "Don't know" },
      },
    ].forEach((scenario) => {
      describe(scenario.name, () => {
        const worker = buildWorkerWithFieldNotUpdatedSinceEffectiveDate(scenario.fields);

        it('should display when is eligible but needs to be confirmed', async () => {
          const { queryByText } = await setup({ worker });

          expect(queryByText('Is this still correct?')).toBeTruthy();
          expect(queryByText('Yes, it is')).toBeTruthy();
          expect(queryByText('No, change it')).toBeTruthy();
        });

        it("should show meeting requirements message when 'Yes it is' is clicked", async () => {
          const { fixture, queryByText } = await setup({ worker });

          const yesItIsButton = queryByText('Yes, it is', { exact: false });
          yesItIsButton.click();

          fixture.detectChanges();

          expect(queryByText('Meeting requirements')).toBeTruthy();
        });

        it('should not display when user does not have edit permissions', async () => {
          const { queryByText } = await setup({ worker, permissions: [] });

          expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
          expect(queryByText('Yes, it is')).toBeFalsy();
          expect(queryByText('No, change it')).toBeFalsy();
        });
      });
    });

    describe('Responses where confirmation is not required', () => {
      it("should not show when 'Has a social care qualification' is set to Yes", async () => {
        const { queryByText } = await setup({
          worker: buildWorkerWithFieldNotUpdatedSinceEffectiveDate({ qualificationInSocialCare: 'Yes' }),
        });

        expect(queryByText('Is this still correct?')).toBeFalsy();
        expect(queryByText('Yes, it is')).toBeFalsy();
        expect(queryByText('No, change it')).toBeFalsy();
      });

      it("should not show when Care Certificate answered with 'Yes, completed'", async () => {
        const { queryByText } = await setup({
          worker: buildWorkerWithFieldNotUpdatedSinceEffectiveDate({ careCertificate: 'Yes, completed' }),
        });

        expect(queryByText('Is this still correct?')).toBeFalsy();
        expect(queryByText('Yes, it is')).toBeFalsy();
        expect(queryByText('No, change it')).toBeFalsy();
      });

      it('should not show when Non-social care qualification is set to Yes', async () => {
        const { queryByText } = await setup({
          worker: buildWorkerWithFieldNotUpdatedSinceEffectiveDate({ otherQualification: 'Yes' }),
        });

        expect(queryByText('Is this still correct?')).toBeFalsy();
        expect(queryByText('Yes, it is')).toBeFalsy();
        expect(queryByText('No, change it')).toBeFalsy();
      });
    });
  });

  describe('Add information messages for WDF', () => {
    [
      { name: 'dateOfBirth', validResponse: '01/01/1999' },
      { name: 'gender', validResponse: 'Male' },
      { name: 'nationality', validResponse: { value: 'British' } },
      { name: 'mainJobStartDate', validResponse: '01/01/2021' },
      { name: 'recruitedFrom', validResponse: 'Agency' },
      { name: 'daysSick', validResponse: 3, overrides: { contract: Contracts.Permanent } },
      { name: 'zeroHoursContract', validResponse: 'Yes' },
      { name: 'weeklyHoursAverage', validResponse: 35, overrides: { zeroHoursContract: 'Yes' } },
      { name: 'annualHourlyPay', validResponse: { value: 'Annually' } },
      { name: 'careCertificate', validResponse: { value: 'Yes, completed' } },
      { name: 'qualificationInSocialCare', validResponse: 'Yes' },
      {
        name: 'socialCareQualification',
        validResponse: 'Level 4',
        overrides: { qualificationInSocialCare: 'Yes' },
      },
      { name: 'otherQualification', validResponse: 'Yes' },
      {
        name: 'highestQualification',
        validResponse: 'Level 4',
        overrides: { otherQualification: 'Yes' },
      },
    ].forEach((field) => {
      it(`should show 'Add this information' message when worker is not eligible and needs to add ${field.name}`, async () => {
        const { getByTestId } = await setup({
          worker: { ...field.overrides, [field.name]: null, wdf: { [field.name]: { isEligible: Eligibility.NO } } },
        });

        const wdfWarningSection = getByTestId(field.name + 'WdfWarning');

        expect(within(wdfWarningSection).getByText('Add this information')).toBeTruthy();
        expect(within(wdfWarningSection).getByAltText('Red flag icon')).toBeTruthy();
      });

      it(`should not show 'Add this information' message when worker is not eligible but has added ${field.name}`, async () => {
        const { queryByTestId } = await setup({
          worker: {
            ...field.overrides,
            [field.name]: field.validResponse,
            wdf: { [field.name]: { isEligible: Eligibility.YES } },
          },
        });

        const wdfWarningSection = queryByTestId(field.name + 'WdfWarning');

        expect(wdfWarningSection).toBeFalsy();
      });

      it(`should not show 'Add this information' message when worker does not have ${field.name} added but not in WDF view`, async () => {
        const { queryByTestId } = await setup({
          wdfView: false,
          worker: {
            ...field.overrides,
            [field.name]: null,
            wdf: { [field.name]: { isEligible: Eligibility.NO } },
          },
        });

        const wdfWarningSection = queryByTestId(field.name + 'WdfWarning');

        expect(wdfWarningSection).toBeFalsy();
      });

      it(`should show 'Add this information' and orange flag when worker does not have ${field.name} added but workplace has met WDF eligibility`, async () => {
        const { getByTestId } = await setup({
          overallWdfEligibility: true,
          worker: {
            ...field.overrides,
            [field.name]: null,
            wdf: { [field.name]: { isEligible: Eligibility.NO } },
          },
        });

        const wdfWarningSection = getByTestId(field.name + 'WdfWarning');

        expect(within(wdfWarningSection).queryByText('Add this information')).toBeTruthy();
        expect(within(wdfWarningSection).getByAltText('Orange flag icon')).toBeTruthy();
      });
    });
  });

  describe('Show and Hide for NINO and DOB', () => {
    it('when a user is not admin then they should see the show and hide links for NINO and DOB', async () => {
      const { component, fixture, getAllByText } = await setup();

      component.canViewNinoDob = true;
      component.worker.dateOfBirth = '01/01/1970';
      component.worker.nationalInsuranceNumber = 'JH127453A';
      fixture.detectChanges();

      expect(getAllByText('Show').length).toBe(2);
    });

    it('when a user is an admin then they should not see the show and hide links for NINO and DOB', async () => {
      const { component, fixture, queryByText } = await setup();

      component.canViewNinoDob = false;
      component.worker.dateOfBirth = '01/01/1970';
      component.worker.nationalInsuranceNumber = 'JH127453A';
      fixture.detectChanges();

      expect(queryByText('Show')).toBeFalsy;
    });
  });
});
