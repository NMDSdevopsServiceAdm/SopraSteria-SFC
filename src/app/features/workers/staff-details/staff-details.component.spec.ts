import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Roles } from '@core/model/roles.enum';
import { AlertService } from '@core/services/alert.service';
import { BackService } from '@core/services/back.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockJobService } from '@core/test-utils/MockJobService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { workerBuilder } from '../../../../../server/test/factories/models';
import { StaffDetailsComponent } from './staff-details.component';

describe('StaffDetailsComponent', () => {
  async function setup(insideFlow = true, returnToMandatoryDetails = false) {
    let path;
    if (returnToMandatoryDetails) {
      path = 'mandatory-details';
    } else if (insideFlow) {
      path = 'staff-record';
    } else {
      path = 'staff-record-summary';
    }

    const { fixture, getByText, getByTestId, getByLabelText, queryByTestId, getAllByText } = await render(
      StaffDetailsComponent,
      {
        imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule, ReactiveFormsModule],
        declarations: [ProgressBarComponent],
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
          FormBuilder,
          AlertService,
          WindowRef,
          {
            provide: PermissionsService,
            useFactory: MockPermissionsService.factory(),
            deps: [HttpClient, Router, UserService],
          },
          {
            provide: UserService,
            useFactory: MockUserService.factory(0, Roles.Admin),
            deps: [HttpClient],
          },
          {
            provide: JobService,
            useClass: MockJobService,
          },
          {
            provide: WorkerService,
            useClass: MockWorkerServiceWithUpdateWorker,
          },
          {
            provide: ActivatedRoute,
            useValue: {
              parent: {
                snapshot: {
                  url: [{ path }],
                  data: {
                    establishment: { uid: 'mocked-uid' },
                    primaryWorkplace: {},
                  },
                },
              },
            },
          },
        ],
      },
    );

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService);
    const backService = injector.inject(BackService);
    const alertService = injector.inject(AlertService) as AlertService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();
    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();
    const backLinkSpy = spyOn(backService, 'setBackLink');
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();
    const setAddStaffRecordInProgressSpy = spyOn(workerService, 'setAddStaffRecordInProgress');

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
      getByLabelText,
      getAllByText,
      establishmentService,
      workerService,
      router,
      routerSpy,
      updateWorkerSpy,
      submitSpy,
      backLinkSpy,
      alertSpy,
      setAddStaffRecordInProgressSpy,
    };
  }

  it('should render a StaffDetails', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it(`should render the 'Add a staff record' heading when inside the flow but not accessed from mandatory details page`, async () => {
    const { component, fixture, getByText } = await setup();
    component.worker = null;
    fixture.detectChanges();
    expect(getByText('Add a staff record')).toBeTruthy();
  });

  it(`should render the 'Update staff record' heading when inside the flow but accessed from mandatory details page`, async () => {
    const { getByText } = await setup(true, true);

    expect(getByText('Update staff record')).toBeTruthy();
  });

  it(`should render the 'Update staff record' heading when outside flow`, async () => {
    const { getByText } = await setup(false);

    expect(getByText('Update staff record')).toBeTruthy();
  });

  it('should render the page without the conditional input', async () => {
    const { component, fixture } = await setup();

    const form = component.form;
    form.controls.nameOrId.setValue('');
    form.controls.mainJob.setValue('');
    form.controls.contract.setValue('');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.govuk-select__conditional--hidden')).toBeTruthy();
  });

  it('should show the conditional input when selecting a job which has an other value of true', async () => {
    const { component, getByLabelText, fixture } = await setup();

    const jobWithDropdown = component.jobsAvailable.findIndex((job) => job.other);
    userEvent.selectOptions(getByLabelText('Main job role'), [jobWithDropdown.toString()]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.govuk-select__conditional--hidden')).toBeFalsy();
  });

  describe('progress bar', () => {
    it('should render the progress bar when accessed from the flow', async () => {
      const { getByTestId } = await setup();

      expect(getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bar when accessed from outside the flow', async () => {
      const { queryByTestId } = await setup(false);

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('submit buttons', () => {
    it(`should show 'Save staff record' cta button and 'Cancel' link when adding a staff record`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save this staff record')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should show 'Save' and 'Cancel' buttons when not in mandatory details flow or in the staff record flow`, async () => {
      const { getByText } = await setup(false, false);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should set conditionalQuestionUrl when not in mandatory details flow or in the staff record flow and mainJobRole selected is 23`, async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false, false);

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.selectOptions(getByLabelText('Main job role'), ['23']);
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
        'registered-nurse-details',
        'nursing-category',
      ]);
    });

    it(`should set conditionalQuestionUrl when not in mandatory details flow or in the staff record flow and mainJobRole selected is 23`, async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText } = await setup(false, false);

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.selectOptions(getByLabelText('Main job role'), ['27']);
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
        'mental-health-professional-summary-flow',
      ]);
    });

    it(`should call submit data and navigate to the the correct url when 'Save this staff record' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, routerSpy, workerService } = await setup();

      const createWorkerSpy = spyOn(workerService, 'createWorker').and.callThrough();
      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker = workerBuilder();
        component.worker.nameOrId = 'Someone';
        component.worker.contract = 'Temporary' as Contracts;
        component.worker.mainJob = { jobId: 1 };
      });

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.selectOptions(getByLabelText('Main job role'), ['1']);
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({ nameOrId: 'Someone', mainJob: '1', otherJobRole: null, contract: 'Permanent' });

      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(createWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, {
        nameOrId: component.worker.nameOrId,
        contract: 'Permanent',
        mainJob: { jobId: 1 },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'mandatory-details',
      ]);
    });

    it('should show a banner when a staff record has been successfully added', async () => {
      const { component, fixture, getByText, getByLabelText, workerService, alertSpy } = await setup();

      spyOn(workerService, 'createWorker').and.callThrough();
      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker = workerBuilder();
        component.worker.nameOrId = 'Someone';
        component.worker.contract = 'Temporary' as Contracts;
        component.worker.mainJob = { jobId: 1 };
      });

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.selectOptions(getByLabelText('Main job role'), ['1']);
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      expect(alertSpy).toHaveBeenCalledWith({
        type: 'success',
        message: 'Staff record saved',
      });
    });

    it('should call setAddStaffRecordInProgress when clicking save this staff record', async () => {
      const { component, fixture, getByText, getByLabelText, workerService, setAddStaffRecordInProgressSpy } =
        await setup();

      spyOn(workerService, 'createWorker').and.callThrough();
      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker = workerBuilder();
        component.worker.nameOrId = 'Someone';
        component.worker.contract = 'Temporary' as Contracts;
        component.worker.mainJob = { jobId: 1 };
      });

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.selectOptions(getByLabelText('Main job role'), ['1']);
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      expect(setAddStaffRecordInProgressSpy).toHaveBeenCalledWith(true);
    });

    it('should return the user to the workplace home page when clicking cancel', async () => {
      const { component, getByText, submitSpy, routerSpy, updateWorkerSpy } = await setup();

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'exit', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.workplace.uid], {
        fragment: 'staff-records',
      });
      expect(updateWorkerSpy).not.toHaveBeenCalled();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link when editing a staff record outside`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate to the the staff record summary page when 'Save' is clicked outside of mandatory details flow`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, routerSpy, updateWorkerSpy } = await setup(
        false,
      );

      userEvent.selectOptions(getByLabelText('Main job role'), ['2']);
      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({
        nameOrId: component.worker.nameOrId,
        mainJob: '2',
        otherJobRole: null,
        contract: 'Temporary',
      });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'saveAndContinueConditional', save: true });
      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
        mainJob: { jobId: 2 },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
    });

    it(`should call submit data and navigate to the the mandatory details page when 'Save and return' is clicked inside the mandatory details flow`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, routerSpy, updateWorkerSpy } = await setup(
        false,
        true,
      );

      userEvent.selectOptions(getByLabelText('Main job role'), ['2']);
      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({
        nameOrId: component.worker.nameOrId,
        mainJob: '2',
        otherJobRole: null,
        contract: 'Temporary',
      });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
        mainJob: { jobId: 2 },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'mandatory-details',
      ]);
    });

    it(`should call submit data and navigate to the the correct url when 'Save and return' is clicked with the dropdown input`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, routerSpy, updateWorkerSpy } = await setup(
        false,
      );

      const jobWithDropdown = component.jobsAvailable.findIndex((job) => job.other);
      userEvent.selectOptions(getByLabelText('Main job role'), [jobWithDropdown.toString()]);
      fixture.detectChanges();
      userEvent.type(getByLabelText('What is the job role?'), 'Admin');
      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({
        nameOrId: component.worker.nameOrId,
        mainJob: '3',
        otherJobRole: 'Admin',
        contract: 'Temporary',
      });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'saveAndContinueConditional', save: true });
      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
        mainJob: { jobId: 3, other: 'Admin' },
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'staff-record-summary',
      ]);
    });

    it('should not show a banner when updating a staff record', async () => {
      const { component, fixture, getByText, getByLabelText, workerService, alertSpy } = await setup(false);

      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker.contract = 'Permanent' as Contracts;
      });

      userEvent.selectOptions(getByLabelText('Main job role'), ['2']);
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save'));
      fixture.detectChanges();

      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should not call setAddStaffRecordInProgress when clicking save and return', async () => {
      const { component, fixture, getByText, getByLabelText, workerService, setAddStaffRecordInProgressSpy } =
        await setup(false);

      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker.contract = 'Permanent' as Contracts;
      });

      userEvent.selectOptions(getByLabelText('Main job role'), ['2']);
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save'));
      fixture.detectChanges();
      expect(setAddStaffRecordInProgressSpy).not.toHaveBeenCalled();
    });

    it('should return the user to the record summary page when clicking cancel when not in the main flow or mandatory details flow', async () => {
      const { component, getByText, submitSpy, routerSpy, updateWorkerSpy } = await setup(false);

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
      ]);
      expect(updateWorkerSpy).not.toHaveBeenCalled();
    });

    it('should return to the mandatory details page when clicking cancel when not in the main flow but in the mandatory details flow', async () => {
      const { component, getByText, submitSpy, routerSpy, updateWorkerSpy } = await setup(false, true);

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'mandatory-details',
      ]);
      expect(updateWorkerSpy).not.toHaveBeenCalled();
    });
  });

  describe('error message', () => {
    it('should return an error message if the name or id value is not filled in', async () => {
      const { component, fixture, getByLabelText, getByText, getAllByText } = await setup();

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');

      userEvent.selectOptions(getByLabelText('Main job role'), ['2']);
      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      expect(getAllByText('Enter their name or ID number').length).toEqual(2);
    });

    it('should return an error message if the main job value is not filled in', async () => {
      const { component, fixture, getByLabelText, getByText, getAllByText } = await setup();

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      expect(getAllByText('Select their main job role').length).toEqual(2);
    });

    it('should return an error message when conditional other job role is showing and the input has more than 120 characters ', async () => {
      const { component, fixture, getByLabelText, getByText, getAllByText } = await setup();

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');

      const jobWithDropdown = component.jobsAvailable.findIndex((job) => job.other);
      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.selectOptions(getByLabelText('Main job role'), [jobWithDropdown.toString()]);
      fixture.detectChanges();
      userEvent.type(
        getByLabelText('What is the job role?'),
        'ReallyLongStringReallyLongStringReallyLongStringReallyLongStringReallyLongStringReallyLongStringReallyLongStringReallyLongString',
      );
      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      expect(getAllByText('Job role must be 120 characters or fewer').length).toEqual(2);
    });

    it('should return an error message if the contract is not filled in', async () => {
      const { component, fixture, getByLabelText, getByText, getAllByText } = await setup();

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.selectOptions(getByLabelText('Main job role'), ['2']);
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      expect(getAllByText('Select the type of contract they have').length).toEqual(2);
    });
  });
});
