import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter, Router, RouterModule } from '@angular/router';
import { BackService } from '@core/services/back.service';
import { BreadcrumbService } from '@core/services/breadcrumb.service';
import { CreateAccountService } from '@core/services/create-account/create-account.service';
import { ErrorSummaryService } from '@core/services/error-summary.service';
import { EstablishmentService } from '@core/services/establishment.service';
import { UserService } from '@core/services/user.service';
import { MockBreadcrumbService } from '@core/test-utils/MockBreadcrumbService';
import { MockEstablishmentService } from '@core/test-utils/MockEstablishmentService';
import { MockFeatureFlagsService } from '@core/test-utils/MockFeatureFlagService';
import { MockUserService } from '@core/test-utils/MockUserService';
import { FeatureFlagsService } from '@shared/services/feature-flags.service';
import { SharedModule } from '@shared/shared.module';
import { fireEvent, render } from '@testing-library/angular';
import { of } from 'rxjs';

import { UserAccountSavedComponent } from '../user-account-saved/user-account-saved.component';
import { CreateUserAccountComponent } from './create-user-account.component';

describe('CreateUserAccountComponent', () => {
  async function setup() {
    const setupTools = await render(CreateUserAccountComponent, {
      imports: [SharedModule, RouterModule, FormsModule, ReactiveFormsModule],
      providers: [
        ErrorSummaryService,
        BackService,
        UntypedFormBuilder,
        CreateAccountService,
        { provide: BreadcrumbService, useClass: MockBreadcrumbService },
        { provide: FeatureFlagsService, useClass: MockFeatureFlagsService },
        {
          provide: UserService,
          useClass: MockUserService,
        },
        provideRouter([{ path: 'workplace/c131232132ab/user/saved/testuid', component: UserAccountSavedComponent }]),
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { data: { establishment: {} }, params: { establishmentuid: 'c131232132ab' } } },
          },
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    const component = setupTools.fixture.componentInstance;

    const injector = getTestBed();
    const createAccountService = injector.inject(CreateAccountService) as CreateAccountService;

    const createAccountSpy = spyOn(createAccountService, 'createAccount').and.returnValue(
      of({
        uid: 'testuid',
        establishmentId: 1234,
        establishmentUid: 'testuid',
        message: 'Good job',
        nmdsId: 'C1313213123',
        status: 500,
      }),
    );

    const router = injector.inject(Router) as Router;
    const routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    setUserInfoFields(component);

    return {
      ...setupTools,
      component,
      createAccountSpy,
      routerSpy,
    };
  }

  const setUserInfoFields = (component) => {
    component.form.get('fullname').setValue('Bob Bobson');
    component.form.get('fullname').markAsDirty();

    component.form.get('jobTitle').setValue('Care Giver');
    component.form.get('jobTitle').markAsDirty();

    component.form.get('email').setValue('bob@email.com');
    component.form.get('email').markAsDirty();

    component.form.get('phone').setValue('01822213131');
    component.form.get('phone').markAsDirty();
  };

  it('should render CreateUserAccountComponent', async () => {
    const { component } = await setup();
    expect(component).toBeTruthy();
  });

  it('should call createAccount with user info entered', async () => {
    const { fixture, getByText, createAccountSpy } = await setup();

    fixture.detectChanges();
    await fixture.whenStable();
    const radioButton = getByText('Edit');
    fireEvent.click(radioButton);

    const saveButton = getByText('Save user');
    fireEvent.click(saveButton);

    expect(createAccountSpy.calls.mostRecent().args[1].email).toEqual('bob@email.com');
    expect(createAccountSpy.calls.mostRecent().args[1].jobTitle).toEqual('Care Giver');
    expect(createAccountSpy.calls.mostRecent().args[1].fullname).toEqual('Bob Bobson');
    expect(createAccountSpy.calls.mostRecent().args[1].phone).toEqual('01822213131');
  });

  it('should call createAccount with role Edit', async () => {
    const { fixture, getByText, createAccountSpy } = await setup();

    fixture.detectChanges();
    await fixture.whenStable();
    const radioButton = getByText('Edit');
    fireEvent.click(radioButton);

    const saveButton = getByText('Save user');
    fireEvent.click(saveButton);

    expect(createAccountSpy.calls.mostRecent().args[1].role).toEqual('Edit');
  });

  it('should call createAccount with role Read', async () => {
    const { fixture, getByText, createAccountSpy } = await setup();

    fixture.detectChanges();
    await fixture.whenStable();
    const radioButton = getByText('Read');
    fireEvent.click(radioButton);

    const saveButton = getByText('Save user');
    fireEvent.click(saveButton);

    expect(createAccountSpy.calls.mostRecent().args[1].role).toEqual('Read');
  });

  it('should call router to navigate after saving user', async () => {
    const { component, fixture, getByText, routerSpy } = await setup();

    fixture.detectChanges();
    await fixture.whenStable();

    const radioButton = getByText('Edit');
    fireEvent.click(radioButton);

    const saveButton = getByText('Save user');
    fireEvent.click(saveButton);

    expect(routerSpy).toHaveBeenCalledWith(['/workplace', component.establishmentUid, 'user', 'saved', 'testuid']);
  });
});
