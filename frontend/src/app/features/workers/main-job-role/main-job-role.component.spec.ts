import { render } from '@testing-library/angular';
import { MainJobRoleComponent } from './main-job-role.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { WorkerService } from '@core/services/worker.service';
import { MockWorkerServiceWithUpdateWorker, workerBuilder } from '@core/test-utils/MockWorkerService';
import { WindowRef } from '@core/services/window.ref';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { HttpClient } from '@angular/common/http';
import { UserService } from '@core/services/user.service';
import { MockUserService } from '@core/test-utils/MockUserService';
import { Roles } from '@core/model/roles.enum';
import { Contracts } from '@core/model/contracts.enum';
import { Worker } from '@core/model/worker.model';
import userEvent from '@testing-library/user-event';
import { AlertService } from '@core/services/alert.service';

describe('MainJobRoleComponent', () => {
  async function setup(insideFlow = true, returnToMandatoryDetails = false, addNewWorker = false) {
    let path;
    if (returnToMandatoryDetails) {
      path = 'mandatory-details';
    } else if (insideFlow) {
      path = 'staff-record';
    } else {
      path = 'staff-record-summary';
    }
    const { fixture, getByText, getByTestId, getByLabelText, queryByTestId } = await render(MainJobRoleComponent, {
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
            snapshot: {
              params: {},
              data: {
                jobs: [
                  {
                    id: 4,
                    jobRoleGroup: 'Professional and related roles',
                    title: 'Allied health professional (not occupational therapist)',
                  },
                  {
                    id: 10,
                    jobRoleGroup: 'Care providing roles',
                    title: 'Care worker',
                  },
                  {
                    id: 23,
                    title: 'Registered nurse',
                    jobRoleGroup: 'Professional and related roles',
                  },
                  {
                    id: 27,
                    title: 'Social worker',
                    jobRoleGroup: 'Professional and related roles',
                  },
                ],
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService) as WorkerService;
    const alertService = injector.inject(AlertService) as AlertService;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    const updateWorkerSpy = spyOn(workerService, 'updateWorker').and.callThrough();
    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();
    const alertSpy = spyOn(alertService, 'addAlert').and.callThrough();
    const setAddStaffRecordInProgressSpy = spyOn(workerService, 'setAddStaffRecordInProgress');

    if (addNewWorker) {
      spyOn(workerService, 'setState').and.callFake(() => {
        component.worker = workerBuilder() as Worker;
      });
      spyOnProperty(workerService, 'newWorkerMandatoryInfo').and.returnValue({
        nameOrId: 'Someone',
        contract: 'Permanent' as Contracts,
      });
      component.worker = null;
      component.init();
      fixture.detectChanges();
    }

    return {
      component,
      fixture,
      getByTestId,
      getByText,
      getByLabelText,
      router,
      routerSpy,
      updateWorkerSpy,
      submitSpy,
      workerService,
      queryByTestId,
      alertSpy,
      setAddStaffRecordInProgressSpy,
    };
  }

  it('should render MainJobRole', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it(`should render the 'Mandatory information' caption when accessed from mandatory details page`, async () => {
    const { getByText } = await setup(false, true);

    expect(getByText('Mandatory information')).toBeTruthy();
  });

  describe('heading', () => {
    it(`should render the 'Select their main job role' heading when inside the flow but not accessed from mandatory details page`, async () => {
      const { component, fixture, getByText } = await setup();
      component.worker = null;
      fixture.detectChanges();

      expect(getByText('Select their main job role')).toBeTruthy();
    });

    it(`should render the 'Update their main job role' heading when accessed from mandatory details page`, async () => {
      const { getByText } = await setup(false, true);

      expect(getByText('Update their main job role')).toBeTruthy();
    });

    it(`should render the 'Update their main job role' heading when outside flow`, async () => {
      const { getByText } = await setup(false);

      expect(getByText('Update their main job role')).toBeTruthy();
    });
  });

  it('should show the accordion', async () => {
    const { getByTestId } = await setup(false, true);

    expect(getByTestId('accordian')).toBeTruthy();
  });

  it('should show the accordion headings', async () => {
    const { getByText } = await setup(false, true);

    expect(getByText('Care providing roles')).toBeTruthy();
    expect(getByText('Professional and related roles')).toBeTruthy();
  });

  it(`should not prefill the form if there's no main job on the worker`, async () => {
    const { component, fixture } = await setup();

    component.worker.mainJob = null;
    const form = component.form;
    fixture.detectChanges();

    component.init();

    expect(form.value).toEqual({ mainJob: null });
  });

  it('should prefill the form when editing the job role', async () => {
    const { component, fixture } = await setup(false, false);

    component.worker.mainJob = { jobId: 13, other: null, title: 'First-line manager' };
    fixture.detectChanges();
    component.init();

    expect(component.form.value).toEqual({ mainJob: 13 });
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
    describe('adding new staff record', () => {
      it(`should show 'Save this staff record' cta button and 'Cancel' link`, async () => {
        const { getByText } = await setup(true, false, true);

        expect(getByText('Save this staff record')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });

      it(`should call submit data and navigate to the the correct url when 'Save this staff record' is clicked`, async () => {
        const { component, fixture, getByText, submitSpy, routerSpy, workerService } = await setup(true, false, true);
        const createWorkerSpy = spyOn(workerService, 'createWorker').and.callThrough();

        userEvent.click(getByText('Care providing roles'));
        userEvent.click(getByText('Care worker'));
        userEvent.click(getByText('Save this staff record'));

        const updatedFormData = component.form.value;
        expect(updatedFormData).toEqual({
          mainJob: 10,
        });

        expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
        expect(createWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, {
          nameOrId: 'Someone',
          contract: 'Permanent',
          mainJob: { jobId: 10 },
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
        const { getByText, alertSpy } = await setup(true, false, true);
        userEvent.click(getByText('Care providing roles'));
        userEvent.click(getByText('Care worker'));
        userEvent.click(getByText('Save this staff record'));

        expect(alertSpy).toHaveBeenCalledWith({
          type: 'success',
          message: 'Staff record saved',
        });
      });

      it('should call setAddStaffRecordInProgress when clicking save this staff record', async () => {
        const { getByText, workerService, setAddStaffRecordInProgressSpy } = await setup(true, false, true);

        spyOn(workerService, 'createWorker').and.callThrough();

        userEvent.click(getByText('Care providing roles'));
        userEvent.click(getByText('Care worker'));
        userEvent.click(getByText('Save this staff record'));

        expect(setAddStaffRecordInProgressSpy).toHaveBeenCalledWith(true);
      });

      it('should return the user to the staff records tab when clicking cancel', async () => {
        const { getByText, submitSpy, routerSpy, updateWorkerSpy } = await setup(true, false, true);

        userEvent.click(getByText('Cancel'));
        expect(submitSpy).toHaveBeenCalledWith({ action: 'exit', save: false });
        expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
          fragment: 'staff-records',
        });
        expect(updateWorkerSpy).not.toHaveBeenCalled();
      });
    });

    describe('editing from staff record', () => {
      it(`should show 'Save and return' and 'Cancel' buttons when not in mandatory details flow or in the staff record flow`, async () => {
        const { getByText } = await setup(false, false);

        expect(getByText('Save and return')).toBeTruthy();
        expect(getByText('Cancel')).toBeTruthy();
      });
    });

    it('should return the user to the staff records tab when clicking cancel', async () => {
      const { getByText, submitSpy, routerSpy, updateWorkerSpy } = await setup();

      userEvent.click(getByText('Cancel'));
      expect(submitSpy).toHaveBeenCalledWith({ action: 'exit', save: false });
      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], {
        fragment: 'staff-records',
      });
      expect(updateWorkerSpy).not.toHaveBeenCalled();
    });

    it(`should call submit the edited data and navigate to the the staff record summary page when 'Save and return' is clicked outside of mandatory details flow`, async () => {
      const { component, fixture, getByText, submitSpy, routerSpy, updateWorkerSpy } = await setup(false, false);

      component.worker.mainJob = { jobId: 13, other: null, title: 'First-line manager' };
      fixture.detectChanges();
      component.init();

      userEvent.click(getByText('Care providing roles'));
      userEvent.click(getByText('Care worker'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      expect(updatedFormData).toEqual({
        mainJob: 10,
      });
      expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      expect(updateWorkerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
        mainJob: { jobId: 10 },
      });

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        component.workplace.uid,
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
      ]);
    });

    it(`should navigate to the nursing-category page if the main job role has and id of 23 and outside of the flow`, async () => {
      const { component, fixture, routerSpy, getByText, workerService } = await setup(false, false);

      spyOn(workerService, 'hasJobRole').and.returnValues(false, true); // returns false the first time it is called and true the second time it is called
      userEvent.click(getByText('Professional and related roles'));
      userEvent.click(getByText('Registered nurse'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
        'nursing-category',
      ]);
    });

    it(`should navigate to the nursing-category page if the main job role has and id of 23 and in the wdf edit version of the page`, async () => {
      const { component, fixture, router, routerSpy, getByText, workerService } = await setup(false, false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      spyOn(workerService, 'hasJobRole').and.returnValues(false, true); // returns false the first time it is called and true the second time it is called
      userEvent.click(getByText('Professional and related roles'));
      userEvent.click(getByText('Registered nurse'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/wdf', 'staff-record', component.worker.uid, 'nursing-category']);
    });

    it(`should navigate to the mental-health-professional page if the main job role has and id of 27 and outside of the flow`, async () => {
      const { component, fixture, routerSpy, getByText, getByLabelText, workerService } = await setup(false, false);

      spyOn(workerService, 'hasJobRole').and.returnValue(true);
      userEvent.click(getByText('Professional and related roles'));
      userEvent.click(getByText('Social worker'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        'mocked-uid',
        'staff-record',
        component.worker.uid,
        'staff-record-summary',
        'mental-health-professional',
      ]);
    });

    it(`should navigate to the mental-health-professional page if the main job role has and id of 27 and in wdf version of page`, async () => {
      const { component, fixture, routerSpy, router, getByText, workerService } = await setup(false, false);
      spyOnProperty(router, 'url').and.returnValue('/wdf/staff-record');
      component.returnUrl = undefined;
      component.ngOnInit();
      fixture.detectChanges();

      spyOn(workerService, 'hasJobRole').and.returnValue(true);
      userEvent.click(getByText('Professional and related roles'));
      userEvent.click(getByText('Social worker'));
      userEvent.click(getByText('Save and return'));
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/wdf',
        'staff-record',
        component.worker.uid,
        'mental-health-professional',
      ]);
    });
  });
});
