import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Roles } from '@core/model/roles.enum';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { WorkerService } from '@core/services/worker.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockJobService } from '@core/test-utils/MockJobService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { MockWorkerServiceWithoutReturnUrl, MockWorkerServiceWithUpdateWorker } from '@core/test-utils/MockWorkerService';
import { build, fake, sequence } from '@jackfranklin/test-data-bot';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

import { StaffDetailsComponent } from './staff-details.component';

fdescribe('StaffDetailsComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.datatype.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });

  async function setup(returnUrl = true) {
    const establishment = establishmentBuilder();
    const { fixture, getByText, getByTestId, getByLabelText, queryByTestId } = await render(StaffDetailsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [ProgressBarComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        {
          provide: WindowRef,
          useValue: WindowRef,
        },
        {
          provide: Contracts,
          useValue: Contracts,
        },
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
          provide: EstablishmentService,
          useValue: MockEstablishmentService,
        },
        {
          provide: JobService,
          useClass: MockJobService,
        },
        {
          provide: AuthService,
          useValue: MockAuthService,
        },
        {
          provide: WorkerService,
          useClass: returnUrl ? MockWorkerServiceWithUpdateWorker : MockWorkerServiceWithoutReturnUrl,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
              parent: {
                url: [{ path: returnUrl ? 'staff-record/staff-record-summary' : 'staff-record' }],
              },
            },
            parent: {
              snapshot: {
                url: [{ path: 'staff-record' }],
                data: {
                  establishment,
                  primaryWorkplace: establishment,
                },
              },
            },
          },
        },
      ],
    });

    const component = fixture.componentInstance;
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;
    const workerService = injector.inject(WorkerService);

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    // const workerSpy = spyOn(workerService, 'updateWorker').and.callThrough();
    const submitSpy = spyOn(component, 'setSubmitAction').and.callThrough();

    return {
      component,
      fixture,
      getByText,
      getByTestId,
      queryByTestId,
      getByLabelText,
      establishmentService,
      router,
      routerSpy,
      // workerSpy,
      submitSpy,
    };
  }

  it('should render a StaffDetails', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save staff record' cta button and 'Cancel' link when adding a staff record`, async () => {
      const { component, fixture, getByText } = await setup(false);

      component.canReturn = false;
      fixture.detectChanges();

      expect(getByText('Save this staff record')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link when editing a staff record`, async () => {
      const { getByText } = await setup();

      expect(getByText('Save and return')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the progress bar when accessed from the flow', async () => {
      const { component, fixture, getByTestId } = await setup();

      component.insideFlow = true;
      fixture.detectChanges();

      expect(getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bar when accessed from outside the flow', async () => {
      const { component, fixture, queryByTestId } = await setup(false);

      component.insideFlow = false;
      fixture.detectChanges();

      expect(queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('submission and validation', () => {
    it(`should call submit data and navigate with the correct url when 'Save and continue' is clicked`, async () => {
      const { component, fixture, getByText, getByLabelText, submitSpy, routerSpy } = await setup();

      component.canReturn = false;
      fixture.detectChanges();

      userEvent.type(getByLabelText('Name or ID number'), 'Someone');
      userEvent.type(getByLabelText('Main job role'), '6');
      userEvent.click(getByLabelText('Permanent'));
      userEvent.click(getByText('Save this staff record'));
      fixture.detectChanges();

      const updatedFormData = component.form.value;
      console.log(updatedFormData);
      expect(updatedFormData).toEqual({
        nameOrId: 'Someone',
        mainJob: component.worker.mainJob,
        otherJobRole: component.worker.otherJobs,
        contract: 'Permanent',
      });

      // expect(submitSpy).toHaveBeenCalledWith({ action: 'continue', save: true });
      // expect(workerSpy).toHaveBeenCalledWith(component.workplace.uid, component.worker.uid, {
      //   dateOfBirth: '1993-06-11',
      // });
      // expect(routerSpy).toHaveBeenCalledWith([
      //   '/workplace',
      //   'mocked-uid',
      //   'staff-record',
      //   fixture.componentInstance.worker.uid,
      //   'national-insurance-number',
      // ]);
    });

    xit('should be able to submit when given correct data', async () => {
      const { component, fixture, getByText } = await setup(false);
      component.insideFlow = true;
      const submitSpy = spyOn(component, 'onSubmit');
      const submit = getByText('Save this staff record');
      submit.click();
      fixture.detectChanges();
      expect(submitSpy).toHaveBeenCalled();
    });

    it('should be able to pass validation when given correct data', async () => {
      const { component, fixture, getByText } = await setup(false);
      const form = component.form;
      component.insideFlow;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('1');
      form.controls.contract.setValue('Permanent');
      fixture.detectChanges();
      expect(form.valid).toBeTruthy();

      fireEvent.click(getByText('Save this staff record'));

      // expect(workerSpy).toHaveBeenCalled();
    });

    it('should be able to fail validation when given wrong data', async () => {
      const { component } = await setup();
      const form = component.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');
      expect(form.valid).toBeFalsy();
    });
  });

  describe('job logic', () => {
    it('should see other job when not chosen other job', async () => {
      const { component, fixture } = await setup();
      const form = component.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('3');
      form.controls.contract.setValue('Permanent');
      const contractSelect = fixture.nativeElement.querySelector('#mainJob');
      contractSelect.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      const otherjob = fixture.nativeElement.querySelector('#otherJobRole-conditional');
      expect(otherjob).toBeTruthy();
    });

    it('should not see other job when not chosen other job type', async () => {
      const { component, fixture } = await setup();
      const form = component.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');
      const contractSelect = fixture.nativeElement.querySelector('#mainJob');
      contractSelect.dispatchEvent(new Event('change'));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.govuk-select__conditional--hidden')).toBeTruthy();
    });
  });

  fdescribe('navigation', () => {
    it('Should navigate to mandatory details when inside the staff recruitment flow and creating a new staff record', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      component.editFlow = false;

      const form = component.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      component.canReturn = false;
      fixture.detectChanges();

      const saveButton = getByText('Save this staff record');

      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'mandatory-details',
      ]);
    });

    it('Should navigate to staff-record-summary when being edited from the staff-record-summary', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      const form = component.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      component.canReturn = true;
      fixture.detectChanges();

      const saveButton = getByText('Save and return');

      fireEvent.click(saveButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('Should navigate to staff-record tab when adding a new record is cancelled and account is parent', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      component.isPrimaryAccount = true;
      component.canReturn = false;
      fixture.detectChanges();

      const cancelButton = getByText('Cancel');

      fireEvent.click(cancelButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
    });

    it('Should navigate to subsidary staff-record tab when adding a new record is cancelled as a subsidary', async () => {
      const { component, fixture, getByText, routerSpy } = await setup(false);

      component.isPrimaryAccount = false;

      const workplaceId = component.workplace.uid;

      component.canReturn = false;
      fixture.detectChanges();

      const cancelButton = getByText('Cancel');

      fireEvent.click(cancelButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId], { fragment: 'staff-records' });
    });

    it('Should navigate to mandatory details when editing a new record from mandatory details page', async () => {
      const { component, fixture, getByText, routerSpy } = await setup();

      component.editFlow = true;
      component.inMandatoryDetailsFlow = true;

      const form = component.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');

      const workerId = component.worker.uid;
      const workplaceId = component.workplace.uid;

      component.canReturn = true;
      fixture.detectChanges();
      const cancelButton = getByText('Save and return');

      fireEvent.click(cancelButton);
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'mandatory-details',
      ]);
    });
  });
});
