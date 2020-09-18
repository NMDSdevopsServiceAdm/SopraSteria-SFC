import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { Establishment } from '@core/model/establishment.model';
import { AuthService } from '@core/services/auth.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { JobService } from '@core/services/job.service';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { WindowRef } from '@core/services/window.ref';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockJobService } from '@core/test-utils/MockJobService';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { SharedModule } from '@shared/shared.module';
import { render } from '@testing-library/angular';

import { StaffDetailsComponent } from './staff-details.component';

const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

describe('StaffDetailsComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.random.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });

  async function setup(isAdmin = true, subsidiaries = 0) {
    const establishment = establishmentBuilder() as Establishment;
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
          useFactory: MockUserService.factory(subsidiaries, isAdmin),
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
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              url: [{ path: 1 }, { path: 2 }],
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

    return {
      component,
      establishmentService,
      router,
    };
  }

  it('should render a StaffDetails', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

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
