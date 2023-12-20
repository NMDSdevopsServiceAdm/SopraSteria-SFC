import { HttpClientTestingModule } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
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
    const { fixture, getByText } = await render(CreateUserAccountComponent, {
      imports: [
        SharedModule,
        RouterModule,
        RouterTestingModule.withRoutes([
          { path: 'workplace/c131232132ab/user/saved/testuid', component: UserAccountSavedComponent },
        ]),
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
      ],
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
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { data: { establishment: {} }, params: { establishmentuid: 'c131232132ab' } } },
          },
        },
        { provide: EstablishmentService, useClass: MockEstablishmentService },
      ],
    });

    const component = fixture.componentInstance;

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

    setUserInfoFields(component);

    return {
      fixture,
      component,
      createAccountSpy,
      getByText,
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

  describe('Calling createAccount in user service', async () => {
    it('should call createAccount with user info entered', async () => {
      const { fixture, getByText, createAccountSpy } = await setup();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const radioButton = getByText('ASC-WDS edit with manage WDF claims');
        fireEvent.click(radioButton);

        const saveButton = getByText('Save user');
        fireEvent.click(saveButton);

        expect(createAccountSpy.calls.mostRecent().args[1].email).toEqual('bob@email.com');
        expect(createAccountSpy.calls.mostRecent().args[1].jobTitle).toEqual('Care Giver');
        expect(createAccountSpy.calls.mostRecent().args[1].fullname).toEqual('Bob Bobson');
        expect(createAccountSpy.calls.mostRecent().args[1].phone).toEqual('01822213131');
      });
    });

    describe('Permissions types', async () => {
      it('should call createAccount with role Edit and canManageWdfClaims true when ASC-WDS edit with manage WDF claims selected', async () => {
        const { fixture, getByText, createAccountSpy } = await setup();

        fixture.detectChanges();
        fixture.whenStable().then(() => {
          const radioButton = getByText('ASC-WDS edit with manage WDF claims');
          fireEvent.click(radioButton);

          const saveButton = getByText('Save user');
          fireEvent.click(saveButton);

          expect(createAccountSpy.calls.mostRecent().args[1].role).toEqual('Edit');
          expect(createAccountSpy.calls.mostRecent().args[1].canManageWdfClaims).toEqual(true);
        });
      });
    });

    it('should call createAccount with role Edit and canManageWdfClaims false when ASC-WDS edit selected', async () => {
      const { fixture, getByText, createAccountSpy } = await setup();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const radioButton = getByText('ASC-WDS edit');
        fireEvent.click(radioButton);

        const saveButton = getByText('Save user');
        fireEvent.click(saveButton);

        expect(createAccountSpy.calls.mostRecent().args[1].role).toEqual('Edit');
        expect(createAccountSpy.calls.mostRecent().args[1].canManageWdfClaims).toEqual(false);
      });
    });

    it('should call createAccount with role Read and canManageWdfClaims true when ASC-WDS read only with manage WDF claims selected', async () => {
      const { fixture, getByText, createAccountSpy } = await setup();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const radioButton = getByText('ASC-WDS read only with manage WDF claims');
        fireEvent.click(radioButton);

        const saveButton = getByText('Save user');
        fireEvent.click(saveButton);

        expect(createAccountSpy.calls.mostRecent().args[1].role).toEqual('Read');
        expect(createAccountSpy.calls.mostRecent().args[1].canManageWdfClaims).toEqual(true);
      });
    });

    it('should call createAccount with role Read and canManageWdfClaims false when ASC-WDS read only selected', async () => {
      const { fixture, getByText, createAccountSpy } = await setup();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const radioButton = getByText('ASC-WDS read only');
        fireEvent.click(radioButton);

        const saveButton = getByText('Save user');
        fireEvent.click(saveButton);

        expect(createAccountSpy.calls.mostRecent().args[1].role).toEqual('Read');
        expect(createAccountSpy.calls.mostRecent().args[1].canManageWdfClaims).toEqual(false);
      });
    });

    it('should call createAccount with role None and canManageWdfClaims true when Manage WDF claims only selected', async () => {
      const { fixture, getByText, createAccountSpy } = await setup();

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        const radioButton = getByText('Manage WDF claims only');
        fireEvent.click(radioButton);

        const saveButton = getByText('Save user');
        fireEvent.click(saveButton);

        expect(createAccountSpy.calls.mostRecent().args[1].role).toEqual('None');
        expect(createAccountSpy.calls.mostRecent().args[1].canManageWdfClaims).toEqual(true);
      });
    });
  });
});
