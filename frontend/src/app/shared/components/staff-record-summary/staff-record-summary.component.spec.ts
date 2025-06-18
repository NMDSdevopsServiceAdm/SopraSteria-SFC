import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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
    const { fixture, getByText, queryByText, getAllByText, getByAltText, getByTestId, queryByTestId } = await render(
      StaffRecordSummaryComponent,
      {
        imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, BrowserModule, FundingModule],
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
        ],
        componentProperties: {
          wdfView: overrides.wdfView ?? true,
          workplace: establishmentBuilder() as Establishment,
          worker: overrides.worker ?? (workerWithWdf() as Worker),
          overallWdfEligibility: overrides.overallWdfEligibility ?? false,
        },
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const workerService = injector.inject(WorkerService) as WorkerService;
    spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

    const wdfConfirmFieldsService = injector.inject(WdfConfirmFieldsService) as WdfConfirmFieldsService;

    return {
      component,
      fixture,
      getByText,
      queryByText,
      workerService,
      wdfConfirmFieldsService,
      getAllByText,
      getByAltText,
      getByTestId,
      queryByTestId,
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

    if (workerOverrides.overrides) {
      workerOverrides.overrides.forEach((override) => {
        worker[override.name] = override.response;
      });
    }

    if (workerOverrides.wdf) {
      workerOverrides.wdf.forEach((field) => {
        worker.wdf[field.name] = field.response;
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
      const { component, fixture, workerService } = await setup();

      component.worker.wdf.dateOfBirth = eligibleButNotUpdatedObject;

      fixture.detectChanges();
      await component.updateFieldsWhichDontRequireConfirmation();

      expect(workerService.updateWorker).toHaveBeenCalled();
    });

    it('should NOT auto update the worker when confirm field is called after all fields are updated and eligible', async () => {
      const { component, fixture, workerService } = await setup();

      component.worker.wdf.dateOfBirth = eligibleObject;
      fixture.detectChanges();

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        dateOfBirth: component.worker.dateOfBirth,
      });
    });

    it('should update the worker for careCertificate if its Yes, completed and not updated', async () => {
      const { component, fixture, workerService } = await setup();

      component.worker.wdf.careCertificate = eligibleButNotUpdatedObject;
      component.worker.careCertificate = 'Yes, completed';
      fixture.detectChanges();

      await component.updateFieldsWhichDontRequireConfirmation();

      expect(workerService.updateWorker).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        careCertificate: component.worker.careCertificate,
      });
    });

    it('should NOT update the worker for careCertificate if it is No and not updated', async () => {
      const { component, fixture, workerService } = await setup();

      component.worker.wdf.careCertificate = eligibleButNotUpdatedObject;
      component.worker.careCertificate = 'No';
      fixture.detectChanges();

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        careCertificate: component.worker.careCertificate,
      });
    });

    it('should update the worker for qualificationInSocialCare if it is Yes and not updated', async () => {
      const { component, fixture, workerService } = await setup();

      component.worker.wdf.qualificationInSocialCare = eligibleButNotUpdatedObject;
      component.worker.qualificationInSocialCare = 'Yes';
      fixture.detectChanges();

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        qualificationInSocialCare: component.worker.qualificationInSocialCare,
      });
    });

    it('should NOT update the worker for qualificationInSocialCare if it is NO and not updated', async () => {
      const { component, fixture, workerService } = await setup();

      component.worker.wdf.qualificationInSocialCare = eligibleButNotUpdatedObject;
      component.worker.qualificationInSocialCare = 'NO';
      fixture.detectChanges();

      await component.updateFieldsWhichDontRequireConfirmation();
      component.confirmField('daysSick');

      expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        qualificationInSocialCare: component.worker.qualificationInSocialCare,
      });
    });
  });

  describe('allRequiredFieldsUpdatedAndEligible()', () => {
    it('should return false if any required fields not updated since effective date and not confirmed', async () => {
      const { component, fixture, wdfConfirmFieldsService } = await setup();
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue([]);

      component.worker.wdf.contract = eligibleButNotUpdatedObject;
      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    it('should return false if any required fields are not eligible', async () => {
      const { component, fixture, wdfConfirmFieldsService } = await setup();
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue([]);

      component.worker.wdf.daysSick = notEligible;
      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    it('should return true if all required fields are either eligible and updated since effective date or Not relevant', async () => {
      const { component, fixture, wdfConfirmFieldsService } = await setup();
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue([]);

      component.worker.wdf.daysSick = notRelevant;
      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return true if all required fields are either eligible and updated since effective date or in confirmed fields array', async () => {
      const { component, fixture, wdfConfirmFieldsService } = await setup();
      spyOn(wdfConfirmFieldsService, 'getConfirmedFields').and.returnValue(['mainJob', 'otherQualification']);

      component.worker.wdf.mainJob = eligibleButNotUpdatedObject;
      component.worker.wdf.otherQualification = eligibleButNotUpdatedObject;
      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return true if otherQualification needs updating but is set to Yes and all other required fields are eligible', async () => {
      const { component, fixture } = await setup();

      component.worker.wdf.otherQualification = eligibleButNotUpdatedObject;
      component.worker.otherQualification = 'Yes';

      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return false if otherQualification is set to Yes but highestQualification needs updating', async () => {
      const { component, fixture } = await setup();

      component.worker.wdf.otherQualification = eligibleButNotUpdatedObject;
      component.worker.otherQualification = 'Yes';

      component.worker.wdf.highestQualification = eligibleButNotUpdatedObject;

      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    it('should return true if qualificationInSocialCare needs updating but is set to Yes and all other required fields are eligible', async () => {
      const { component, fixture } = await setup();

      component.worker.wdf.qualificationInSocialCare = eligibleButNotUpdatedObject;
      component.worker.qualificationInSocialCare = 'Yes';

      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeTrue();
    });

    it('should return false if qualificationInSocialCare is set to Yes but socialCareQualification needs updating', async () => {
      const { component, fixture } = await setup();

      component.worker.wdf.qualificationInSocialCare = eligibleButNotUpdatedObject;
      component.worker.qualificationInSocialCare = 'Yes';

      component.worker.wdf.socialCareQualification = eligibleButNotUpdatedObject;

      fixture.detectChanges();

      expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
    });

    ['No', "Don't know"].forEach((answer) => {
      it(`should return false if otherQualification needs updating and is set to something other than Yes (${answer})`, async () => {
        const { component, fixture } = await setup();

        component.worker.wdf.otherQualification = eligibleButNotUpdatedObject;
        component.worker.otherQualification = answer;

        fixture.detectChanges();

        expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
      });

      it(`should return false if qualificationInSocialCare needs updating and is set to something other than Yes (${answer})`, async () => {
        const { component, fixture } = await setup();

        component.worker.wdf.qualificationInSocialCare = eligibleButNotUpdatedObject;
        component.worker.qualificationInSocialCare = answer;

        fixture.detectChanges();

        expect(component.allRequiredFieldsUpdatedAndEligible()).toBeFalse();
      });
    });
  });

  describe('WdfFieldConfirmation', () => {
    const buildWorkerWithFieldNotUpdatedSinceEffectiveDate = (fields) => {
      return buildWorker({
        overrides: fields,
        wdf: [
          {
            name: fields[0].name,
            response: {
              isEligible: Eligibility.YES,
              updatedSinceEffectiveDate: false,
            },
          },
        ],
      });
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
        fields: [
          { name: 'mainJob', response: { jobId: 10, title: 'Care Worker' } },
          { name: 'contract', response: Contracts.Permanent },
        ],
      },
      {
        name: 'Contract type',
        fields: [{ name: 'contract', response: Contracts.Permanent }],
      },
      {
        name: 'Date started in main job role',
        fields: [{ name: 'mainJobStartDate', response: '2020-01-12' }],
      },
      {
        name: 'Days sickness in last 12 months',
        fields: [
          {
            name: 'daysSick',
            response: {
              days: 4,
              value: null,
            } as WorkerDays,
          },
          { name: 'contract', response: Contracts.Permanent },
        ],
      },
      {
        name: 'Zero hours contract',
        fields: [
          {
            name: 'zeroHoursContract',
            response: 'Yes',
          },
        ],
      },
      {
        name: 'Highest level of social care qualification',
        fields: [
          {
            name: 'socialCareQualification',
            response: { qualificationId: 4, title: 'Level 3' },
          },
          {
            name: 'qualificationInSocialCare',
            response: 'Yes',
          },
        ],
      },
      {
        name: 'Has a social care qualification when answer No',
        fields: [
          {
            name: 'qualificationInSocialCare',
            response: 'No',
          },
        ],
      },
      {
        name: "Has a social care qualification when answer Don't know",
        fields: [
          {
            name: 'qualificationInSocialCare',
            response: "Don't know",
          },
        ],
      },
      {
        name: "Started or completed Care Certificate when answered 'No'",
        fields: [
          {
            name: 'careCertificate',
            response: 'No',
          },
        ],
      },
      {
        name: "Started or completed Care Certificate when answered 'Yes, in progress or partially completed'",
        fields: [
          {
            name: 'careCertificate',
            response: 'Yes, in progress or partially completed',
          },
        ],
      },
      {
        name: 'Highest level of non-social care qualification',
        fields: [
          {
            name: 'highestQualification',
            response: { qualificationId: 5, title: 'Level 4' },
          },
          {
            name: 'otherQualification',
            response: 'Yes',
          },
        ],
      },
      {
        name: 'Salary',
        fields: [
          {
            name: 'annualHourlyPay',
            response: { value: 'Annually', rate: 24000 },
          },
          {
            name: 'contract',
            response: Contracts.Permanent,
          },
        ],
      },
      {
        name: 'Average weekly working hours',
        fields: [
          {
            name: 'weeklyHoursAverage',
            response: { value: 'Yes', hours: 30 },
          },
          {
            name: 'contract',
            response: Contracts.Agency,
          },
          {
            name: 'zeroHoursContract',
            response: 'Yes',
          },
        ],
      },
      {
        name: 'Contracted weekly hours',
        fields: [
          {
            name: 'weeklyHoursContracted',
            response: { value: 'Yes', hours: 30 },
          },
          {
            name: 'contract',
            response: Contracts.Permanent,
          },
          {
            name: 'zeroHoursContract',
            response: 'No',
          },
        ],
      },
      {
        name: "Non-social care qualification when answered 'No'",
        fields: [
          {
            name: 'otherQualification',
            response: 'No',
          },
        ],
      },
      {
        name: "Non-social care qualification when answered 'Don't know'",
        fields: [
          {
            name: 'otherQualification',
            response: "Don't know",
          },
        ],
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
          worker: buildWorkerWithFieldNotUpdatedSinceEffectiveDate([
            { name: 'qualificationInSocialCare', response: 'Yes' },
          ]),
        });

        expect(queryByText('Is this still correct?')).toBeFalsy();
        expect(queryByText('Yes, it is')).toBeFalsy();
        expect(queryByText('No, change it')).toBeFalsy();
      });

      it("should not show when Care Certificate answered with 'Yes, completed'", async () => {
        const { queryByText } = await setup({
          worker: buildWorkerWithFieldNotUpdatedSinceEffectiveDate([
            { name: 'careCertificate', response: 'Yes, completed' },
          ]),
        });

        expect(queryByText('Is this still correct?')).toBeFalsy();
        expect(queryByText('Yes, it is')).toBeFalsy();
        expect(queryByText('No, change it')).toBeFalsy();
      });

      it('should not show when Non-social care qualification is set to Yes', async () => {
        const { queryByText } = await setup({
          worker: buildWorkerWithFieldNotUpdatedSinceEffectiveDate([{ name: 'otherQualification', response: 'Yes' }]),
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
      { name: 'daysSick', validResponse: 3, overrides: [{ name: 'contract', response: Contracts.Permanent }] },
      { name: 'zeroHoursContract', validResponse: 'Yes' },
      { name: 'weeklyHoursAverage', validResponse: 35, overrides: [{ name: 'zeroHoursContract', response: 'Yes' }] },
      { name: 'annualHourlyPay', validResponse: { value: 'Annually' } },
      { name: 'careCertificate', validResponse: { value: 'Yes, completed' } },
      { name: 'qualificationInSocialCare', validResponse: 'Yes' },
      {
        name: 'socialCareQualification',
        validResponse: 'Level 4',
        overrides: [{ name: 'qualificationInSocialCare', response: 'Yes' }],
      },
      { name: 'otherQualification', validResponse: 'Yes' },
      {
        name: 'highestQualification',
        validResponse: 'Level 4',
        overrides: [{ name: 'otherQualification', response: 'Yes' }],
      },
    ].forEach((field) => {
      it(`should show 'Add this information' message when worker is not eligible and needs to add ${field.name}`, async () => {
        const worker = buildWorker(field);
        worker[field.name] = null;
        worker.wdf[field.name].isEligible = Eligibility.NO;

        const { getByTestId } = await setup({ worker });

        const wdfWarningSection = getByTestId(field.name + 'WdfWarning');

        expect(within(wdfWarningSection).getByText('Add this information')).toBeTruthy();
        expect(within(wdfWarningSection).getByAltText('Red flag icon')).toBeTruthy();
      });

      it(`should not show 'Add this information' message when worker is not eligible but has added ${field.name}`, async () => {
        const worker = buildWorker(field);
        worker[field.name] = field.validResponse;
        worker.wdf[field.name].isEligible = Eligibility.YES;

        const { queryByTestId } = await setup({ worker });

        const wdfWarningSection = queryByTestId(field.name + 'WdfWarning');

        expect(wdfWarningSection).toBeFalsy();
      });

      it(`should not show 'Add this information' message when worker does not have ${field.name} added but not in WDF view`, async () => {
        const worker = buildWorker(field);
        worker[field.name] = null;
        worker.wdf[field.name].isEligible = Eligibility.NO;

        const { queryByTestId } = await setup({ worker, wdfView: false });

        const wdfWarningSection = queryByTestId(field.name + 'WdfWarning');

        expect(wdfWarningSection).toBeFalsy();
      });

      it(`should show 'Add this information' and orange flag when worker does not have ${field.name} added but workplace has met WDF eligibility`, async () => {
        const worker = buildWorker(field);
        worker[field.name] = null;
        worker.wdf[field.name].isEligible = Eligibility.NO;

        const { getByTestId } = await setup({ worker, overallWdfEligibility: true });

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
