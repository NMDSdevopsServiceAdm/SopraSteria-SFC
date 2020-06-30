import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Contracts } from '@core/model/contracts.enum';
import { DataSharingOptions } from '@core/model/data-sharing.model';
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

import { TotalStaffQuestionComponent } from './total-staff-question.component';

const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

describe('TotalStaffQuestionComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.random.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });


  // async function setup(share: Share = null, isAdmin = true, subsidiaries = 0) {
  async function setup(share: any = null, isAdmin = true, subsidiaries = 0) {

    const establishment = establishmentBuilder() as Establishment;

    const component = await render(TotalStaffQuestionComponent, {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule,
          HttpClientTestingModule,
        ],
        declarations: [],
        schemas: [ NO_ERRORS_SCHEMA ],
        providers: [
          FormBuilder,
          {
            provide: WindowRef,
            useValue: WindowRef
          },
          {
            provide: Contracts,
            useValue: Contracts
          },
          {
            provide: PermissionsService,
            useFactory: MockPermissionsService.factory(),
            deps: [HttpClient, Router, UserService]
          },
          {
            provide: UserService,
            useFactory: MockUserService.factory(subsidiaries, isAdmin),
            deps: [HttpClient]
          },
          {
            provide: EstablishmentService,
            useFactory: MockEstablishmentService.factory(share),
            deps: [HttpClient]
          },
          {
            provide: JobService,
            useValue: MockJobService
          },
          {
            provide: AuthService,
            useValue: MockAuthService
          },
          {
            provide: ActivatedRoute,
            useValue:
              {
                snapshot:
                  {
                    url: [{ path: 1 }, { path: 2 }]
                  },
                parent: {
                  snapshot: {
                    url: [{ path: 'workplace' }],
                    data: {
                      establishment,
                      primaryWorkplace: establishment
                    }
                  }

                }
              }
          }
        ]
      })
    ;

    return {
      component
    };
  }

  it('should render a TotalStaff component', async () => {
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
    form.controls.totalStaff.setValue('10');
    expect(form.valid).toBeTruthy();
  });

  it('validates input is required', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.totalStaff.setValue('');
    expect(form.valid).toBeFalsy();
  });

  it('validates input is a digit', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.totalStaff.setValue('x');
    expect(form.valid).toBeFalsy();
  });

  it('validates input is an integer', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.totalStaff.setValue('1.2');
    expect(form.valid).toBeFalsy();
  });

  it('validates input is positive', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.totalStaff.setValue('-10');
    expect(form.valid).toBeFalsy();
  });

  it('validates input is greater than or equal to 0', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.totalStaff.setValue('0');
    expect(form.valid).toBeTruthy();
  });

  it('validates input can be equal to 999', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.totalStaff.setValue('999');
    expect(form.valid).toBeTruthy();
  });

  it('validates input is less than or equal to 999', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls.totalStaff.setValue('1000');
    expect(form.valid).toBeFalsy();
  });

  it('should return to normal data sharing page if no data sharing options and you click on the back link', async () => {
    const share: any = { enabled: false, with: [] };
    const { component } = await setup(share);
    expect(component.fixture.componentInstance.previousRoute).toEqual(['/workplace', `${component.fixture.componentInstance.establishment.uid}`, 'sharing-data']);
  });

  it('should return to data sharing page with LA if sharing options are LA and you click on the back link', async () => {
    const share: any = { enabled: true, with: [DataSharingOptions.LOCAL] };
    const { component } = await setup(share);
    expect(component.fixture.componentInstance.previousRoute).toEqual(['/workplace', `${component.fixture.componentInstance.establishment.uid}`, 'sharing-data-with-local-authorities']);
  });

  it('should go on to vacancies page if you click submit', async () => {
    const { component } = await setup();
    expect(component.fixture.componentInstance.nextRoute).toEqual(['/workplace', `${component.fixture.componentInstance.establishment.uid}`, 'vacancies']);
  });
});

