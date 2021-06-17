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
import { WorkerService } from '@core/services/worker.service';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { WdfModule } from '@features/wdf/wdf.module';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import { of } from 'rxjs';

import { establishmentBuilder, workerBuilderWithWdf } from '../../../../../server/test/factories/models';
import { StaffRecordSummaryComponent } from './staff-record-summary.component';
import { MockWorkerService } from '@core/test-utils/MockWorkerService';

describe('StaffRecordSummaryComponent', () => {
  const setup = async () => {
    const { fixture, getByText, queryByText } = await render(StaffRecordSummaryComponent, {
      imports: [SharedModule, RouterTestingModule, HttpClientTestingModule, BrowserModule, WdfModule],
      providers: [
        {
          provide: PermissionsService,
          useFactory: MockPermissionsService.factory(['canEditWorker']),
          deps: [HttpClient, Router, UserService],
        },

        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: WorkerService,
          useClass: MockWorkerService,
        },
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

    return { component, fixture, getByText, queryByText,workerService };
  };
  const eligibleObject =
  {
    isEligible: Eligibility.YES,
    updatedSinceEffectiveDate: true
  };
  const eligibleButNotUpdatedObject =
    {
      isEligible: Eligibility.YES,
      updatedSinceEffectiveDate: false
    };
  const notEligible=
    {
      isEligible: Eligibility.NO,
      updatedSinceEffectiveDate: false
    };

  it('should render a StaffRecordSummaryComponent', async () => {
    const { component } = await setup();

    expect(component).toBeTruthy();
  });

  it('should only auto run confirmField if all other fields confirmed and auto fields have not', async () => {
    const { component, fixture, workerService } = await setup();

    spyOn(workerService, 'updateWorker').and.returnValue(of({uid:"123"} as WorkerEditResponse));

    component.wdfNewDesign = true;
    component.worker.wdf.dateOfBirth = eligibleButNotUpdatedObject;

    fixture.detectChanges();
    component.updateFieldsWhichDontRequireConfirmation();

    expect(workerService.updateWorker).toHaveBeenCalled();
  });

  it('should NOT auto run confirmField after all confirmed', async () => {
    const { component, fixture, workerService } = await setup();
    spyOn(workerService, 'updateWorker').and.returnValue(of({uid:"123"} as WorkerEditResponse));
    component.wdfNewDesign = true;
    component.worker.wdf.dateOfBirth = eligibleObject;

    fixture.detectChanges();
    component.updateFieldsWhichDontRequireConfirmation();
    component.confirmField('daysSick');
    expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid,component.worker.uid,{dateOfBirth:component.worker.dateOfBirth});
  });
  it('should run auto run confirmField for careCertificate if its Yes, completed and not updated ', async () => {
    const { component, fixture, workerService } = await setup();
    spyOn(workerService, 'updateWorker').and.returnValue(of({uid:"123"} as WorkerEditResponse));
    component.wdfNewDesign = true;
    component.worker.wdf.careCertificate = eligibleButNotUpdatedObject;
    component.worker.careCertificate = "Yes, completed";
    fixture.detectChanges();
    component.updateFieldsWhichDontRequireConfirmation();
    component.confirmField('daysSick');
    expect(workerService.updateWorker).toHaveBeenCalledWith(component.workplace.uid,component.worker.uid,{careCertificate: component.worker.careCertificate});
  });
  it('should NOT run auto run confirmField for careCertificate if its No and not updated ', async () => {
    const { component, fixture, workerService } = await setup();
    spyOn(workerService, 'updateWorker').and.returnValue(of({uid:"123"} as WorkerEditResponse));
    component.wdfNewDesign = true;
    component.worker.wdf.careCertificate = eligibleButNotUpdatedObject;
    component.worker.careCertificate = "No";
    fixture.detectChanges();
    component.updateFieldsWhichDontRequireConfirmation();
    component.confirmField('daysSick');
    expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid,component.worker.uid,{careCertificate: component.worker.careCertificate});
  });
  it('should run auto run confirmField for qualificationInSocialCare if its Yes and not updated ', async () => {
    const { component, fixture, workerService } = await setup();
    spyOn(workerService, 'updateWorker').and.returnValue(of({uid:"123"} as WorkerEditResponse));
    component.wdfNewDesign = true;
    component.worker.wdf.qualificationInSocialCare = eligibleButNotUpdatedObject;
    component.worker.qualificationInSocialCare = "Yes";
    fixture.detectChanges();
    component.updateFieldsWhichDontRequireConfirmation();
    component.confirmField('daysSick');
    expect(workerService.updateWorker).toHaveBeenCalledWith(component.workplace.uid,component.worker.uid,{qualificationInSocialCare: component.worker.qualificationInSocialCare});
  });
  it('should NOT run auto run confirmField for qualificationInSocialCare if its NO and not updated ', async () => {
    const { component, fixture, workerService } = await setup();
    spyOn(workerService, 'updateWorker').and.returnValue(of({uid:"123"} as WorkerEditResponse));
    component.wdfNewDesign = true;
    component.worker.wdf.qualificationInSocialCare = eligibleButNotUpdatedObject;
    component.worker.qualificationInSocialCare = "NO";
    fixture.detectChanges();
    component.updateFieldsWhichDontRequireConfirmation();
    component.confirmField('daysSick');
    expect(workerService.updateWorker).not.toHaveBeenCalledWith(component.workplace.uid,component.worker.uid,{qualificationInSocialCare: component.worker.qualificationInSocialCare});
  });
  it('should NOT auto run confirmField if NOT all other fields confirmed', async () => {
    const { component, fixture, workerService } = await setup();

    spyOn(workerService, 'updateWorker').and.returnValue(of({uid:"123"} as WorkerEditResponse));

    component.wdfNewDesign = true;
    component.worker.wdf.dateOfBirth = eligibleButNotUpdatedObject;
    component.worker.wdf.daysSick = notEligible;

    fixture.detectChanges();
    component.updateFieldsWhichDontRequireConfirmation();

    expect(workerService.updateWorker).not.toHaveBeenCalled();
  });
  it('should show WdfFieldConfirmation component when is eligible but needs to be confirmed for Date Started', async () => {
    const { component, fixture, getByText } = await setup();

    component.wdfNewDesign = true;
    component.worker.wdf.mainJobStartDate.isEligible = Eligibility.YES;
    component.worker.wdf.mainJobStartDate.updatedSinceEffectiveDate = false;
    component.worker.mainJobStartDate = '2020-01-12';

    fixture.detectChanges();

    expect(getByText('Is this still correct?')).toBeTruthy();
    expect(getByText('Yes, it is')).toBeTruthy();
    expect(getByText('No, change it')).toBeTruthy();
  });

  it('should not show WdfFieldConfirmation component when fields do not need to be confirmed', async () => {
    const { component, queryByText } = await setup();

    component.wdfNewDesign = true;
    expect(queryByText('Is this still correct?', { exact: false })).toBeFalsy();
    expect(queryByText('Yes, it is')).toBeFalsy();
    expect(queryByText('No, change it')).toBeFalsy();
  });

  it('should show meeting requirements message in WdfFieldConfirmation when Yes it is is clicked for Date Started', async () => {
    const { component, fixture, getByText } = await setup();

    const workerService = TestBed.inject(WorkerService);
    spyOn(workerService, 'updateWorker').and.returnValue(of(null));

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

    component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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

      component.wdfNewDesign = true;
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
});
