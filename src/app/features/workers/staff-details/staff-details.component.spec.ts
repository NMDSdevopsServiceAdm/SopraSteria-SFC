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
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';

import { StaffDetailsComponent } from './staff-details.component';

describe('StaffDetailsComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.datatype.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });

  async function setup(returnUrl = true) {
    const establishment = establishmentBuilder();
    const component = await render(StaffDetailsComponent, {
      imports: [SharedModule, RouterModule, RouterTestingModule, HttpClientTestingModule],
      declarations: [],
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
    const injector = getTestBed();
    const establishmentService = injector.inject(EstablishmentService) as EstablishmentService;
    const router = injector.inject(Router) as Router;

    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    return {
      component,
      establishmentService,
      router,
      routerSpy,
    };
  }

  it('should render a StaffDetails', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  describe('submit buttons', () => {
    it(`should show 'Save staff record' cta button and 'Cancel' link when adding a staff record`, async () => {
      const { component } = await setup(false);

      component.fixture.componentInstance.canReturn = false;
      component.fixture.detectChanges();

      expect(component.getByText('Save this staff record')).toBeTruthy();
      expect(component.getByText('Cancel')).toBeTruthy();
    });

    it(`should show 'Save and return' cta button and 'Cancel' link when editing a staff record`, async () => {
      const { component } = await setup();

      expect(component.getByText('Save and return')).toBeTruthy();
      expect(component.getByText('Cancel')).toBeTruthy();
    });
  });

  describe('progress bar', () => {
    it('should render the progress bar when accessed from the flow', async () => {
      const { component } = await setup();

      component.fixture.componentInstance.insideFlow = true;
      component.fixture.detectChanges();

      expect(component.getByTestId('progress-bar-1')).toBeTruthy();
    });

    it('should not render the progress bar when accessed from outside the flow', async () => {
      const { component } = await setup(false);

      component.fixture.componentInstance.insideFlow = false;
      component.fixture.detectChanges();

      expect(component.queryByTestId('progress-bar-1')).toBeFalsy();
    });
  });

  describe('submission and validation', () => {
    it('should be able to submit when given correct data', async () => {
      const { component } = await setup();
      component.fixture.detectChanges();
      spyOn(component.fixture.componentInstance, 'onSubmit');
      const submit = component.fixture.nativeElement.querySelector('button[type="submit"]');
      submit.click();
      expect(component.fixture.componentInstance.onSubmit).toHaveBeenCalled();
    });

    it('should set submitted to true', async () => {
      const { component } = await setup();
      component.fixture.detectChanges();
      component.fixture.componentInstance.onSubmit();
      expect(component.fixture.componentInstance.submitted).toBeTruthy();
    });

    it('should be able to pass validation when given correct data', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('1');
      form.controls.contract.setValue('Permanent');
      expect(form.valid).toBeTruthy();
    });

    it('should be able to fail validation when given wrong data', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      form.controls.nameOrId.setValue('');
      form.controls.mainJob.setValue('');
      form.controls.contract.setValue('');
      expect(form.valid).toBeFalsy();
    });
  });

  describe('job logic', () => {
    it('should see other job when not chosen other job', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('3');
      form.controls.contract.setValue('Permanent');
      const contractSelect = component.fixture.nativeElement.querySelector('#mainJob');
      contractSelect.dispatchEvent(new Event('change'));
      component.fixture.detectChanges();
      const otherjob = component.fixture.nativeElement.querySelector('#otherJobRole-conditional');
      expect(otherjob).toBeTruthy();
    });

    it('should not see other job when not chosen other job type', async () => {
      const { component } = await setup();
      const form = component.fixture.componentInstance.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');
      const contractSelect = component.fixture.nativeElement.querySelector('#mainJob');
      contractSelect.dispatchEvent(new Event('change'));
      component.fixture.detectChanges();
      expect(component.fixture.nativeElement.querySelector('.govuk-select__conditional--hidden')).toBeTruthy();
    });
  });

  describe('navigation', () => {
    it('Should navigate to mandatory details when inside the staff recruitment flow and creating a new staff record', async () => {
      const { component, routerSpy } = await setup(false);

      component.fixture.componentInstance.editFlow = false;

      const form = component.fixture.componentInstance.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');

      const workerId = component.fixture.componentInstance.worker.uid;
      const workplaceId = component.fixture.componentInstance.workplace.uid;

      component.fixture.componentInstance.canReturn = false;
      component.fixture.detectChanges();

      const saveButton = component.getByText('Save this staff record');

      fireEvent.click(saveButton);
      component.fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'mandatory-details',
      ]);
    });

    it('Should navigate to staff-record-summary when being edited from the staff-record-summary', async () => {
      const { component, routerSpy } = await setup();

      const form = component.fixture.componentInstance.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');

      const workerId = component.fixture.componentInstance.worker.uid;
      const workplaceId = component.fixture.componentInstance.workplace.uid;

      component.fixture.componentInstance.canReturn = true;
      component.fixture.detectChanges();

      const saveButton = component.getByText('Save and return');

      fireEvent.click(saveButton);
      component.fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith([
        '/workplace',
        workplaceId,
        'staff-record',
        workerId,
        'staff-record-summary',
      ]);
    });

    it('Should navigate to staff-record tab when adding a new record is cancelled and account is parent', async () => {
      const { component, routerSpy } = await setup(false);

      component.fixture.componentInstance.isPrimaryAccount = true;
      component.fixture.componentInstance.canReturn = false;
      component.fixture.detectChanges();

      const cancelButton = component.getByText('Cancel');

      fireEvent.click(cancelButton);
      component.fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/dashboard'], { fragment: 'staff-records' });
    });

    it('Should navigate to subsidary staff-record tab when adding a new record is cancelled as a subsidary', async () => {
      const { component, routerSpy } = await setup(false);

      component.fixture.componentInstance.isPrimaryAccount = false;

      const workplaceId = component.fixture.componentInstance.workplace.uid;

      component.fixture.componentInstance.canReturn = false;
      component.fixture.detectChanges();

      const cancelButton = component.getByText('Cancel');

      fireEvent.click(cancelButton);
      component.fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/workplace', workplaceId], { fragment: 'staff-records' });
    });

    it('Should navigate to mandatory details when editing a new record from mandatory details page', async () => {
      const { component, routerSpy } = await setup();

      component.fixture.componentInstance.editFlow = true;
      component.fixture.componentInstance.inMandatoryDetailsFlow = true;

      const form = component.fixture.componentInstance.form;
      form.controls.nameOrId.setValue('Jeff');
      form.controls.mainJob.setValue('2');
      form.controls.contract.setValue('Permanent');

      const workerId = component.fixture.componentInstance.worker.uid;
      const workplaceId = component.fixture.componentInstance.workplace.uid;

      component.fixture.componentInstance.canReturn = true;
      component.fixture.detectChanges();
      const cancelButton = component.getByText('Save and return');

      fireEvent.click(cancelButton);
      component.fixture.detectChanges();

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
