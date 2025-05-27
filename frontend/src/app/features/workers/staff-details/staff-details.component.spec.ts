import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Roles } from '@core/model/roles.enum';
import { AlertService } from '@core/services/alert.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerServiceWithNoWorker, MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { SharedModule } from '@shared/shared.module';
import { getByText, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { StaffDetailsComponent } from './staff-details.component';

describe('StaffDetailsComponent', () => {
  async function setup(
    insideFlow = true,
    returnToMandatoryDetails = false,
    creatingNewWorker = false,
    workerInfo = null,
  ) {
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
          UntypedFormBuilder,
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
            provide: WorkerService,
            useFactory: creatingNewWorker
              ? MockWorkerServiceWithNoWorker.factory(workerInfo)
              : MockWorkerServiceWithUpdateWorker.factory(),
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
              snapshot: {
                params: {},
                data: {},
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
    const alertService = injector.inject(AlertService) as AlertService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();
    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();
    const setAddStaffRecordInProgressSpy = spyOn(workerService, 'setAddStaffRecordInProgress');
    const setNewWorkerMandatoryInfoSpy = spyOn(workerService, 'setNewWorkerMandatoryInfo').and.callThrough();
    const clearNewWorkerMandatoryInfoSpy = spyOn(workerService, 'clearNewWorkerMandatoryInfo').and.callThrough();

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
      alertSpy,
      setAddStaffRecordInProgressSpy,
      setNewWorkerMandatoryInfoSpy,
      clearNewWorkerMandatoryInfoSpy,
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
    it(`should show 'Continue' cta button and 'Cancel' link when adding a staff record`, async () => {
      const { getByText } = await setup();

      expect(getByText('Continue')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should navigate to main-job-role page and set mandatory info in worker service after clicking 'Continue' cta button when adding a staff record`, async () => {
      const {
        fixture,
        getByText,
        getByLabelText,
        routerSpy,
        updateWorkerSpy,
        setNewWorkerMandatoryInfoSpy,
        submitSpy,
      } = await setup(true, false, true);

      const enteredName = 'Someone';
      userEvent.type(getByLabelText('Name or ID number'), enteredName);
      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(updateWorkerSpy).not.toHaveBeenCalled();
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(setNewWorkerMandatoryInfoSpy).toHaveBeenCalledWith(enteredName, 'Temporary' as Contracts);
      expect(routerSpy.calls.mostRecent().args[0]).toEqual(['main-job-role']);
    });

    it(`should clear mandatory info in worker service after clicking 'Cancel' button when adding a staff record`, async () => {
      const { fixture, getByText, clearNewWorkerMandatoryInfoSpy } = await setup(true, false, true);

      userEvent.click(getByText('Cancel'));
      fixture.detectChanges();

      expect(clearNewWorkerMandatoryInfoSpy).toHaveBeenCalled();
    });

    it(`should show 'Save and return' and 'Cancel' buttons when not in mandatory details flow or in the staff record flow`, async () => {
      const { getByText } = await setup(false, false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link when editing a staff record outside`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should call submit data and navigate to the funding staff record summary page when 'Save and return' is clicked in funding version of the page`, async () => {
      const { component, router, fixture, getByText, getByLabelText, submitSpy, routerSpy, updateWorkerSpy } =
        await setup(false, false);
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
      });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
      });
      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', fixture.componentInstance.worker.uid]);
    });

    it(`should call submit data and navigate to the the staff record summary page when 'Save and return' is clicked outside of mandatory details flow`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, routerSpy, updateWorkerSpy } = await setup(
        false,
      );

      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
      });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
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

      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
      });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: true });
      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        nameOrId: component.worker.nameOrId,
        contract: 'Temporary',
      });
      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        fixture.componentInstance.worker.uid,
        'mandatory-details',
      ]);
    });

    it('should not show a banner when updating a staff record', async () => {
      const { component, fixture, getByText, getByLabelText, workerService, alertSpy } = await setup(false);

      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker.contract = 'Permanent' as Contracts;
      });

      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should not show a banner when updating a staff record in funding version of the page', async () => {
      const { component, router, fixture, getByText, getByLabelText, workerService, alertSpy } = await setup(
        false,
        false,
      );
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker.contract = 'Permanent' as Contracts;
      });

      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should not call setAddStaffRecordInProgress when clicking save and return', async () => {
      const { component, fixture, getByText, getByLabelText, workerService, setAddStaffRecordInProgressSpy } =
        await setup(false);

      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker.contract = 'Permanent' as Contracts;
      });

      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save and return'));
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

    it('should return the user to the funding record summary page when clicking cancel when in funding version of the page', async () => {
      const { component, router, fixture, getByText, submitSpy, routerSpy, updateWorkerSpy } = await setup(
        false,
        false,
      );
      spyOnProperty(router, 'url').and.returnValue('/funding/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();
      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'return', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/funding', 'staff-record', component.worker.uid]);
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
      form.controls.contract.setValue('');

      userEvent.click(getByLabelText('Temporary'));
      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(getAllByText('Enter their name or ID number').length).toEqual(2);
    });

    it('should return an error message if the contract is not filled in', async () => {
      const { component, fixture, getByLabelText, getByText, getAllByText } = await setup();

      component.worker = null;
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.contract.setValue('');

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.click(getByText('Continue'));
      fixture.detectChanges();

      expect(getAllByText('Select the type of contract they have').length).toEqual(2);
    });
  });

  describe('Prefilling the form', () => {
    it(`should prefill the form with mandatory info in worker service if it exists when adding a staff record`, async () => {
      const mandatoryInfoInService = { nameOrId: 'Someone', contract: 'Temporary' as Contracts };

      const { getByLabelText } = await setup(true, false, true, mandatoryInfoInService);

      const nameOrId = getByLabelText('Name or ID number') as HTMLFormElement;
      const temporaryContractType = getByLabelText('Temporary') as HTMLFormElement;

      expect(nameOrId.value).toEqual(mandatoryInfoInService.nameOrId);
      expect(temporaryContractType.checked).toBeTrue();
    });

    it(`should prefill the form with worker data if existing staff record`, async () => {
      const { component, getByLabelText } = await setup();

      const nameOrId = getByLabelText('Name or ID number') as HTMLFormElement;
      const workerContractType = getByLabelText(component.worker.contract) as HTMLFormElement;

      expect(nameOrId.value).toEqual(component.worker.nameOrId);
      expect(workerContractType.checked).toBeTrue();
    });
  });
});
