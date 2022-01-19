import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Establishment } from '@core/model/establishment.model';
import { Eligibility } from '@core/model/wdf.model';
import { WorkerDays, WorkerEditResponse } from '@core/model/worker.model';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WdfConfirmFieldsService } from '@core/services/wdf/wdf-confirm-fields.service';
import { WorkerService } from '@core/services/worker.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';
import { WdfModule } from '@features/wdf/wdf.module';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { establishmentBuilder, workerBuilderWithWdf } from '../../../../../server/test/factories/models';
import { StaffRecordSummaryComponent } from './staff-record-summary.component';

describe('StaffRecordSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, queryByText, getAllByText } = await render(StaffRecordSummaryComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, BrowserModule, WdfModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
        WdfConfirmFieldsService,
      ],
      componentProperties: {
        wdfView: true,
        workplace: establishmentBuilder() as Establishment,
        worker: workerBuilderWithWdf(),
      },
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const workerService = injector.inject(WorkerService) as WorkerService;
    const wdfConfirmFieldsService = injector.inject(WdfConfirmFieldsService) as WdfConfirmFieldsService;

    return { component, fixture, getByText, queryByText, workerService, wdfConfirmFieldsService, getAllByText };
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

  it('should render a StaffRecordSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  describe('updateFieldsWhichDontRequireConfirmation()', () => {
    it('should update worker if there are auto fields which have not been updated and are eligible', async () => {
      const { component, fixture, workerService } = await setup();
      spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

      component.worker.wdf.dateOfBirth = eligibleButNotUpdatedObject;

      fixture.detectChanges();
      await component.updateFieldsWhichDontRequireConfirmation();

      expect(workerService.updateWorker).toHaveBeenCalled();
    });

    it('should NOT auto update the worker when confirm field is called after all fields are updated and eligible', async () => {
      const { component, fixture, workerService } = await setup();
      spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

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
      spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

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
      spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

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
      spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

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
      spyOn(workerService, 'updateWorker').and.returnValue(of({ uid: '123' } as WorkerEditResponse));

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
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Date Started', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.mainJobStartDate.isEligible = Eligibility.YES;
    component.worker.wdf.mainJobStartDate.updatedSinceEffectiveDate = false;
    component.worker.mainJobStartDate = '2020-01-12';

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should not show WdfFieldConfirmation component when fields do not need to be confirmed', async () => {
    const { queryByText } = await setup();

    expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
    expect(queryByText('Yes, it is')).toBeFalsy();
    expect(queryByText('No, change it')).toBeFalsy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Date Started', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.mainJobStartDate.isEligible = Eligibility.YES;
    component.worker.wdf.mainJobStartDate.updatedSinceEffectiveDate = false;
    component.worker.mainJobStartDate = '2020-01-12';

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Sickness in last 12 Months', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.daysSick.isEligible = Eligibility.YES;
    component.worker.wdf.daysSick.updatedSinceEffectiveDate = false;
    component.worker.contract = Contracts.Permanent;
    const myWorkerDay: WorkerDays = {
      days: 4,
      value: null,
    };
    component.worker.daysSick = myWorkerDay;

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Sickness in the last 12 months', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.daysSick.isEligible = Eligibility.YES;
    component.worker.wdf.daysSick.updatedSinceEffectiveDate = false;
    component.worker.contract = Contracts.Permanent;
    const myWorkerDay: WorkerDays = {
      days: 4,
      value: null,
    };
    component.worker.daysSick = myWorkerDay;

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Zero hours contracts', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.zeroHoursContract.isEligible = Eligibility.YES;
    component.worker.wdf.zeroHoursContract.updatedSinceEffectiveDate = false;
    component.worker.zeroHoursContract = 'Yes';

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Zero hour contracts', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.zeroHoursContract.isEligible = Eligibility.YES;
    component.worker.wdf.zeroHoursContract.updatedSinceEffectiveDate = false;
    component.worker.zeroHoursContract = 'Yes';

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Contracted weekly hours', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.weeklyHoursContracted.isEligible = Eligibility.YES;
    component.worker.wdf.weeklyHoursContracted.updatedSinceEffectiveDate = false;
    component.worker.weeklyHoursContracted = { value: 'Yes', hours: 30 };
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Contracted weekly hours', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.weeklyHoursContracted.isEligible = Eligibility.YES;
    component.worker.wdf.weeklyHoursContracted.updatedSinceEffectiveDate = false;
    component.worker.weeklyHoursContracted = { value: 'Yes', hours: 30 };
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Average weekly working hours', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.weeklyHoursAverage.isEligible = Eligibility.YES;
    component.worker.wdf.weeklyHoursAverage.updatedSinceEffectiveDate = false;
    component.worker.zeroHoursContract = 'Yes';
    component.worker.weeklyHoursAverage = { value: 'Yes', hours: 30 };
    component.worker.contract = Contracts.Agency;

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Average weekly working hours', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.weeklyHoursAverage.isEligible = Eligibility.YES;
    component.worker.wdf.weeklyHoursAverage.updatedSinceEffectiveDate = false;
    component.worker.zeroHoursContract = 'Yes';
    component.worker.weeklyHoursAverage = { value: 'Yes', hours: 30 };
    component.worker.contract = Contracts.Agency;

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Salary', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.annualHourlyPay.isEligible = Eligibility.YES;
    component.worker.wdf.annualHourlyPay.updatedSinceEffectiveDate = false;
    component.worker.annualHourlyPay = { value: 'Annually', rate: 24000 };
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Salary', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.annualHourlyPay.isEligible = Eligibility.YES;
    component.worker.wdf.annualHourlyPay.updatedSinceEffectiveDate = false;
    component.worker.annualHourlyPay = { value: 'Annually', rate: 24000 };
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Main Job Role', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.mainJob.isEligible = Eligibility.YES;
    component.worker.wdf.mainJob.updatedSinceEffectiveDate = false;
    component.worker.mainJob = { jobId: 10, title: 'Care Worker' };
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Main Job Role', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.mainJob.isEligible = Eligibility.YES;
    component.worker.wdf.mainJob.updatedSinceEffectiveDate = false;
    component.worker.mainJob = { jobId: 10, title: 'Care Worker' };
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Contract', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.contract.isEligible = Eligibility.YES;
    component.worker.wdf.contract.updatedSinceEffectiveDate = false;
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Contract', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.contract.isEligible = Eligibility.YES;
    component.worker.wdf.contract.updatedSinceEffectiveDate = false;
    component.worker.contract = Contracts.Permanent;

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Highest level of social care qualification', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.socialCareQualification.isEligible = Eligibility.YES;
    component.worker.wdf.socialCareQualification.updatedSinceEffectiveDate = false;
    component.worker.qualificationInSocialCare = 'Yes';
    component.worker.socialCareQualification = { qualificationId: 4, title: 'Level 3' };

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Highest level of social care qualification', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.socialCareQualification.isEligible = Eligibility.YES;
    component.worker.wdf.socialCareQualification.updatedSinceEffectiveDate = false;
    component.worker.qualificationInSocialCare = 'Yes';
    component.worker.socialCareQualification = { qualificationId: 4, title: 'Level 3' };

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  it('should show WdfFieldConfirmation component when is eligible, set to no but needs to be confirmed for Any social care qualification', async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.qualificationInSocialCare.isEligible = Eligibility.YES;
    component.worker.wdf.qualificationInSocialCare.updatedSinceEffectiveDate = false;
    component.worker.qualificationInSocialCare = 'No';

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it("should show WdfFieldConfirmation component when is eligible, set to Don't know but needs to be confirmed for Any social care qualification", async () => {
    const { component, fixture, getByText } = await setup();

    component.worker.wdf.qualificationInSocialCare.isEligible = Eligibility.YES;
    component.worker.wdf.qualificationInSocialCare.updatedSinceEffectiveDate = false;
    component.worker.qualificationInSocialCare = "Don't know";

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should not show WdfFieldConfirmation component when is eligible and needs to be confirmed but is set to Yes for Any social care qualification', async () => {
    const { component, fixture, queryByText } = await setup();

    component.worker.wdf.qualificationInSocialCare.isEligible = Eligibility.YES;
    component.worker.wdf.qualificationInSocialCare.updatedSinceEffectiveDate = false;
    component.worker.qualificationInSocialCare = 'Yes';

    fixture.detectChanges();

    expect(queryByText('Is this still correct?')).toBeFalsy();
    expect(queryByText('Yes, it is')).toBeFalsy();
    expect(queryByText('No, change it')).toBeFalsy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Any social care qualification', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.worker.wdf.qualificationInSocialCare.isEligible = Eligibility.YES;
    component.worker.wdf.qualificationInSocialCare.updatedSinceEffectiveDate = false;
    component.worker.qualificationInSocialCare = "Don't know";

    fixture.detectChanges();

    const yesItIsButton = getByText('Yes, it is', { exact: false });
    yesItIsButton.click();

    fixture.detectChanges();

    expect(getByText('Meeting requirements')).toBeTruthy();
  });

  describe('Field confirmation for Started or completed Care Certificate', () => {
    it('should show WdfFieldConfirmation component when is eligible(set to No) but needs to be confirmed for Started or completed Care Certificate', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.wdf.careCertificate.isEligible = Eligibility.YES;
      component.worker.wdf.careCertificate.updatedSinceEffectiveDate = false;
      component.worker.careCertificate = 'No';

      fixture.detectChanges();

      expect(getByText('Is this still correct?')).toBeTruthy();
      expect(getByText('Yes, it is')).toBeTruthy();
      expect(getByText('No, change it')).toBeTruthy();
    });

    it('should show WdfFieldConfirmation component when is eligible(set to Yes, in progress or partially completed) but needs to be confirmed for Started or completed Care Certificate', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.wdf.careCertificate.isEligible = Eligibility.YES;
      component.worker.wdf.careCertificate.updatedSinceEffectiveDate = false;
      component.worker.careCertificate = 'Yes, in progress or partially completed';

      fixture.detectChanges();

      expect(getByText('Is this still correct?')).toBeTruthy();
      expect(getByText('Yes, it is')).toBeTruthy();
      expect(getByText('No, change it')).toBeTruthy();
    });

    it('should not show WdfFieldConfirmation component when is eligible and needs to be confirmed but is set to Yes for Any social care qualification', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.wdf.careCertificate.isEligible = Eligibility.YES;
      component.worker.wdf.careCertificate.updatedSinceEffectiveDate = false;
      component.worker.careCertificate = 'Yes, completed';

      fixture.detectChanges();

      expect(queryByText('Is this still correct?')).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
    });

    it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Started or completed Care Certificate', async () => {
      const { component, fixture, getByText } = await setup();

      const workerService = TestBed.inject(WorkerService);
      spyOn(workerService, 'updateWorker').and.returnValue(of(null));

      component.worker.wdf.careCertificate.isEligible = Eligibility.YES;
      component.worker.wdf.careCertificate.updatedSinceEffectiveDate = false;
      component.worker.careCertificate = 'No';

      fixture.detectChanges();

      const yesItIsButton = getByText('Yes, it is', { exact: false });
      yesItIsButton.click();

      fixture.detectChanges();

      expect(getByText('Meeting requirements')).toBeTruthy();
    });
  });

  describe('Field confirmation for Non-social care qualification', () => {
    it('should show WdfFieldConfirmation component when is eligible(set to No) but needs to be confirmed for Non-social care qualification', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.wdf.otherQualification.isEligible = Eligibility.YES;
      component.worker.wdf.otherQualification.updatedSinceEffectiveDate = false;
      component.worker.otherQualification = 'No';

      fixture.detectChanges();

      expect(getByText('Is this still correct?')).toBeTruthy();
      expect(getByText('Yes, it is')).toBeTruthy();
      expect(getByText('No, change it')).toBeTruthy();
    });

    it("should show WdfFieldConfirmation component when is eligible(set to Don't know) but needs to be confirmed for Non-social care qualification", async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.wdf.otherQualification.isEligible = Eligibility.YES;
      component.worker.wdf.otherQualification.updatedSinceEffectiveDate = false;
      component.worker.otherQualification = "Don't know";

      fixture.detectChanges();

      expect(getByText('Is this still correct?')).toBeTruthy();
      expect(getByText('Yes, it is')).toBeTruthy();
      expect(getByText('No, change it')).toBeTruthy();
    });

    it('should not show WdfFieldConfirmation component when is eligible and needs to be confirmed but is set to Yes for Non-social care qualification', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.wdf.otherQualification.isEligible = Eligibility.YES;
      component.worker.wdf.otherQualification.updatedSinceEffectiveDate = false;
      component.worker.otherQualification = 'Yes';

      fixture.detectChanges();

      expect(queryByText('Is this still correct?')).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
    });

    it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Non-social care qualification', async () => {
      const { component, fixture, getByText } = await setup();

      const workerService = TestBed.inject(WorkerService);
      spyOn(workerService, 'updateWorker').and.returnValue(of(null));

      component.worker.wdf.otherQualification.isEligible = Eligibility.YES;
      component.worker.wdf.otherQualification.updatedSinceEffectiveDate = false;
      component.worker.otherQualification = 'No';

      fixture.detectChanges();

      const yesItIsButton = getByText('Yes, it is', { exact: false });
      yesItIsButton.click();

      fixture.detectChanges();

      expect(getByText('Meeting requirements')).toBeTruthy();
    });
  });

  describe('Field confirmation for Highest level of non-social care qualification', () => {
    it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Highest level of non-social care qualification', async () => {
      const { component, fixture, getByText } = await setup();

      component.worker.otherQualification = 'Yes';
      component.worker.highestQualification = { qualificationId: 5, title: 'Level 4' };
      component.worker.wdf.highestQualification.isEligible = Eligibility.YES;
      component.worker.wdf.highestQualification.updatedSinceEffectiveDate = false;

      fixture.detectChanges();

      expect(getByText('Is this still correct?')).toBeTruthy();
      expect(getByText('Yes, it is')).toBeTruthy();
      expect(getByText('No, change it')).toBeTruthy();
    });

    it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Highest level of non-social care qualification', async () => {
      const { component, fixture, getByText } = await setup();

      const workerService = TestBed.inject(WorkerService);
      spyOn(workerService, 'updateWorker').and.returnValue(of(null));

      component.worker.otherQualification = 'Yes';
      component.worker.highestQualification = { qualificationId: 5, title: 'Level 4' };
      component.worker.wdf.highestQualification.isEligible = Eligibility.YES;
      component.worker.wdf.highestQualification.updatedSinceEffectiveDate = false;

      fixture.detectChanges();

      const yesItIsButton = getByText('Yes, it is', { exact: false });
      yesItIsButton.click();

      fixture.detectChanges();

      expect(getByText('Meeting requirements')).toBeTruthy();
    });
  });

  describe('Permission check for workers who do not have permission to edit fields', () => {
    it('when a user does not have edit permissions then they should not see the Wdf Field Confirmation component for basic record fields', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.wdf.mainJob.isEligible = Eligibility.YES;
      component.worker.wdf.mainJob.updatedSinceEffectiveDate = false;
      component.worker.mainJob = { jobId: 10, title: 'Care Worker' };

      component.worker.contract = Contracts.Permanent;
      component.worker.wdf.contract.isEligible = Eligibility.YES;
      component.worker.wdf.contract.updatedSinceEffectiveDate = false;

      component.canEditWorker = false;

      fixture.detectChanges();

      expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
    });

    it('when a user does not have edit permissions then they should not see the Wdf Field Confirmation component for employment fields', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.contract = Contracts.Permanent;
      component.worker.wdf.daysSick.isEligible = Eligibility.YES;
      component.worker.wdf.daysSick.updatedSinceEffectiveDate = false;
      const myWorkerDay: WorkerDays = {
        days: 4,
        value: null,
      };
      component.worker.daysSick = myWorkerDay;

      component.worker.wdf.weeklyHoursContracted.isEligible = Eligibility.YES;
      component.worker.wdf.weeklyHoursContracted.updatedSinceEffectiveDate = false;
      component.worker.weeklyHoursContracted = { value: 'Yes', hours: 30 };

      component.worker.wdf.annualHourlyPay.isEligible = Eligibility.YES;
      component.worker.wdf.annualHourlyPay.updatedSinceEffectiveDate = false;
      component.worker.annualHourlyPay = { value: 'Annually', rate: 24000 };

      component.canEditWorker = false;

      fixture.detectChanges();

      expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
    });

    it('when a user does not have edit permissions then they should not see the Wdf Field Confirmation component for employment fields with zero hours', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.wdf.weeklyHoursAverage.isEligible = Eligibility.YES;
      component.worker.wdf.weeklyHoursAverage.updatedSinceEffectiveDate = false;
      component.worker.zeroHoursContract = 'Yes';
      component.worker.weeklyHoursAverage = { value: 'Yes', hours: 30 };
      component.worker.contract = Contracts.Agency;

      component.canEditWorker = false;

      fixture.detectChanges();

      expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
    });

    it('when a user does not have edit permissions then they should not see the Wdf Field Confirmation component for qualification fields', async () => {
      const { component, fixture, queryByText } = await setup();

      component.worker.wdf.socialCareQualification.isEligible = Eligibility.YES;
      component.worker.wdf.socialCareQualification.updatedSinceEffectiveDate = false;
      component.worker.qualificationInSocialCare = 'Yes';
      component.worker.socialCareQualification = { qualificationId: 4, title: 'Level 3' };

      component.worker.wdf.careCertificate.isEligible = Eligibility.YES;
      component.worker.wdf.careCertificate.updatedSinceEffectiveDate = false;
      component.worker.careCertificate = 'No';

      component.worker.wdf.otherQualification.isEligible = Eligibility.YES;
      component.worker.wdf.otherQualification.updatedSinceEffectiveDate = false;
      component.worker.otherQualification = 'Yes';

      component.worker.highestQualification = { qualificationId: 5, title: 'Level 4' };
      component.worker.wdf.highestQualification.isEligible = Eligibility.YES;
      component.worker.wdf.highestQualification.updatedSinceEffectiveDate = false;

      component.canEditWorker = false;

      fixture.detectChanges();

      expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
      expect(queryByText('Yes, it is')).toBeFalsy();
      expect(queryByText('No, change it')).toBeFalsy();
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
