import { StaffDetailsComponent } from './staff-details.component';
import { render, within } from '@testing-library/angular';
import { SharedModule } from '@shared/shared.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { WindowRef } from '@core/services/window.ref';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { UserService } from '@core/services/user.service';
import { MockPermissionsService } from '@core/test-utils/MockPermissionsService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { HttpClient } from '@angular/common/http';
import { EstablishmentService } from '@core/services/establishment.service';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { getTestBed } from '@angular/core/testing';
import { AuthService } from '@core/services/auth.service';
import { MockAuthService } from '@core/test-utils/MockAuthService';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Establishment } from '@core/model/establishment.model';
import { Worker } from '@core/model/worker.model';
import { oneOf } from '@jackfranklin/test-data-bot/build';
import { JobService } from '@core/services/job.service';
import { MockJobService } from '@core/test-utils/MockJobService';
import { Contracts } from '@core/model/contracts.enum';
const { build, fake, sequence, perBuild, } = require('@jackfranklin/test-data-bot');



describe('StaffDetailsComponent', () => {
  const establishmentBuilder = build('Establishment', {
    fields: {
      id: sequence(),
      uid: fake((f) => f.random.uuid()),
      nameOrId: fake((f) => f.lorem.sentence()),
    },
  });
  const workerBuilder = build('Worker', {
  fields: {
    id: sequence(),
    uid: fake((f) => f.random.uuid()),
    nameOrId: fake((f) => f.name.findName()),
    mainJob: perBuild(() => {
      return {
        id: sequence(),
        title: fake((f) => f.lorem.sentence()),
      };
    }),
    contract: oneOf('Permanent', 'Temporary', 'Pool/Bank', 'Agency', 'Other')
  },
});

  async function setup(isAdmin = true, subsidiaries = 0) {
    const establishment = establishmentBuilder() as Establishment;
    const component = await render(StaffDetailsComponent, {
        imports: [
          SharedModule,
          RouterModule,
          RouterTestingModule,
          HttpClientTestingModule,
          FormsModule,
          ReactiveFormsModule,
        ],
        declarations: [],
        providers: [
          {
            provide: WindowRef,
            useClass: WindowRef
          },
          {
            provide: Contracts,
            useClass: Contracts
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
            useClass: MockEstablishmentService
          },
          {
            provide: JobService,
            useClass: MockJobService
          },
          {
            provide: AuthService,
            useClass: MockAuthService
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
                    url: [{ path: 'staff-record' }],
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

    const injector = getTestBed();
    const establishmentService = injector.get(EstablishmentService) as EstablishmentService;
    const router = injector.get(Router) as Router;

    return {
      component,
      establishmentService,
      router
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
    form.controls['nameOrId'].setValue('Jeff');
    form.controls['mainJob'].setValue('1');
    form.controls['contract'].setValue('Permanent');
    expect(form.valid).toBeTruthy();
  });
  it('should be able to fail validation when given wrong data', async () => {
    const { component } = await setup();
    const form = component.fixture.componentInstance.form;
    form.controls['nameOrId'].setValue('');
    form.controls['mainJob'].setValue('');
    form.controls['contract'].setValue('');
    expect(form.valid).toBeFalsy();
  });

});

